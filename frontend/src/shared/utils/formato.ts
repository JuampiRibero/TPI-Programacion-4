const moneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

export function formatearPrecio(valor: number): string {
  return moneda.format(valor);
}

export function formatearFecha(iso: string): string {
  // La API devuelve fechas UTC sin zona; se interpretan como UTC.
  const fecha = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  return fecha.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function etiquetaEstado(estado: string): string {
  return estado === "EN_PREPARACION"
    ? "En preparación"
    : estado.charAt(0) + estado.slice(1).toLowerCase();
}

interface MetaCampo {
  errors: unknown[];
  isTouched: boolean;
}

// Primer mensaje de error de un campo de TanStack Form.
export function mensajeError(meta: MetaCampo): string | undefined {
  if (!meta.isTouched) return undefined;
  const primero = meta.errors.find((e) => e !== undefined && e !== null);
  if (primero === undefined) return undefined;
  if (typeof primero === "string") return primero;
  if (
    typeof primero === "object" &&
    "message" in primero &&
    typeof primero.message === "string"
  ) {
    return primero.message;
  }
  return "Valor inválido";
}
