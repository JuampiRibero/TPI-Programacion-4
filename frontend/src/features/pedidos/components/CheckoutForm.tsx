import { useForm } from "@tanstack/react-form";
import { Button } from "../../../shared/ui/Button";
import { Input, Select, Textarea } from "../../../shared/ui/Input";
import { mensajeError } from "../../../shared/utils/formato";
import type { FormaPago } from "../types";

export interface CheckoutValues {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface Props {
  onSubmit: (valores: CheckoutValues) => Promise<void>;
  errorServidor: string | null;
}

export function CheckoutForm({ onSubmit, errorServidor }: Props) {
  const defaultValues: CheckoutValues = {
    direccion_entrega: "",
    forma_pago: "EFECTIVO",
    notas: "",
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5)
              return "Ingresá una dirección de al menos 5 caracteres";
            if (largo > 200)
              return "La dirección no puede superar los 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            placeholder="Calle, número, piso y localidad"
            autoComplete="street-address"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            ayuda="El pago se coordina al recibir el pedido."
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{
          onChange: ({ value }) =>
            value.length > 500 ? "Máximo 500 caracteres" : undefined,
        }}
      >
        {(field) => (
          <Textarea
            label="Notas (opcional)"
            placeholder="Por ejemplo: sin cebolla, tocar timbre 2B"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
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

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(enviando) => (
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Confirmando…" : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
