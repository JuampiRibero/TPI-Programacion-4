import { Button } from "../ui/Button";

interface Props {
  pagina: number; // base 1
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

export function Paginacion({ pagina, totalPaginas, onCambiar }: Props) {
  if (totalPaginas <= 1) return null;
  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-center gap-3 pt-4"
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={pagina <= 1}
        onClick={() => onCambiar(pagina - 1)}
      >
        Anterior
      </Button>
      <span className="text-sm text-muted">
        Página {pagina} de {totalPaginas}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={pagina >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </nav>
  );
}
