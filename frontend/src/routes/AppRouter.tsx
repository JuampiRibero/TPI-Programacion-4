import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { UnauthorizedPage } from "../features/auth/pages/UnauthorizedPage";
import { AdminCategoriasPage } from "../features/categorias/pages/AdminCategoriasPage";
import { AdminPedidosPage } from "../features/pedidos/pages/AdminPedidosPage";
import { AdminResumenPage } from "../features/pedidos/pages/AdminResumenPage";
import { CarritoPage } from "../features/pedidos/pages/CarritoPage";
import { CheckoutPage } from "../features/pedidos/pages/CheckoutPage";
import { MisPedidosPage } from "../features/pedidos/pages/MisPedidosPage";
import { AdminProductosPage } from "../features/productos/pages/AdminProductosPage";
import { CatalogoPage } from "../features/productos/pages/CatalogoPage";
import { AdminUsuariosPage } from "../features/usuarios/pages/AdminUsuariosPage";
import { EstadoVacio } from "../shared/components/EstadoVacio";
import { MainLayout } from "../shared/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";

function NoEncontrada() {
  return (
    <EstadoVacio
      titulo="Esta página no existe"
      descripcion="Revisá la dirección o volvé al menú."
      accion={
        <Link
          to="/"
          className="rounded-md bg-basil-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-basil-700"
        >
          Ir al menú
        </Link>
      }
    />
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Públicas */}
          <Route index element={<CatalogoPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="carrito" element={<CarritoPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          {/* Requieren sesión */}
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Solo admin */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route
              path="admin"
              element={<Navigate to="/admin/resumen" replace />}
            />
            <Route path="admin/resumen" element={<AdminResumenPage />} />
            <Route path="admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="admin/productos" element={<AdminProductosPage />} />
            <Route path="admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
