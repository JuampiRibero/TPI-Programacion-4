import { useForm } from "@tanstack/react-form";
import { Button } from "../../../shared/ui/Button";
import { Input, Textarea } from "../../../shared/ui/Input";
import { mensajeError } from "../../../shared/utils/formato";
import type { Categoria } from "../types";

export interface CategoriaFormValues {
  nombre: string;
  descripcion: string;
}

interface Props {
  categoria: Categoria | null;
  onSubmit: (valores: CategoriaFormValues) => Promise<void>;
  onCancelar: () => void;
  errorServidor: string | null;
}

export function CategoriaForm({
  categoria,
  onSubmit,
  onCancelar,
  errorServidor,
}: Props) {
  const defaultValues: CategoriaFormValues = {
    nombre: categoria?.nombre ?? "",
    descripcion: categoria?.descripcion ?? "",
  };
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
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
            if (largo > 100) return "Máximo 100 caracteres";
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
                : categoria
                  ? "Guardar cambios"
                  : "Crear categoría"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
