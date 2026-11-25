import { useState } from "react";
import { Link } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Confirmar } from "../../../shared/ui/Modal";
import { formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";

const POR_PAGINA = 10;

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(1);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [aCancelar, setACancelar] = useState<number | null>(null);
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch } = usePedidos({
    skip: (pagina - 1) * POR_PAGINA,
    limit: POR_PAGINA,
  });
  const cancelar = useCancelarPedido();

  const confirmarCancelacion = async () => {
    if (aCancelar === null) return;
    setErrorCancelar(null);
    try {
      await cancelar.mutateAsync(aCancelar);
      setACancelar(null);
    } catch (e) {
      setErrorCancelar(handleApiError(e));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold">Mis pedidos</h1>

      {isPending ? (
        <div
          className="space-y-3"
          aria-busy="true"
          aria-label="Cargando pedidos"
        >
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onReintentar={() => void refetch()}
        />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste ningún pedido"
          descripcion="Cuando confirmes uno, lo vas a ver acá."
          accion={
            <Link
              to="/"
              className="rounded-md bg-basil-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-basil-700"
            >
              Ver el menú
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {data.items.map((pedido) => (
              <li key={pedido.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-extrabold">
                        Pedido #{pedido.id}
                      </p>
                      <p className="text-sm text-muted">
                        {formatearFecha(pedido.created_at)}
                      </p>
                    </div>
                    <BadgeEstado estado={pedido.estado} />
                    <p className="w-28 text-right font-bold">
                      {formatearPrecio(pedido.total)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-expanded={abierto === pedido.id}
                        onClick={() =>
                          setAbierto(abierto === pedido.id ? null : pedido.id)
                        }
                      >
                        {abierto === pedido.id
                          ? "Ocultar detalle"
                          : "Ver detalle"}
                      </Button>
                      {pedido.estado === "PENDIENTE" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setErrorCancelar(null);
                            setACancelar(pedido.id);
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                  {abierto === pedido.id && (
                    <div className="mt-4 border-t border-line pt-4">
                      <PedidoDetalle pedido={pedido} />
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
          <Paginacion
            pagina={pagina}
            totalPaginas={Math.max(1, Math.ceil(data.total / POR_PAGINA))}
            onCambiar={setPagina}
          />
        </>
      )}

      <Confirmar
        open={aCancelar !== null}
        titulo={`Cancelar el pedido #${aCancelar ?? ""}`}
        mensaje="Solo se puede cancelar mientras está pendiente. Los productos vuelven al stock y esta acción no se puede deshacer."
        textoConfirmar="Cancelar pedido"
        cargando={cancelar.isPending}
        onConfirmar={() => void confirmarCancelacion()}
        onCancelar={() => setACancelar(null)}
      />
      {errorCancelar && aCancelar !== null && (
        <p
          role="alert"
          className="fixed bottom-4 left-1/2 z-60 -translate-x-1/2 rounded-md bg-chili-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {errorCancelar}
        </p>
      )}
    </div>
  );
}
