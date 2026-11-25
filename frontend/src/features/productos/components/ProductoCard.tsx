import { useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCartStore } from "../../../store/cartStore";
import type { Producto } from "../types";

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );
  const [imagenRota, setImagenRota] = useState(false);

  const sinStock = producto.stock <= 0;
  const noDisponible = !producto.disponible;
  const bloqueado = sinStock || noDisponible || enCarrito >= producto.stock;

  const etiqueta = noDisponible
    ? "No disponible"
    : sinStock
      ? "Sin stock"
      : enCarrito >= producto.stock
        ? "Máximo en el carrito"
        : "Agregar al carrito";

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
      <div className="relative aspect-3/2 bg-saffron-100">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center font-display text-xl font-extrabold text-ink/50">
            {producto.nombre}
          </div>
        )}
        <span className="absolute bottom-3 left-3 rounded-md bg-saffron-400 px-2.5 py-1 font-display text-base font-extrabold text-ink">
          {formatearPrecio(producto.precio_base)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {producto.categoria && (
          <p className="text-xs font-medium text-basil-700">
            {producto.categoria.nombre}
          </p>
        )}
        <h3 className="font-display text-lg font-extrabold leading-tight">
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-muted">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-auto pt-3">
          <p className="mb-2 text-xs text-muted">
            {sinStock
              ? "Agotado por ahora"
              : producto.stock <= 5
                ? `Quedan ${producto.stock}`
                : `${producto.stock} en stock`}
          </p>
          <Button
            className="w-full"
            disabled={bloqueado}
            onClick={() =>
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                imagen_url: producto.imagen_url,
                stock: producto.stock,
              })
            }
          >
            {etiqueta}
          </Button>
        </div>
      </div>
    </article>
  );
}
