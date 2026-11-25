from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """404"""


class NombreDuplicado(Exception):
    """409"""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa_o_error(uow, categoria_id)
            return CategoriaRead.model_validate(categoria)

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(datos.nombre) is not None:
                raise NombreDuplicado(f"Ya existe una categoría llamada «{datos.nombre}»")
            categoria = Categoria(nombre=datos.nombre.strip(), descripcion=datos.descripcion)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        """Actualización parcial: solo cambia los campos enviados."""
        with self.uow as uow:
            categoria = self._activa_o_error(uow, categoria_id)
            cambios = datos.model_dump(exclude_unset=True)
            nuevo_nombre = cambios.get("nombre")
            if nuevo_nombre is not None:
                existente = uow.categorias.get_by_nombre(nuevo_nombre)
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado(f"Ya existe una categoría llamada «{nuevo_nombre}»")
                categoria.nombre = nuevo_nombre.strip()
            if "descripcion" in cambios:
                categoria.descripcion = cambios["descripcion"]
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: activo = false. No oculta sus productos ni libera su nombre."""
        with self.uow as uow:
            categoria = self._activa_o_error(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _activa_o_error(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"Categoría {categoria_id} no encontrada")
        return categoria
