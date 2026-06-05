"use client";

import Image from "next/image";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import { Booking } from "@/types";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Tag } from "lucide-react";

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const car = booking.car;
  const isSold = car?.sold ?? false;
  const isCancelled = booking.status === "cancelled";
  const imageUrl = car?.images?.[0]?.url || booking.car_image_url;

  const conditionLabel =
    booking.car_condition === "new"
      ? locale === "ar"
        ? "جديدة"
        : "New"
      : locale === "ar"
        ? "مستعملة"
        : "Used";

  const bookedDate = new Date(booking.created_at).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const carDetailsHref = booking.car_id
    ? `/fleet/${booking.car_id}`
    : `/bookings/${booking.id}`;

  return (
    <article className="card-glass group flex flex-col overflow-hidden rounded-2xl">
      <Link
        href={carDetailsHref}
        className="relative block aspect-[16/10] overflow-hidden bg-luxury-gray"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={booking.car_name}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
              isSold || isCancelled ? "grayscale-[0.35]" : ""
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-luxury-gray">
            <span className="font-playfair text-2xl text-cream/20">{booking.car_name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent" />

        <div
          className={`absolute top-0 inset-x-0 flex items-center justify-between gap-2 p-3${isRTL ? " flex-row-reverse" : ""}`}
        >
          <Badge variant="condition" size="sm">
            <Tag className="h-3 w-3" />
            {conditionLabel}
          </Badge>
          <BookingStatusBadge booking={booking} size="sm" />
        </div>

        <div className={`absolute bottom-0 inset-x-0 p-4${isRTL ? " text-right" : ""}`}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80">
            {booking.car_brand}
          </p>
          <h3 className="mt-0.5 font-playfair text-xl font-bold leading-tight text-cream sm:text-2xl">
            {booking.car_name}
          </h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-4">
        <div
          className={`flex items-center gap-2 text-xs text-cream/45${isRTL ? " flex-row-reverse" : ""}`}
        >
          <Calendar className="h-3.5 w-3.5 text-gold/60" />
          <span>
            {locale === "ar" ? "تاريخ الحجز:" : "Booked on:"} {bookedDate}
          </span>
        </div>

        {isSold && !isCancelled && (
          <p className="text-xs leading-relaxed text-red-400/80 border-l-2 border-red-500/30 pl-3 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-3">
            {locale === "ar"
              ? "تم بيع هذه السيارة — لم تعد متاحة. سيتم إزالة القائمة خلال 48 ساعة."
              : "This car has been sold and is no longer available. Listing will be removed within 48 hours."}
          </p>
        )}

        <Link href={carDetailsHref} className="mt-auto">
          <Button variant="gold-outline" size="sm" className="w-full text-xs tracking-widest uppercase">
            {locale === "ar" ? "عرض التفاصيل" : "View Details"}
          </Button>
        </Link>
      </div>
    </article>
  );
}
