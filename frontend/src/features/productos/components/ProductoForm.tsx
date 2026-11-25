import { useForm } from "@tanstack/react-form";
import { Button } from "../../../shared/ui/Button";
import { Input, Select, Textarea } from "../../../shared/ui/Input";
import { mensajeError } from "../../../shared/utils/formato";
import type { Categoria } from "../../categorias/types";
import type { Producto, ProductoCreate } from "../types";

interface ProductoFormValues {
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio_base: string;
  imagen_url: string;
  stock: string;
  disponible: boolean;
}

interface Props {
  producto: Producto | null;
  categorias: Categoria[];
  onSubmit: (datos: ProductoCreate) => Promise<void>;
  onCancelar: () => void;
  errorServidor: string | null;
}

export function ProductoForm({
  producto,
  categorias,
  onSubmit,
  onCancelar,
  errorServidor,
}: Props) {
  const defaultValues: ProductoFormValues = {
    categoria_id: producto ? String(producto.categoria_id) : "",
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    precio_base: producto ? String(producto.precio_base) : "",
    imagen_url: producto?.imagen_url ?? "",
    stock: producto ? String(producto.stock) : "0",
    disponible: producto?.disponible ?? true,
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit({
        categoria_id: Number(value.categoria_id),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
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
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 2) return "Mínimo 2 caracteres";
            if (largo > 150) return "Máximo 150 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{
          onChange: ({ value }) => (value ? undefined : "Elegí una categoría"),
        }}
      >
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          >
            <option value="">Elegí una categoría…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            label="Descripción (opcional)"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value);
              if (value.trim() === "" || !Number.isFinite(n))
                return "Ingresá un precio";
              if (n < 0) return "El precio no puede ser negativo";
              return undefined;
            },
          }}
        >
          {(field) => (
            <Input
              label="Precio"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={mensajeError(field.state.meta)}
            />
          )}
        </form.Field>

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
              label="Stock"
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
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen (opcional)"
            type="url"
            placeholder="https://…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
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
              {enviando
                ? "Guardando…"
                : producto
                  ? "Guardar cambios"
                  : "Crear producto"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
