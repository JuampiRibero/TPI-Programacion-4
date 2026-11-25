from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoError,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _traducir(exc: Exception) -> HTTPException:
    """Excepción de dominio -> HTTPException con el código de la especificación."""
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    if isinstance(exc, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(exc))
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(exc))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    datos: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),  # noqa: B008
    service: PedidoService = Depends(get_pedido_service),  # noqa: B008
) -> PedidoRead:
    try:
        return service.crear(datos, usuario)
    except (PedidoError, ProductoNoEncontrado) as exc:
        raise _traducir(exc)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = None,
    usuario: Usuario = Depends(get_current_active_user),  # noqa: B008
    service: PedidoService = Depends(get_pedido_service),  # noqa: B008
) -> PedidosPaginados:
    return service.listar(usuario, estado=estado, skip=skip, limit=limit)


# IMPORTANTE: /resumen se declara ANTES de /{pedido_id}, o FastAPI lo trataría como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(
    _admin: Usuario = Depends(require_role(["admin"])),  # noqa: B008
    service: PedidoService = Depends(get_pedido_service),  # noqa: B008
) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),  # noqa: B008
    service: PedidoService = Depends(get_pedido_service),  # noqa: B008
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoError as exc:
        raise _traducir(exc)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    pedido_id: int,
    datos: CambioEstado,
    _admin: Usuario = Depends(require_role(["admin"])),  # noqa: B008
    service: PedidoService = Depends(get_pedido_service),  # noqa: B008
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except PedidoError as exc:
        raise _traducir(exc)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),  # noqa: B008
    service: PedidoService = Depends(get_pedido_service),  # noqa: B008
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except PedidoError as exc:
        raise _traducir(exc)
