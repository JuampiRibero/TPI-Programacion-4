from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    def __init__(self, session: Session, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id_: int, *, with_for_update: bool = False) -> ModelT | None:
        return self.session.get(self.model, id_, with_for_update=with_for_update)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[ModelT]:
        return self.session.exec(select(self.model).offset(skip).limit(limit)).all()

    def add(self, entity: ModelT) -> ModelT:
        """Agrega y hace flush (obtiene el id). El commit lo hace el Unit of Work."""
        self.session.add(entity)
        self.session.flush()
        return entity

    def delete(self, entity: ModelT) -> None:
        self.session.delete(entity)
        self.session.flush()

    def refresh(self, entity: ModelT) -> ModelT:
        self.session.flush()
        self.session.refresh(entity)
        return entity
