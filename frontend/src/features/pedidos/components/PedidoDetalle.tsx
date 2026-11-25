import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import type { Pedido } from "../types";

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <div>
          <dt className="text-muted">Estado</dt>
          <dd className="mt-0.5">
            <BadgeEstado estado={pedido.estado} />
          </dd>
        </div>
        <div>
          <dt className="text-muted">Creado</dt>
          <dd className="font-medium">{formatearFecha(pedido.created_at)}</dd>
        </div>
        <div>
          <dt className="text-muted">Forma de pago</dt>
          <dd className="font-medium">
            {pedido.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Dirección de entrega</dt>
          <dd className="font-medium">{pedido.direccion_entrega}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-muted">Notas</dt>
            <dd className="font-medium">{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <table className="w-full text-left">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="py-2 font-medium">Producto</th>
            <th className="py-2 text-right font-medium">Cant.</th>
            <th className="py-2 text-right font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((i) => (
            <tr key={i.producto_id} className="border-b border-line/60">
              <td className="py-2">{i.nombre_producto}</td>
              <td className="py-2 text-right">{i.cantidad}</td>
              <td className="py-2 text-right">
                {formatearPrecio(i.precio_unitario)}
              </td>
              <td className="py-2 text-right">{formatearPrecio(i.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={3}
              className="pt-3 text-right font-display text-lg font-extrabold"
            >
              Total
            </td>
            <td className="pt-3 text-right font-display text-lg font-extrabold">
              {formatearPrecio(pedido.total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
