import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Card } from "../../../shared/ui/Card";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCartStore } from "../../../store/cartStore";
import { CheckoutForm, type CheckoutValues } from "../components/CheckoutForm";
import { useCrearPedido } from "../hooks/usePedidos";

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  if (items.length === 0 && !crearPedido.isSuccess)
    return <Navigate to="/carrito" replace />;

  const confirmar = async (valores: CheckoutValues) => {
    setErrorServidor(null);
    try {
      await crearPedido.mutateAsync({
        items: items.map((i) => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
        })),
        forma_pago: valores.forma_pago,
        direccion_entrega: valores.direccion_entrega.trim(),
        notas: valores.notas.trim() || null,
      });
      vaciar();
      navigate("/mis-pedidos", { replace: true });
    } catch (error) {
      setErrorServidor(handleApiError(error));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold">Confirmar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <CheckoutForm onSubmit={confirmar} errorServidor={errorServidor} />
        </Card>

        <Card className="h-fit space-y-4 p-5">
          <h2 className="font-display text-xl font-extrabold">Tu pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-3">
                <span className="text-muted">
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-line pt-3 font-display text-xl font-extrabold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <Link
            to="/carrito"
            className="block text-center text-sm font-medium text-basil-700 hover:underline"
          >
            Volver al carrito
          </Link>
        </Card>
      </div>
    </div>
  );
}
