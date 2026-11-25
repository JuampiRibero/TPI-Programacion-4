import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { Confirmar, Modal } from "../../../shared/ui/Modal";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoForm } from "../components/ProductoForm";
import { StockForm } from "../components/StockForm";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "../hooks/useProductos";
import type { Producto, ProductoCreate, ProductoStockUpdate } from "../types";

export function AdminProductosPage() {
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table.
  const { data, isPending, isError, error, refetch } = useProductos({
    limit: 100,
  });
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const [editando, setEditando] = useState<Producto | "nuevo" | null>(null);
  const [conStock, setConStock] = useState<Producto | null>(null);
  const [aEliminar, setAEliminar] = useState<Producto | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const guardar = async (datos: ProductoCreate) => {
    setErrorForm(null);
    try {
      if (editando === "nuevo") await crear.mutateAsync(datos);
      else if (editando)
        await actualizar.mutateAsync({ id: editando.id, datos });
      setEditando(null);
    } catch (e) {
      setErrorForm(handleApiError(e));
    }
  };

  const guardarStock = async (datos: Required<ProductoStockUpdate>) => {
    if (!conStock) return;
    setErrorForm(null);
    try {
      await actualizarStock.mutateAsync({ id: conStock.id, datos });
      setConStock(null);
    } catch (e) {
      setErrorForm(handleApiError(e));
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    setErrorEliminar(null);
    try {
      await eliminar.mutateAsync(aEliminar.id);
      setAEliminar(null);
    } catch (e) {
      setErrorEliminar(handleApiError(e));
    }
  };

  const columnas: ColumnDef<Producto>[] = [
    { id: "id", header: "ID", cell: ({ row }) => row.original.id },
    {
      id: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.nombre}</span>
      ),
    },
    {
      id: "categoria",
      header: "Categoría",
      cell: ({ row }) => row.original.categoria?.nombre ?? "—",
    },
    {
      id: "precio",
      header: "Precio",
      cell: ({ row }) => formatearPrecio(row.original.precio_base),
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <span
          className={row.original.stock === 0 ? "font-bold text-chili-600" : ""}
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      id: "disponible",
      header: "Disponible",
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            row.original.disponible
              ? "bg-basil-100 text-basil-700"
              : "bg-line text-muted"
          }`}
        >
          {row.original.disponible ? "Sí" : "No"}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setErrorForm(null);
              setEditando(row.original);
            }}
          >
            Editar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setErrorForm(null);
              setConStock(row.original);
            }}
          >
            Stock
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setErrorEliminar(null);
              setAEliminar(row.original);
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">Productos</h1>
        <Button
          disabled={!categorias.data || categorias.data.length === 0}
          onClick={() => {
            setErrorForm(null);
            setEditando("nuevo");
          }}
        >
          Nuevo producto
        </Button>
      </div>
      {categorias.data?.length === 0 && (
        <p className="text-sm text-muted">
          Primero creá una categoría para poder cargar productos.
        </p>
      )}

      {isPending ? (
        <div
          className="space-y-2"
          aria-busy="true"
          aria-label="Cargando productos"
        >
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onReintentar={() => void refetch()}
        />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay productos"
          descripcion="Creá el primero con «Nuevo producto»."
        />
      ) : (
        <DataTable data={data.items} columns={columnas} />
      )}

      <Modal
        open={editando !== null}
        onClose={() => setEditando(null)}
        title={editando === "nuevo" ? "Nuevo producto" : "Editar producto"}
        ancho="lg"
      >
        {editando !== null && (
          <ProductoForm
            key={editando === "nuevo" ? "nuevo" : editando.id}
            producto={editando === "nuevo" ? null : editando}
            categorias={categorias.data ?? []}
            onSubmit={guardar}
            onCancelar={() => setEditando(null)}
            errorServidor={errorForm}
          />
        )}
      </Modal>

      <Modal
        open={conStock !== null}
        onClose={() => setConStock(null)}
        title="Cambiar stock y disponibilidad"
      >
        {conStock && (
          <StockForm
            key={conStock.id}
            producto={conStock}
            onSubmit={guardarStock}
            onCancelar={() => setConStock(null)}
            errorServidor={errorForm}
          />
        )}
      </Modal>

      <Confirmar
        open={aEliminar !== null}
        titulo={`Eliminar «${aEliminar?.nombre ?? ""}»`}
        mensaje="El producto deja de verse en el menú. Los pedidos que ya lo incluyen conservan su nombre y precio."
        textoConfirmar="Eliminar producto"
        cargando={eliminar.isPending}
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setAEliminar(null)}
      />
      {errorEliminar && aEliminar !== null && (
        <p
          role="alert"
          className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-md bg-chili-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {errorEliminar}
        </p>
      )}
    </div>
  );
}
