from collections.abc import Sequence

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca por nombre sin distinguir mayúsculas; incluye categorías dadas de baja
        (la baja lógica no libera el nombre único)."""
        return self.session.exec(
            select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        ).first()

    def list_activas(self) -> Sequence[Categoria]:
        return self.session.exec(
            select(Categoria).where(col(Categoria.activo).is_(True)).order_by(col(Categoria.nombre))
        ).all()
