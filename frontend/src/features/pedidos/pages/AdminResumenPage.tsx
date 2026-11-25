import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { formatearPrecio } from "../../../shared/utils/formato";
import { ResumenCard } from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

export function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold">
        Resumen del negocio
      </h1>

      {isPending ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Cargando resumen"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onReintentar={() => void refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard
            titulo="Pedidos de hoy"
            valor={String(data.pedidos_hoy)}
          />
          <ResumenCard
            titulo="Pendientes"
            valor={String(data.pendientes)}
            detalle="Esperan que los prepares"
          />
          <ResumenCard
            titulo="En preparación"
            valor={String(data.en_preparacion)}
          />
          <ResumenCard titulo="Entregados" valor={String(data.entregados)} />
          <ResumenCard titulo="Cancelados" valor={String(data.cancelados)} />
          <ResumenCard
            titulo="Ingresos (entregados)"
            valor={formatearPrecio(data.ingresos_entregados)}
            detalle="Suma del total de los pedidos entregados"
            destacado
          />
        </div>
      )}
    </div>
  );
}
