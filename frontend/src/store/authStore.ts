import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setOnSesionInvalida } from "../shared/api/axiosInstance";
import {
  loginRequest,
  logoutRequest,
  meRequest,
} from "../features/auth/api/auth";
import type { Usuario } from "../features/usuarios/types";

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiar: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginRequest(username, password); // La cookie HttpOnly la fija el navegador.
        const usuario = await meRequest();
        set({ usuario, cargando: false });
      },

      logout: async () => {
        try {
          await logoutRequest();
        } finally {
          set({ usuario: null });
        }
      },

      // Se llama una sola vez al montar la app: confirma con el backend si la cookie sigue vigente.
      checkSession: async () => {
        try {
          const usuario = await meRequest();
          set({ usuario, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiar: () => set({ usuario: null }),
    }),
    {
      name: "food-store-auth",
      // Solo se persiste el usuario (nombre, email, rol). Nunca el token.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);

setOnSesionInvalida(() => useAuthStore.getState().limpiar());
