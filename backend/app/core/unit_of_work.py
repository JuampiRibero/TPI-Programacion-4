from collections.abc import Callable

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    session: Session

    def __init__(
        self, session_factory: Callable[[], Session] = default_session_factory
    ) -> None:
        self._session_factory = session_factory

    def __enter__(self):  # type: ignore[no-untyped-def]
        self.session = self._session_factory()
        self._init_repositories(self.session)
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool | None:  # type: ignore[no-untyped-def]
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False  # Nunca suprime la excepción.

    def _init_repositories(self, session: Session) -> None:
        """Las subclases crean aquí sus repositorios sobre la misma sesión."""
