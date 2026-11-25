from datetime import UTC, datetime


def utcnow() -> datetime:
    """Devuelve la fecha y hora actual en UTC con información de zona horaria."""
    return datetime.now(UTC)