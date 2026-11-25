import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { mensajeError } from "../../../shared/utils/formato";
import { useAuthStore } from "../../../store/authStore";

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as LocationState | null)?.from ?? "/";
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await login(value.username.trim(), value.password);
        navigate(destino, { replace: true });
      } catch (error) {
        setErrorServidor(handleApiError(error));
      }
    },
  });

  if (usuario) return <Navigate to={destino} replace />;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-extrabold">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-muted">
        Entrá para confirmar tus pedidos y seguirlos.
      </p>

      <Card className="mt-6 p-6">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : "Ingresá tu nombre de usuario",
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : "Ingresá tu contraseña",
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
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
                {enviando ? "Ingresando…" : "Iniciar sesión"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-muted">
        ¿No tenés cuenta?{" "}
        <Link
          to="/register"
          className="font-medium text-basil-700 hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
