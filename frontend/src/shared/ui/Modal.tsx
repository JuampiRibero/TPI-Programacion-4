import type { KeyboardEvent, ReactNode } from "react";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  ancho?: "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  ancho = "md",
}: ModalProps) {
  if (!open) return null;

  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={(el) => el?.focus()}
        onKeyDown={alTeclear}
        className={`w-full ${ancho === "lg" ? "max-w-2xl" : "max-w-lg"} rounded-xl bg-white p-6 shadow-xl outline-none`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md px-2 py-1 text-xl leading-none text-muted hover:bg-basil-50"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmarProps {
  open: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function Confirmar({
  open,
  titulo,
  mensaje,
  textoConfirmar,
  cargando,
  onConfirmar,
  onCancelar,
}: ConfirmarProps) {
  return (
    <Modal open={open} onClose={onCancelar} title={titulo}>
      <p className="text-sm text-muted">{mensaje}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar} disabled={cargando}>
          Volver
        </Button>
        <Button variant="danger" onClick={onConfirmar} disabled={cargando}>
          {cargando ? "Procesando…" : textoConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
