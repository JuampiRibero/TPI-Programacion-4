import { api } from "../../../shared/api/axiosInstance";
import type { Usuario } from "../../usuarios/types";
import type { MensajeRespuesta, UserCreate } from "../types";

export async function loginRequest(
  username: string,
  password: string,
): Promise<MensajeRespuesta> {
  // El endpoint usa el formulario OAuth2. El token llega en una cookie HttpOnly, el frontend nunca lo ve ni lo guarda.
  const form = new URLSearchParams({ username, password });
  const { data } = await api.post<MensajeRespuesta>("/auth/token", form);
  return data;
}

export async function registerRequest(datos: UserCreate): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/auth/register", datos);
  return data;
}

export async function meRequest(): Promise<Usuario> {
  const { data } = await api.get<Usuario>("/auth/me");
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
}
