import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url: string | null;
  stock: number; // tope de unidades que se pueden pedir.
}

interface CartState {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

const acotar = (cantidad: number, stock: number) =>
  Math.max(1, Math.min(cantidad, Math.max(stock, 1)));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find(
            (i) => i.producto_id === item.producto_id,
          );
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.producto_id === item.producto_id
                  ? {
                      ...i,
                      stock: item.stock,
                      precio_unitario: item.precio_unitario,
                      cantidad: acotar(i.cantidad + cantidad, item.stock),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...estado.items,
              { ...item, cantidad: acotar(cantidad, item.stock) },
            ],
          };
        }),

      quitar: (productoId) =>
        set((estado) => ({
          items: estado.items.filter((i) => i.producto_id !== productoId),
        })),

      cambiarCantidad: (productoId, cantidad) =>
        set((estado) => ({
          items: estado.items.map((i) =>
            i.producto_id === productoId
              ? { ...i, cantidad: acotar(cantidad, i.stock) }
              : i,
          ),
        })),

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),

      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    {
      name: "food-store-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
