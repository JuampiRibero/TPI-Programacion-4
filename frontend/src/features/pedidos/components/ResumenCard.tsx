import { Card } from "../../../shared/ui/Card";

interface Props {
  titulo: string;
  valor: string;
  detalle?: string;
  destacado?: boolean;
}

export function ResumenCard({
  titulo,
  valor,
  detalle,
  destacado = false,
}: Props) {
  return (
    <Card
      className={`p-5 ${destacado ? "border-saffron-400 bg-saffron-100" : ""}`}
    >
      <p className="text-sm font-medium text-muted">{titulo}</p>
      <p className="mt-1 font-display text-4xl font-extrabold tracking-tight">
        {valor}
      </p>
      {detalle && <p className="mt-1 text-xs text-muted">{detalle}</p>}
    </Card>
  );
}
