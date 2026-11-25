import { Link, useNavigate } from "react-router-dom";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCartStore } from "../../../store/cartStore";

export function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos del menú para armar tu pedido."
        accion={
          <Link
            to="/"
            className="rounded-md bg-basil-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-basil-700"
          >
            Ver el menú
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">Tu carrito</h1>
        <Button variant="ghost" size="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.producto_id}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-extrabold leading-tight">
                    {item.nombre}
                  </p>
                  <p className="text-sm text-muted">
                    {formatearPrecio(item.precio_unitario)} c/u
                  </p>
                </div>

                <div
                  className="flex items-center gap-2"
                  role="group"
                  aria-label={`Cantidad de ${item.nombre}`}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="Quitar una unidad"
                    disabled={item.cantidad <= 1}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad - 1)
                    }
                  >
                    −
                  </Button>
                  <span
                    className="w-8 text-center font-bold"
                    aria-live="polite"
                  >
                    {item.cantidad}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="Agregar una unidad"
                    disabled={item.cantidad >= item.stock}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad + 1)
                    }
                  >
                    +
                  </Button>
                </div>

                <p className="w-28 text-right font-bold">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => quitar(item.producto_id)}
                >
                  Quitar
                </Button>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="h-fit space-y-4 p-5">
          <h2 className="font-display text-xl font-extrabold">Resumen</h2>
          <dl className="space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.producto_id} className="flex justify-between gap-3">
                <dt className="text-muted">
                  {i.cantidad} × {i.nombre}
                </dt>
                <dd>{formatearPrecio(i.precio_unitario * i.cantidad)}</dd>
              </div>
            ))}
          </dl>
          <div className="flex justify-between border-t border-line pt-3 font-display text-xl font-extrabold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <Button className="w-full" onClick={() => navigate("/checkout")}>
            Continuar con el pedido
          </Button>
          <p className="text-xs text-muted">
            El precio final se confirma al hacer el pedido.
          </p>
        </Card>
      </div>
    </div>
  );
}
