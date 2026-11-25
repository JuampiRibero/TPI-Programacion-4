import { isAxiosError } from "axios";

interface ErrorBody {
  detail?: unknown;
}

interface ErrorValidacion {
  loc?: unknown[];
  msg?: string;
}

// Convierte el `detail` de la API en un mensaje legible para la pantalla.
export function handleApiError(error: unknown): string {
  if (isAxiosError<ErrorBody>(error)) {
    if (!error.response)
      return "No se pudo conectar con el servidor. Revisá tu conexión.";
    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      // 422 de FastAPI: lista de errores de validación.
      return (detail as ErrorValidacion[])
        .map((d) => d.msg ?? "Dato inválido")
        .join(". ");
    }
    return `Error ${error.response.status}`;
  }
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}
