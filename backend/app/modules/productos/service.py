from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

__all__ = ["CategoriaNoEncontrada", "ProductoNoEncontrado", "ProductoService"]


class ProductoNoEncontrado(Exception):
    """404"""


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        *,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
                skip=skip,
                limit=limit,
            )
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in items]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo_o_error(uow, producto_id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._categoria_activa_o_error(uow, datos.categoria_id)
            producto = Producto(**datos.model_dump())
            uow.productos.add(producto)
            uow.productos.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        """Actualización parcial: solo cambia los campos enviados."""
        with self.uow as uow:
            producto = self._activo_o_error(uow, producto_id)
            cambios = datos.model_dump(exclude_unset=True)
            # Los campos obligatorios no aceptan null; descripcion e imagen_url sí.
            cambios = {
                k: v for k, v in cambios.items() if v is not None or k in ("descripcion", "imagen_url")
            }
            nueva_categoria = cambios.get("categoria_id")
            if nueva_categoria is not None and nueva_categoria != producto.categoria_id:
                self._categoria_activa_o_error(uow, nueva_categoria)
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            uow.productos.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo_o_error(uow, producto_id)
            if datos.stock is not None:
                producto.stock = datos.stock
            if datos.disponible is not None:
                producto.disponible = datos.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: activo = false."""
        with self.uow as uow:
            producto = self._activo_o_error(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)

    @staticmethod
    def _activo_o_error(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(f"Producto {producto_id} no encontrado")
        return producto

    @staticmethod
    def _categoria_activa_o_error(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"Categoría {categoria_id} no encontrada")
