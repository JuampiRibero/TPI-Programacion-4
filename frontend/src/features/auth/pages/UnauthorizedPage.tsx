import { Link } from "react-router-dom";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";

export function UnauthorizedPage() {
  return (
    <EstadoVacio
      titulo="No tenés permiso para ver esta pantalla"
      descripcion="Esta sección es solo para administradores."
      accion={
        <Link
          to="/"
          className="rounded-md bg-basil-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-basil-700"
        >
          Volver al inicio
        </Link>
      }
    />
  );
}
