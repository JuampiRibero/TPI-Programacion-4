import { useEffect } from "react";
import { AppRouter } from "./routes/AppRouter";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  // Confirmar la sesión al montar la aplicación.
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
}
