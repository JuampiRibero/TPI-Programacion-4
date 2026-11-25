from sqlmodel import SQLModel

from app.modules.usuarios.schemas import UserCreate, UserPublic

__all__ = ["MensajeRespuesta", "UserCreate", "UserPublic"]


class MensajeRespuesta(SQLModel):
    message: str
