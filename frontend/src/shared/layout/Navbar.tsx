import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { Button } from "../ui/Button";

const enlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-basil-100 text-basil-700" : "text-ink hover:bg-basil-50"
  }`;

const enlaceAdmin = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? "bg-saffron-400 text-ink" : "text-white/85 hover:bg-white/10"
  }`;

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.cantidad, 0),
  );
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header>
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-basil-700"
          >
            <img
              src="/cesta-de-compra.png"
              alt="Food Store"
              className="h-9 w-9 object-contain"
            />
            Food Store
          </Link>

          <nav
            className="flex flex-1 flex-wrap items-center gap-1"
            aria-label="Principal"
          >
            <NavLink to="/" end className={enlace}>
              Menú
            </NavLink>
            <NavLink to="/carrito" className={enlace}>
              Carrito
              {cantidad > 0 && (
                <span className="ml-2 rounded-full bg-saffron-400 px-2 py-0.5 text-xs font-bold text-ink">
                  {cantidad}
                </span>
              )}
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={enlace}>
                Mis pedidos
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                <div className="text-right text-sm leading-tight">
                  <p className="font-medium">{usuario.full_name}</p>
                  <p className="text-xs text-muted">
                    {usuario.role === "admin" ? "Administrador" : "Cliente"}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={cerrarSesion}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-basil-700 hover:underline"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-basil-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-basil-700"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {usuario?.role === "admin" && (
        <div className="bg-ink">
          <nav
            className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2"
            aria-label="Administración"
          >
            <span className="mr-2 text-sm font-bold text-white">Panel</span>
            <NavLink to="/admin/resumen" className={enlaceAdmin}>
              Resumen
            </NavLink>
            <NavLink to="/admin/pedidos" className={enlaceAdmin}>
              Pedidos
            </NavLink>
            <NavLink to="/admin/productos" className={enlaceAdmin}>
              Productos
            </NavLink>
            <NavLink to="/admin/categorias" className={enlaceAdmin}>
              Categorías
            </NavLink>
            <NavLink to="/admin/usuarios" className={enlaceAdmin}>
              Usuarios
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
