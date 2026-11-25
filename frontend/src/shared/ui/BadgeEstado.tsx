import type { EstadoPedido } from "../../features/pedidos/types";
import { etiquetaEstado } from "../utils/formato";

const colores: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-saffron-100 text-[#7a5600]",
  EN_PREPARACION: "bg-sky-100 text-sky-800",
  ENTREGADO: "bg-basil-100 text-basil-700",
  CANCELADO: "bg-chili-100 text-chili-700",
};

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${colores[estado]}`}
    >
      {etiquetaEstado(estado)}
    </span>
  );
}
