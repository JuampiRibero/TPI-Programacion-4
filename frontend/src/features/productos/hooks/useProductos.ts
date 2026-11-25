import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from "../api/productos";
import type {
  ProductoCreate,
  ProductoFiltros,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types";

export function useProductos(filtros: ProductoFiltros) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useCrearProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: ProductoCreate) => crearProducto(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  });
}

export function useActualizarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) =>
      actualizarProducto(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  });
}

export function useActualizarStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) =>
      actualizarStock(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  });
}

export function useEliminarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  });
}
