import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  listarPedidos,
  obtenerResumen,
} from "../api/pedidos";
import type { EstadoPedido, PedidoCreate, PedidoFiltros } from "../types";

export function usePedidos(filtros: PedidoFiltros) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ["pedidos", "resumen"],
    queryFn: obtenerResumen,
  });
}

// Crear/cancelar/avanzar un pedido cambia el stock: se invalidan también los productos.
function useInvalidarPedidosYProductos() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["pedidos"] }),
      qc.invalidateQueries({ queryKey: ["productos"] }),
    ]);
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidosYProductos();
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidosYProductos();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidosYProductos();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: invalidar,
  });
}
