import { AlertCircle } from "lucide-react";
import { inputErrorClass } from "@/lib/validation";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({
  label,
  error,
  required,
  icon,
  children,
  className = "",
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${
          error ? "text-red-400" : "text-cream/50"
        }`}
      >
        {icon}
        {label}
        {required && <span className="text-gold/80">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export { inputErrorClass };
