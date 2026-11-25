import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface CampoProps {
  label: string;
  error?: string;
  ayuda?: string;
}

const base =
  "w-full rounded-md border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-basil-600";

function Campo({
  id,
  label,
  error,
  ayuda,
  children,
}: CampoProps & { id: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {ayuda && !error && <p className="text-xs text-muted">{ayuda}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-chili-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  label,
  error,
  ayuda,
  className = "",
  ...props
}: CampoProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        {...props}
        className={`${base} ${error ? "border-chili-600" : "border-line"} ${className}`}
      />
    </Campo>
  );
}

export function Select({
  label,
  error,
  ayuda,
  className = "",
  children,
  ...props
}: CampoProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        {...props}
        className={`${base} ${error ? "border-chili-600" : "border-line"} ${className}`}
      >
        {children}
      </select>
    </Campo>
  );
}

export function Textarea({
  label,
  error,
  ayuda,
  className = "",
  ...props
}: CampoProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        {...props}
        className={`${base} ${error ? "border-chili-600" : "border-line"} ${className}`}
      />
    </Campo>
  );
}
