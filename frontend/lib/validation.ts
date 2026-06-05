export type FieldErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{8,20}$/;

export function validateRequired(value: string, label: string): string | undefined {
  if (!value?.trim()) return `${label} is required`;
}

export function validateEmail(value: string): string | undefined {
  const required = validateRequired(value, "Email");
  if (required) return required;
  if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address";
}

export function validatePassword(value: string): string | undefined {
  const required = validateRequired(value, "Password");
  if (required) return required;
  if (value.length < 8) return "Password must be at least 8 characters";
}

export function validateName(value: string): string | undefined {
  const required = validateRequired(value, "Full name");
  if (required) return required;
  if (value.trim().length < 2) return "Name must be at least 2 characters";
}

export function validatePhone(value: string): string | undefined {
  const required = validateRequired(value, "Phone number");
  if (required) return required;
  if (!PHONE_REGEX.test(value.trim())) return "Enter a valid phone number";
}

export function validatePositiveNumber(value: string, label: string): string | undefined {
  const required = validateRequired(value, label);
  if (required) return required;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return `${label} must be a positive number`;
}

export function validateDateRange(startDate: string, endDate: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!startDate) errors.startDate = "Pickup date is required";
  if (!endDate) errors.endDate = "Return date is required";
  if (startDate && endDate && endDate <= startDate) {
    errors.endDate = "Return date must be after pickup date";
  }
  return errors;
}

export function validateImageFile(file: File | null): string | undefined {
  if (!file) return undefined;
  if (!file.type.startsWith("image/")) return "File must be an image";
  if (file.size > 5 * 1024 * 1024) return "Image must be smaller than 5MB";
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function inputErrorClass(hasError?: boolean, className?: string): string {
  const errorStyles = hasError
    ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/30"
    : "";
  return [className, errorStyles].filter(Boolean).join(" ");
}
