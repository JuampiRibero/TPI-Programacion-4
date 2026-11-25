from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, get_current_active_user
from app.modules.auth.schemas import MensajeRespuesta
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(datos: UserCreate, service: AuthService = Depends(get_auth_service)) -> UserPublic:  # noqa: B008
    return service.registrar(datos)


@router.post("/token", response_model=MensajeRespuesta)
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),  # noqa: B008
    service: AuthService = Depends(get_auth_service),  # noqa: B008
) -> MensajeRespuesta:
    token = service.autenticar(form.username, form.password)
    # El token viaja solo en la cookie HttpOnly; nunca en el cuerpo de la respuesta.
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Poner True detrás de HTTPS en producción.
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post("/logout", response_model=MensajeRespuesta)
def logout(response: Response) -> MensajeRespuesta:
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return MensajeRespuesta(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: Usuario = Depends(get_current_active_user)) -> UserPublic:  # noqa: B008
    return UserPublic.model_validate(usuario)
