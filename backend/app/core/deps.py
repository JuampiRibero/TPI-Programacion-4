from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import select

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

COOKIE_NAME = "access_token"


def get_current_user(
    access_token: str | None = Cookie(default=None),
) -> Usuario:
    """401 si falta la cookie o el token es inválido/venció, o el usuario ya no existe."""
    no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
    )
    if not access_token:
        raise no_autenticado
    payload = decode_access_token(access_token)
    username = payload.get("sub") if payload else None
    if not isinstance(username, str):
        raise no_autenticado
    with session_factory() as session:
        usuario = session.exec(
            select(Usuario).where(Usuario.username == username)
        ).first()
    if usuario is None:
        raise no_autenticado
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:  # noqa: B008
    """400 si la cuenta está desactivada."""
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada"
        )
    return usuario


def require_role(roles: list[str]) -> Callable[..., Usuario]:
    """403 si el rol del usuario no está permitido."""

    def _verificar(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:  # noqa: B008
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return usuario

    return _verificar
