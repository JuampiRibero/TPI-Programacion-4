import { useForm } from "@tanstack/react-form";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { mensajeError } from "../../../shared/utils/formato";
import type { Producto, ProductoStockUpdate } from "../types";

interface Props {
  producto: Producto;
  onSubmit: (datos: Required<ProductoStockUpdate>) => Promise<void>;
  onCancelar: () => void;
  errorServidor: string | null;
}

interface StockValues {
  stock: string;
  disponible: boolean;
}

export function StockForm({
  producto,
  onSubmit,
  onCancelar,
  errorServidor,
}: Props) {
  const defaultValues: StockValues = {
    stock: String(producto.stock),
    disponible: producto.disponible,
  };
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit({
        stock: Number(value.stock),
        disponible: value.disponible,
      });
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <p className="text-sm text-muted">
        Stock actual de <strong className="text-ink">{producto.nombre}</strong>:{" "}
        {producto.stock} unidades.
      </p>

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => {
            const n = Number(value);
            if (value.trim() === "" || !Number.isInteger(n))
              return "Ingresá un número entero";
            if (n < 0) return "El stock no puede ser negativo";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Nuevo stock"
            type="number"
            inputMode="numeric"
            min={0}
            step="1"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="size-4 accent-basil-600"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      {errorServidor && (
        <p
          role="alert"
          className="rounded-md bg-chili-100 px-3 py-2 text-sm font-medium text-chili-700"
        >
          {errorServidor}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : "Guardar stock"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
