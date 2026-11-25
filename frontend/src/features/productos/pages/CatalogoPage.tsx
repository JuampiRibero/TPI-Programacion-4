import { useState } from "react";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const POR_PAGINA = 8;

export function CatalogoPage() {
  const [pagina, setPagina] = useState(1);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const categorias = useCategorias();
  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useProductos({
      skip: (pagina - 1) * POR_PAGINA,
      limit: POR_PAGINA,
      search: busqueda || undefined,
      categoria_id: categoriaId,
    });

  const totalPaginas = data
    ? Math.max(1, Math.ceil(data.total / POR_PAGINA))
    : 1;
  const hayFiltros = busqueda !== "" || categoriaId !== undefined;

  const limpiar = () => {
    setTextoBusqueda("");
    setBusqueda("");
    setCategoriaId(undefined);
    setPagina(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Elegí qué comer hoy
        </h1>
        <p className="mt-1 text-muted">
          Armá tu carrito y lo confirmás con tu dirección.
        </p>
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setBusqueda(textoBusqueda.trim());
          setPagina(1);
        }}
      >
        <input
          type="search"
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          placeholder="Buscar por nombre, por ejemplo «pizza»"
          aria-label="Buscar productos por nombre"
          className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm focus:border-basil-600"
        />
        <Button type="submit">Buscar</Button>
      </form>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrar por categoría"
      >
        <button
          type="button"
          onClick={() => {
            setCategoriaId(undefined);
            setPagina(1);
          }}
          aria-pressed={categoriaId === undefined}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            categoriaId === undefined
              ? "border-basil-600 bg-basil-600 text-white"
              : "border-line bg-white hover:bg-basil-50"
          }`}
        >
          Todo
        </button>
        {categorias.data?.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCategoriaId(c.id);
              setPagina(1);
            }}
            aria-pressed={categoriaId === c.id}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              categoriaId === c.id
                ? "border-basil-600 bg-basil-600 text-white"
                : "border-line bg-white hover:bg-basil-50"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {isPending ? (
        <div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          aria-busy="true"
          aria-label="Cargando productos"
        >
          {Array.from({ length: POR_PAGINA }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-line bg-white"
            >
              <Skeleton className="aspect-3/2 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onReintentar={() => void refetch()}
        />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo={
            hayFiltros
              ? "No encontramos productos con esos filtros"
              : "Todavía no hay productos"
          }
          descripcion={
            hayFiltros
              ? "Probá con otra búsqueda o quitá los filtros."
              : "Volvé en un rato."
          }
          accion={
            hayFiltros ? (
              <Button onClick={limpiar}>Quitar filtros</Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${isPlaceholderData ? "opacity-60" : ""}`}
            aria-live="polite"
          >
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            onCambiar={setPagina}
          />
        </>
      )}
    </div>
  );
}
