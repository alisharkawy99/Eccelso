import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, locale: string): string {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    maximumFractionDigits: 0,
  }).format(amount)

  return locale === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`
}

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0]
}

export function getTomorrowISO(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split("T")[0]
}

export function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end.getTime() - start.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  return days > 0 ? days : 0
}
