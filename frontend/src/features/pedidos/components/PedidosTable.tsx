import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../shared/components/DataTable";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import {
  etiquetaEstado,
  formatearFecha,
  formatearPrecio,
} from "../../../shared/utils/formato";
import { TRANSICIONES, type EstadoPedido, type Pedido } from "../types";

interface Props {
  pedidos: Pedido[];
  procesandoId: number | null;
  onVerDetalle: (pedido: Pedido) => void;
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void;
}

const textoAccion: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Pasar a preparación",
  ENTREGADO: "Marcar entregado",
  CANCELADO: "Cancelar",
};

export function PedidosTable({
  pedidos,
  procesandoId,
  onVerDetalle,
  onCambiarEstado,
}: Props) {
  const columnas: ColumnDef<Pedido>[] = [
    {
      id: "id",
      header: "N.º",
      cell: ({ row }) => <span className="font-bold">#{row.original.id}</span>,
    },
    {
      id: "usuario",
      header: "Cliente",
      cell: ({ row }) => `Usuario ${row.original.usuario_id}`,
    },
    {
      id: "estado",
      header: "Estado",
      cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
    },
    {
      id: "pago",
      header: "Pago",
      cell: ({ row }) =>
        row.original.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia",
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => formatearPrecio(row.original.total),
    },
    {
      id: "fecha",
      header: "Fecha",
      cell: ({ row }) => formatearFecha(row.original.created_at),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const pedido = row.original;
        const siguientes = TRANSICIONES[pedido.estado];
        const ocupado = procesandoId === pedido.id;
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onVerDetalle(pedido)}
            >
              Ver detalle
            </Button>
            {siguientes.map((estado) => (
              <Button
                key={estado}
                size="sm"
                variant={estado === "CANCELADO" ? "danger" : "primary"}
                disabled={ocupado}
                aria-label={`${textoAccion[estado]} el pedido ${pedido.id} (pasa a ${etiquetaEstado(estado)})`}
                onClick={() => onCambiarEstado(pedido, estado)}
              >
                {textoAccion[estado]}
              </Button>
            ))}
          </div>
        );
      },
    },
  ];

  return <DataTable data={pedidos} columns={columnas} tamanoPagina={50} />;
}
