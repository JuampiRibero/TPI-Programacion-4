import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { Confirmar, Modal } from "../../../shared/ui/Modal";
import {
  CategoriaForm,
  type CategoriaFormValues,
} from "../components/CategoriaForm";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategorias";
import type { Categoria } from "../types";

export function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const [editando, setEditando] = useState<Categoria | "nueva" | null>(null);
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const guardar = async (valores: CategoriaFormValues) => {
    setErrorForm(null);
    const datos = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim() || null,
    };
    try {
      if (editando === "nueva") await crear.mutateAsync(datos);
      else if (editando)
        await actualizar.mutateAsync({ id: editando.id, datos });
      setEditando(null);
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

  const columnas: ColumnDef<Categoria>[] = [
    { id: "id", header: "ID", cell: ({ row }) => row.original.id },
    {
      id: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.nombre}</span>
      ),
    },
    {
      id: "descripcion",
      header: "Descripción",
      cell: ({ row }) => row.original.descripcion ?? "—",
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
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
        <h1 className="font-display text-3xl font-extrabold">Categorías</h1>
        <Button
          onClick={() => {
            setErrorForm(null);
            setEditando("nueva");
          }}
        >
          Nueva categoría
        </Button>
      </div>

      {isPending ? (
        <div
          className="space-y-2"
          aria-busy="true"
          aria-label="Cargando categorías"
        >
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onReintentar={() => void refetch()}
        />
      ) : data.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay categorías"
          descripcion="Creá la primera para poder cargar productos."
        />
      ) : (
        <DataTable data={data} columns={columnas} />
      )}

      <Modal
        open={editando !== null}
        onClose={() => setEditando(null)}
        title={editando === "nueva" ? "Nueva categoría" : "Editar categoría"}
      >
        {editando !== null && (
          <CategoriaForm
            key={editando === "nueva" ? "nueva" : editando.id}
            categoria={editando === "nueva" ? null : editando}
            onSubmit={guardar}
            onCancelar={() => setEditando(null)}
            errorServidor={errorForm}
          />
        )}
      </Modal>

      <Confirmar
        open={aEliminar !== null}
        titulo={`Eliminar «${aEliminar?.nombre ?? ""}»`}
        mensaje="La categoría deja de verse en el menú. Sus productos siguen existiendo: si querés retirarlos también, eliminalos desde Productos."
        textoConfirmar="Eliminar categoría"
        cargando={eliminar.isPending}
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setAEliminar(null)}
      />
      {errorEliminar && aEliminar !== null && (
        <p
          role="alert"
          className="fixed bottom-4 left-1/2 z-60 -translate-x-1/2 rounded-md bg-chili-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {errorEliminar}
        </p>
      )}
    </div>
  );
}
