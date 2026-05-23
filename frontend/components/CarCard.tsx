"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/navigation";
import { Car } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const t = useTranslations("fleet");
  const locale = useLocale();

  const categoryLabel = CATEGORY_LABELS[car.category][locale as "en" | "ar"];

  return (
    <div className="card-glass group overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-luxury-gray">
        <Image
          src={car.images[0]}
          alt={car.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3">
          <Badge variant="gold">{categoryLabel}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex flex-row justify-between">
          <div>
            <h3 className="font-playfair text-lg font-semibold text-cream leading-tight">
              {car.name}
            </h3>
            <p className="text-xs text-cream/40 tracking-widest uppercase mt-0.5">
              {car.brand}
            </p>
          </div>
          {/* Availability badge */}
          <div>
            <Badge variant={car.available ? "available" : "unavailable"}>
              {car.available ? t("available") : t("unavailable")}
            </Badge>
          </div>
        </div>

        {/* Specs mini */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-xs text-cream/50">
            <span className="text-gold/70">⚡</span> {car.specs.power}
          </div>
          <div className="text-xs text-cream/50">
            <span className="text-gold/70">💺</span> {car.specs.seats}{" "}
            {locale === "ar" ? "مقاعد" : "seats"}
          </div>
          <div className="text-xs text-cream/50 col-span-2 truncate">
            <span className="text-gold/70">🔧</span> {car.specs.engine}
          </div>
        </div>

        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-3 pt-3 border-t border-luxury-border/30">
          <Link href={`/fleet/${car.id}`}>
            <Button
              variant="outline"
              size="sm"
              className={!car.available ? "opacity-50 cursor-not-allowed" : ""}
            >
              {t("viewDetails")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
