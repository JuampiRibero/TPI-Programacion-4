import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { useAuthStore } from "../../../store/authStore";
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from "../hooks/useUsuarios";
import type { Usuario } from "../types";

export function AdminUsuariosPage() {
  const { data, isPending, isError, error, refetch } = useUsuarios();
  const yo = useAuthStore((s) => s.usuario);
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const ejecutar = async (accion: () => Promise<unknown>) => {
    setErrorAccion(null);
    try {
      await accion();
    } catch (e) {
      setErrorAccion(handleApiError(e));
    }
  };

  const columnas: ColumnDef<Usuario>[] = [
    {
      id: "username",
      header: "Usuario",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.username}</span>
      ),
    },
    {
      id: "nombre",
      header: "Nombre",
      cell: ({ row }) => row.original.full_name,
    },
    { id: "email", header: "Email", cell: ({ row }) => row.original.email },
    {
      id: "rol",
      header: "Rol",
      cell: ({ row }) =>
        row.original.role === "admin" ? "Administrador" : "Cliente",
    },
    {
      id: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            row.original.disabled
              ? "bg-chili-100 text-chili-700"
              : "bg-basil-100 text-basil-700"
          }`}
        >
          {row.original.disabled ? "Desactivado" : "Activo"}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const u = row.original;
        if (u.disabled) {
          return (
            <Button
              size="sm"
              disabled={activar.isPending}
              onClick={() => void ejecutar(() => activar.mutateAsync(u.id))}
            >
              Activar
            </Button>
          );
        }
        // El botón Desactivar no se muestra en la fila del usuario de la sesión.
        if (u.id === yo?.id)
          return <span className="text-xs text-muted">Sos vos</span>;
        return (
          <Button
            variant="danger"
            size="sm"
            disabled={desactivar.isPending}
            onClick={() => void ejecutar(() => desactivar.mutateAsync(u.id))}
          >
            Desactivar
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold">Usuarios</h1>

      {errorAccion && (
        <p
          role="alert"
          className="rounded-md bg-chili-100 px-3 py-2 text-sm font-medium text-chili-700"
        >
          {errorAccion}
        </p>
      )}

      {isPending ? (
        <div
          className="space-y-2"
          aria-busy="true"
          aria-label="Cargando usuarios"
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
        <EstadoVacio titulo="No hay usuarios registrados" />
      ) : (
        <DataTable data={data} columns={columnas} />
      )}
    </div>
  );
}
