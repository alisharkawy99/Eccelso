"use client";

import { useLocale } from "next-intl";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Booking, BookingWithUser } from "@/types";

type BookingLike = Pick<Booking | BookingWithUser, "status" | "car">;

export function getBookingStatusBadge(
  booking: BookingLike,
  locale: string,
): { variant: BadgeVariant; label: string; dot?: boolean } {
  if (booking.car?.sold) {
    return {
      variant: "sold",
      label: locale === "ar" ? "مباعة" : "Sold",
    };
  }

  switch (booking.status) {
    case "pending":
      return {
        variant: "pending",
        label: locale === "ar" ? "قيد المراجعة" : "Pending",
        dot: true,
      };
    case "approved":
      return {
        variant: "approved",
        label: locale === "ar" ? "موافق عليه" : "Approved",
        dot: true,
      };
    case "rejected":
      return {
        variant: "rejected",
        label: locale === "ar" ? "مرفوض" : "Rejected",
      };
    case "cancelled":
      return {
        variant: "cancelled",
        label: locale === "ar" ? "ملغى" : "Cancelled",
      };
    default:
      return {
        variant: "dark",
        label: booking.status,
      };
  }
}

export default function BookingStatusBadge({
  booking,
  size = "sm",
}: {
  booking: BookingLike;
  size?: "sm" | "md" | "lg";
}) {
  const locale = useLocale();
  const { variant, label, dot } = getBookingStatusBadge(booking, locale);

  return (
    <Badge variant={variant} size={size} dot={dot}>
      {label}
    </Badge>
  );
}
