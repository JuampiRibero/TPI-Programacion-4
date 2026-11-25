import { Button } from "../ui/Button";

interface Props {
  mensaje: string;
  onReintentar?: () => void;
}

export function EstadoError({ mensaje, onReintentar }: Props) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-chili-600/30 bg-chili-100 px-6 py-8 text-center"
    >
      <p className="font-display text-lg font-extrabold text-chili-700">
        No pudimos cargar los datos
      </p>
      <p className="mt-1 text-sm text-chili-700">{mensaje}</p>
      {onReintentar && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={onReintentar}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}
