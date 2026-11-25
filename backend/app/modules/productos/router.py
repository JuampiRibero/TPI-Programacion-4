from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Búsqueda por nombre (sin distinguir mayúsculas)"),
    categoria_id: int | None = None,
    disponible: bool | None = None,
    service: ProductoService = Depends(get_producto_service),  # noqa: B008
) -> ProductosPaginados:
    return service.listar(
        search=search, categoria_id=categoria_id, disponible=disponible, skip=skip, limit=limit
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int, service: ProductoService = Depends(get_producto_service)  # noqa: B008
) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc))


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    datos: ProductoCreate,
    _admin: Usuario = Depends(require_role(["admin"])),  # noqa: B008
    service: ProductoService = Depends(get_producto_service),  # noqa: B008
) -> ProductoRead:
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc))


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    _admin: Usuario = Depends(require_role(["admin"])),  # noqa: B008
    service: ProductoService = Depends(get_producto_service),  # noqa: B008
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc))


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    _admin: Usuario = Depends(require_role(["admin"])),  # noqa: B008
    service: ProductoService = Depends(get_producto_service),  # noqa: B008
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc))


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    _admin: Usuario = Depends(require_role(["admin"])),  # noqa: B008
    service: ProductoService = Depends(get_producto_service),  # noqa: B008
) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
