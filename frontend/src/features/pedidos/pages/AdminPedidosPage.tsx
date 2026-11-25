import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Confirmar, Modal } from "../../../shared/ui/Modal";
import { Select } from "../../../shared/ui/Input";
import { etiquetaEstado } from "../../../shared/utils/formato";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { PedidosTable } from "../components/PedidosTable";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { ESTADOS, type EstadoPedido, type Pedido } from "../types";

const POR_PAGINA = 10;

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState<EstadoPedido | "">("");
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [pendiente, setPendiente] = useState<{
    pedido: Pedido;
    estado: EstadoPedido;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isPending,
    isError,
    error: errorCarga,
    refetch,
  } = usePedidos({
    skip: (pagina - 1) * POR_PAGINA,
    limit: POR_PAGINA,
    estado: filtro || undefined,
  });
  const cambiarEstado = useCambiarEstadoPedido();

  const aplicar = async (pedido: Pedido, estado: EstadoPedido) => {
    setError(null);
    try {
      await cambiarEstado.mutateAsync({ id: pedido.id, estado });
    } catch (e) {
      setError(handleApiError(e));
    }
  };

  const alElegirAccion = (pedido: Pedido, estado: EstadoPedido) => {
    // Cancelar es irreversible y restituye stock: se pide confirmación.
    if (estado === "CANCELADO") setPendiente({ pedido, estado });
    else void aplicar(pedido, estado);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">Pedidos</h1>
        <div className="w-56">
          <Select
            label="Filtrar por estado"
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value as EstadoPedido | "");
              setPagina(1);
            }}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {etiquetaEstado(e)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md bg-chili-100 px-3 py-2 text-sm font-medium text-chili-700"
        >
          {error}
        </p>
      )}

      {isPending ? (
        <div
          className="space-y-2"
          aria-busy="true"
          aria-label="Cargando pedidos"
        >
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(errorCarga)}
          onReintentar={() => void refetch()}
        />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="No hay pedidos para mostrar"
          descripcion={
            filtro
              ? "Probá con otro estado."
              : "Cuando los clientes pidan, van a aparecer acá."
          }
        />
      ) : (
        <>
          <PedidosTable
            pedidos={data.items}
            procesandoId={
              cambiarEstado.isPending
                ? (cambiarEstado.variables?.id ?? null)
                : null
            }
            onVerDetalle={setDetalle}
            onCambiarEstado={alElegirAccion}
          />
          <Paginacion
            pagina={pagina}
            totalPaginas={Math.max(1, Math.ceil(data.total / POR_PAGINA))}
            onCambiar={setPagina}
          />
        </>
      )}

      <Modal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        title={`Pedido #${detalle?.id ?? ""}`}
        ancho="lg"
      >
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>

      <Confirmar
        open={pendiente !== null}
        titulo={`Cancelar el pedido #${pendiente?.pedido.id ?? ""}`}
        mensaje="El pedido pasa a CANCELADO y los productos vuelven al stock. No se puede deshacer."
        textoConfirmar="Cancelar pedido"
        cargando={cambiarEstado.isPending}
        onConfirmar={() => {
          if (!pendiente) return;
          void aplicar(pendiente.pedido, pendiente.estado).then(() =>
            setPendiente(null),
          );
        }}
        onCancelar={() => setPendiente(null)}
      />
    </div>
  );
}
