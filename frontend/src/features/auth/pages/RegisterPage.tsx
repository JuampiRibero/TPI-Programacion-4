import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { mensajeError } from "../../../shared/utils/formato";
import { useAuthStore } from "../../../store/authStore";
import { registerRequest } from "../api/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const login = useAuthStore((s) => s.login);
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
      confirmacion: "",
    },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await registerRequest({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        // Cuenta creada: se inicia sesión directamente.
        await login(value.username.trim(), value.password);
        navigate("/", { replace: true });
      } catch (error) {
        setErrorServidor(handleApiError(error));
      }
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-extrabold">Crear cuenta</h1>
      <p className="mt-1 text-sm text-muted">
        Con tu cuenta podés pedir y seguir tus pedidos.
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
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length >= 2
                  ? undefined
                  : "Ingresá tu nombre completo",
            }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length >= 3 ? undefined : "Mínimo 3 caracteres",
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
            name="email"
            validators={{
              onChange: ({ value }) =>
                EMAIL_REGEX.test(value.trim())
                  ? undefined
                  : "Ingresá un email válido",
            }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
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
                value.length >= 8 ? undefined : "Mínimo 8 caracteres",
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="confirmacion"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) =>
                value === fieldApi.form.getFieldValue("password")
                  ? undefined
                  : "Las contraseñas no coinciden",
            }}
          >
            {(field) => (
              <Input
                label="Repetir contraseña"
                type="password"
                autoComplete="new-password"
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
                {enviando ? "Creando cuenta…" : "Crear cuenta"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/login"
          className="font-medium text-basil-700 hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
