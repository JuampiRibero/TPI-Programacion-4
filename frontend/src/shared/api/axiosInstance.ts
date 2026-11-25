import axios, { AxiosError } from "axios";

interface ErrorBody {
  detail?: unknown;
}

type Handler = () => void;
let onSesionInvalida: Handler = () => undefined;

// El authStore registra cómo limpiar la sesión.
export function setOnSesionInvalida(handler: Handler): void {
  onSesionInvalida = handler;
}

console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // El navegador adjunta la cookie HttpOnly en cada petición.
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const detail = error.response?.data?.detail;
    const esEndpointDeSesion =
      url.includes("/auth/token") || url.includes("/auth/me");
    const cuentaDesactivada =
      status === 400 && detail === "Cuenta de usuario desactivada";

    if ((status === 401 && !esEndpointDeSesion) || cuentaDesactivada) {
      // Sesión vencida o cuenta desactivada: se limpia el authStore y ProtectedRoute redirige a /login al quedar sin usuario.
      onSesionInvalida();
    }
    return Promise.reject(error);
  },
);
