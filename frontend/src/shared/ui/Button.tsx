import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "danger" | "ghost";
type Tamano = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante;
  size?: Tamano;
}

const variantes: Record<Variante, string> = {
  primary:
    "bg-basil-600 text-white hover:bg-basil-700 disabled:bg-basil-600/40",
  secondary:
    "bg-white text-ink border border-line hover:bg-basil-50 disabled:text-muted/60",
  danger: "bg-chili-600 text-white hover:bg-chili-700 disabled:bg-chili-600/40",
  ghost: "text-basil-700 hover:bg-basil-50 disabled:text-muted/60",
};

const tamanos: Record<Tamano, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed ${variantes[variant]} ${tamanos[size]} ${className}`}
    />
  );
}
