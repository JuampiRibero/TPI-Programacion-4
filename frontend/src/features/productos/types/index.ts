import type { Categoria } from "../../categorias/types";

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: Categoria | null;
}

export interface ProductoCreate {
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
}

export type ProductoUpdate = Partial<ProductoCreate>;

export interface ProductoStockUpdate {
  stock?: number;
  disponible?: boolean;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

export interface ProductoFiltros {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
