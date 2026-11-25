from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    _admin: Usuario = Depends(require_role(["admin"])),  # noqa: B008
    service: UsuarioService = Depends(get_usuario_service),  # noqa: B008
) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    _admin: Usuario = Depends(require_role(["admin"])),  # noqa: B008
    service: UsuarioService = Depends(get_usuario_service),  # noqa: B008
) -> UserPublic:
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(require_role(["admin"])),  # noqa: B008
    service: UsuarioService = Depends(get_usuario_service),  # noqa: B008
) -> UserPublic:
    assert admin.id is not None
    return service.desactivar(usuario_id, admin.id)
