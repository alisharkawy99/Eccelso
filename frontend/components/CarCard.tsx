"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/navigation";
import { Car } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS } from "@/types";
import { useState } from "react";
import Modal from "./Modal";
import CarForm from "./CarForm";
import {
  Cog,
  Pencil,
  Settings2,
  Sparkles,
  Tag,
  Trash2,
  Users,
  Zap,
} from "lucide-react";

interface ICarCardProps {
  car: Car;
  isAdmin?: boolean;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
}

export default function CarCard({
  car,
  isAdmin = false,
  onDelete,
  isDeleting,
}: ICarCardProps) {
  const t = useTranslations("fleet");
  const locale = useLocale();
  const [openModal, setOpenModal] = useState(false);
  const [deleteCar, setDeleteCar] = useState(false);
  const categoryLabel = CATEGORY_LABELS[car.category][locale as "en" | "ar"];
  const conditionLabel =
    (car.condition || "new") === "new"
      ? locale === "ar" ? "جديدة" : "New"
      : locale === "ar" ? "مستعملة" : "Used";
  const isBookable = !car.sold;

  const specs = [
    { icon: Zap, label: locale === "ar" ? "القوة" : "Power", value: car.specs.power || "—" },
    {
      icon: Users,
      label: locale === "ar" ? "المقاعد" : "Seats",
      value: String(car.specs.seats ?? "—"),
    },
    { icon: Cog, label: locale === "ar" ? "المحرك" : "Engine", value: car.specs.engine },
    {
      icon: Settings2,
      label: locale === "ar" ? "ناقل الحركة" : "Trans.",
      value: car.specs.transmission,
    },
  ];

  const deleteConfirmation = () => (
    <div className="space-y-4">
      <p className="text-sm text-cream/55">
        This will permanently remove{" "}
        <span className="text-cream font-medium">{car.name}</span> from the
        fleet. This action cannot be undone.
      </p>
      <div className="flex flex-row gap-3">
        <Button
          type="button"
          onClick={() => setDeleteCar(false)}
          variant="outline"
          size="sm"
          className="w-full border-luxury-border text-cream"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="gold"
          size="sm"
          disabled={isDeleting}
          className="w-full uppercase tracking-widest"
          onClick={() => {
            onDelete?.();
            setDeleteCar(false);
          }}
        >
          {isDeleting ? "Deleting..." : "Delete Vehicle"}
        </Button>
      </div>
    </div>
  );

  return (
    <article className="card-glass group flex flex-col overflow-hidden rounded-2xl">
      <Modal
        isOpen={deleteCar}
        onClose={() => setDeleteCar(false)}
        content={deleteConfirmation()}
        title="Delete Vehicle?"
        subtitle="Confirm removal from your fleet"
        variant="confirm"
        size="sm"
      />

      <Link
        href={`/fleet/${car.id}`}
        className="relative block aspect-[16/10] overflow-hidden bg-luxury-gray"
      >
        <Image
          src={car.images?.[0]?.url ?? ""}
          alt={car.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent" />

        {/* Meta row */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between gap-2 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {car.sold && (
              <Badge variant="sold" size="sm">
                {locale === "ar" ? "مباعة" : "Sold"}
              </Badge>
            )}
            {car.featured && (
              <Badge variant="featured" size="sm">
                <Sparkles className="h-3 w-3" />
                {locale === "ar" ? "مميزة" : "Featured"}
              </Badge>
            )}
          </div>
          <Badge variant="category" size="sm">
            {categoryLabel}
          </Badge>
        </div>

        {/* Title on image */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80">
            {car.brand}
          </p>
          <h3 className="mt-0.5 font-playfair text-xl font-bold leading-tight text-cream sm:text-2xl">
            {car.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="condition" size="sm">
              <Tag className="h-3 w-3" />
              {conditionLabel}
            </Badge>
            <Badge
              variant={car.sold ? "sold" : "available"}
              size="sm"
              dot={!car.sold}
            >
              {car.sold
                ? locale === "ar"
                  ? "مباعة"
                  : "Sold"
                : t("available")}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Specs + actions */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="grid grid-cols-4 divide-x divide-luxury-border/30 rounded-xl border border-luxury-border/20 bg-luxury-black/30">
          {specs.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 px-1 py-3 text-center first:rounded-s-xl last:rounded-e-xl"
            >
              <Icon className="h-3.5 w-3.5 text-gold/50" />
              <span className="text-[9px] uppercase tracking-wider text-cream/30">
                {label}
              </span>
              <span className="w-full truncate px-1 text-[11px] font-medium text-cream/70">
                {value}
              </span>
            </div>
          ))}
        </div>

        {car.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-cream/35">
            {car.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <Link href={`/fleet/${car.id}`} className="flex-1">
            <Button
              variant={isBookable ? "gold" : "outline"}
              size="sm"
              className={`w-full text-xs tracking-widest uppercase ${
                !isBookable ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {t("viewDetails")}
            </Button>
          </Link>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setOpenModal(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-luxury-border/40 text-cream/45 transition-colors hover:border-gold/40 hover:text-gold"
                aria-label="Edit vehicle"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => setDeleteCar(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-luxury-border/40 text-cream/45 transition-colors hover:border-red-500/40 hover:text-red-400"
                  aria-label="Delete vehicle"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        onClose={() => setOpenModal(false)}
        isOpen={openModal}
        isEdit
        title={`Edit ${car.name}`}
        subtitle="Update vehicle details and specifications"
        size="lg"
        content={
          <CarForm onClose={() => setOpenModal(false)} initialData={car} />
        }
      />
    </article>
  );
}
