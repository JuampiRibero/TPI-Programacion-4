from app.core.utils import utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

__all__ = [
    "TRANSICIONES",
    "PedidoAjeno",
    "PedidoError",
    "PedidoNoEncontrado",
    "PedidoService",
    "ProductoNoDisponible",
    "ProductoNoEncontrado",
    "ProductoRepetido",
    "StockInsuficiente",
    "TransicionInvalida",
]


# Excepciones de dominio
class PedidoError(Exception):
    """Base de las excepciones del módulo de pedidos."""


class PedidoNoEncontrado(PedidoError):
    """404"""


class PedidoAjeno(PedidoError):
    """403"""


class StockInsuficiente(PedidoError):
    """400"""


class ProductoNoDisponible(PedidoError):
    """400"""


class ProductoRepetido(PedidoError):
    """400"""


class TransicionInvalida(PedidoError):
    """400"""


# Máquina de estados (RN-02)
TRANSICIONES: dict[str, set[str]] = {
    EstadoPedido.PENDIENTE.value: {
        EstadoPedido.EN_PREPARACION.value,
        EstadoPedido.CANCELADO.value,
    },
    EstadoPedido.EN_PREPARACION.value: {
        EstadoPedido.ENTREGADO.value,
        EstadoPedido.CANCELADO.value,
    },
    EstadoPedido.ENTREGADO.value: set(),  # terminal
    EstadoPedido.CANCELADO.value: set(),  # terminal
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # RN-01
    def crear(self, datos: PedidoCreate, usuario: Usuario) -> PedidoRead:
        """Crea el pedido, descuenta stock y copia nombre/precio en cada línea,
        todo en una sola transacción: si algo falla, no se persiste nada."""
        assert usuario.id is not None
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(set(ids)) != len(ids):
                raise ProductoRepetido("No se puede repetir un producto entre los ítems")

            pedido = Pedido(
                usuario_id=usuario.id,
                forma_pago=datos.forma_pago.value,
                direccion_entrega=datos.direccion_entrega.strip(),
                notas=datos.notas,
                estado=EstadoPedido.PENDIENTE.value,
                total=0.0,
            )
            uow.pedidos.add(pedido)
            assert pedido.id is not None

            total = 0.0
            for item in datos.items:
                # With_for_update evita que dos pedidos simultáneos vendan el mismo stock.
                producto = uow.productos.get_by_id(item.producto_id, with_for_update=True)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"«{producto.nombre}» no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para «{producto.nombre}»: "
                        f"quedan {producto.stock} y pediste {item.cantidad}"
                    )
                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                assert producto.id is not None
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia (RN-05)
                        precio_unitario=producto.precio_base,  # copia (RN-05)
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            uow.pedidos.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    # Lecturas
    def listar(
        self, usuario: Usuario, *, estado: EstadoPedido | None, skip: int, limit: int
    ) -> PedidosPaginados:
        """RN-04: el cliente ve solo sus pedidos; el admin ve todos."""
        assert usuario.id is not None
        filtro_estado = estado.value if estado else None
        with self.uow as uow:
            if usuario.role == "admin":
                total, items = uow.pedidos.list_all(estado=filtro_estado, skip=skip, limit=limit)
            else:
                total, items = uow.pedidos.list_by_usuario(
                    usuario.id, estado=filtro_estado, skip=skip, limit=limit
                )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_o_error(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Este pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            inicio_del_dia = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=por_estado.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=por_estado.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=por_estado.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia),
                ingresos_entregados=uow.pedidos.sum_total_por_estado(EstadoPedido.ENTREGADO.value),
            )

    # RN-02 / RN-03 / RN-04
    def cambiar_estado(self, pedido_id: int, nuevo_estado: EstadoPedido) -> PedidoRead:
        """Solo admin. Valida la transición contra el mapa antes de modificar nada."""
        with self.uow as uow:
            pedido = self._obtener_o_error(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo_estado.value)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        """El dueño cancela su propio pedido, solo desde PENDIENTE."""
        with self.uow as uow:
            pedido = self._obtener_o_error(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Este pedido pertenece a otro usuario")
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos en estado PENDIENTE "
                    f"(este está {pedido.estado})"
                )
            self._aplicar_transicion(uow, pedido, EstadoPedido.CANCELADO.value)
            return PedidoRead.model_validate(pedido)

    # Internos
    @staticmethod
    def _obtener_o_error(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(f"Pedido {pedido_id} no encontrado")
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        permitidos = TRANSICIONES.get(pedido.estado, set())
        if nuevo_estado not in permitidos:
            raise TransicionInvalida(
                f"Transición inválida: de {pedido.estado} a {nuevo_estado}"
            )
        if nuevo_estado == EstadoPedido.CANCELADO.value:
            # RN-03: restituir el stock de cada línea en la misma transacción.
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id, with_for_update=True)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo_estado
        pedido.updated_at = utcnow()
        uow.pedidos.add(pedido)
