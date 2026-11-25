import type { ReactNode } from "react";

interface Props {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <p className="font-display text-lg font-extrabold">{titulo}</p>
      {descripcion && (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          {descripcion}
        </p>
      )}
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  );
}
