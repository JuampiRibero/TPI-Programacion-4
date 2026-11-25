import { api } from "../../../shared/api/axiosInstance";
import type {
  Producto,
  ProductoCreate,
  ProductoFiltros,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types";

export async function listarProductos(
  filtros: ProductoFiltros,
): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>("/productos", {
    params: filtros,
  });
  return data;
}

export async function crearProducto(datos: ProductoCreate): Promise<Producto> {
  const { data } = await api.post<Producto>("/productos", datos);
  return data;
}

export async function actualizarProducto(
  id: number,
  datos: ProductoUpdate,
): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos);
  return data;
}

export async function actualizarStock(
  id: number,
  datos: ProductoStockUpdate,
): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos);
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
