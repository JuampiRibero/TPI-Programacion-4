from collections.abc import Sequence
from datetime import datetime

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def _listar(
        self, *, usuario_id: int | None, estado: str | None, skip: int, limit: int
    ) -> tuple[int, Sequence[Pedido]]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        items = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return total, items

    def list_by_usuario(
        self, usuario_id: int, *, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, Sequence[Pedido]]:
        return self._listar(usuario_id=usuario_id, estado=estado, skip=skip, limit=limit)

    def list_all(
        self, *, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, Sequence[Pedido]]:
        return self._listar(usuario_id=None, estado=estado, skip=skip, limit=limit)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_por_estado(self, estado: str) -> float:
        suma = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == estado)
        ).one()
        return float(suma)
