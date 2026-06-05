"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/navigation";
import { Car } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/types";
import { useState } from "react";
import Modal from "./Modal";
import CarForm from "./CarForm";
import {
  Cog,
  Pencil,
  Settings2,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from "lucide-react";

interface ICarCardProps {
  car: Car;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
}

const actionIconClass =
  "flex h-9 w-9 items-center justify-center rounded-xl border border-luxury-border/60 bg-luxury-gray/40 text-cream/55 transition-all duration-200 hover:border-gold/40 hover:bg-gold/10 hover:text-gold hover:shadow-[0_0_12px_rgba(201,168,76,0.15)]";

export default function CarCard({ car, onDelete, isDeleting }: ICarCardProps) {
  const t = useTranslations("fleet");
  const locale = useLocale();
  const [openModal, setOpenModal] = useState(false);
  const [deleteCar, setDeleteCar] = useState(false);
  const categoryLabel = CATEGORY_LABELS[car.category][locale as "en" | "ar"];

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
    <div className="card-glass group overflow-hidden flex flex-col">
      <Modal
        isOpen={deleteCar}
        onClose={() => setDeleteCar(false)}
        content={deleteConfirmation()}
        title="Delete Vehicle?"
        subtitle="Confirm removal from your fleet"
        variant="confirm"
        size="sm"
      />

      <div className="relative h-52 overflow-hidden bg-luxury-gray">
        <Image
          src={car.images?.[0]?.url ?? ""}
          alt={car.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-wrap gap-2">
          {car.featured && (
            <Badge variant="gold" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {locale === "ar" ? "مميزة" : "Featured"}
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 flex flex-wrap gap-2">
          <Badge variant="gold">{categoryLabel}</Badge>
          <Badge variant={car.available ? "available" : "unavailable"}>
            {car.available ? t("available") : t("unavailable")}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="font-playfair text-lg font-semibold text-cream leading-tight">
            {car.name}
          </h3>
          <p className="text-xs text-cream/40 tracking-widest uppercase mt-0.5">
            {car.brand}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-cream/50">
            <Zap className="h-3.5 w-3.5 shrink-0 text-gold/70" />
            <span className="truncate">{car.specs.power || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cream/50">
            <Users className="h-3.5 w-3.5 shrink-0 text-gold/70" />
            <span>
              {car.specs.seats ?? "—"}{" "}
              {locale === "ar" ? "مقاعد" : "seats"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cream/50 col-span-2">
            <Cog className="h-3.5 w-3.5 shrink-0 text-gold/70" />
            <span className="truncate">{car.specs.engine}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cream/50 col-span-2">
            <Settings2 className="h-3.5 w-3.5 shrink-0 text-gold/70" />
            <span className="truncate">{car.specs.transmission}</span>
          </div>
        </div>

        {car.description && (
          <p className="text-xs text-cream/35 line-clamp-2 leading-relaxed">
            {car.description}
          </p>
        )}

        <div className="flex-1" />

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-luxury-border/30">
          <Link href={`/fleet/${car.id}`}>
            <Button
              variant="outline"
              size="sm"
              className={!car.available ? "opacity-50 cursor-not-allowed" : ""}
            >
              {t("viewDetails")}
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className={actionIconClass}
              aria-label="Edit vehicle"
              title="Edit vehicle"
            >
              <Pencil className="h-4 w-4" />
            </button>
            {onDelete && (
              <button
                type="button"
                className={`${actionIconClass} hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.12)]`}
                onClick={() => setDeleteCar(true)}
                aria-label="Delete vehicle"
                title="Delete vehicle"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
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
    </div>
  );
}
