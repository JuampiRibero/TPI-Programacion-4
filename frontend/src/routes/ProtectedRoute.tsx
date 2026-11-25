import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "../features/usuarios/types";
import { Skeleton } from "../shared/components/Skeleton";
import { useAuthStore } from "../store/authStore";

interface Props {
  roles?: Rol[];
}

// Sin sesión -> /login. Con sesión pero sin el rol -> /unauthorized. La protección real está en el backend, esto solo mejora la experiencia.
export function ProtectedRoute({ roles }: Props) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    return (
      <div role="status" aria-label="Verificando sesión" className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (!usuario)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(usuario.role))
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
