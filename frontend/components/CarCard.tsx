"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/navigation";
import { Car } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/types";
import { SetStateAction, Dispatch, useState } from "react";
import Modal from "./Modal";
import CarForm from "./CarForm";
import { Trash2 } from "lucide-react";
interface ICarCardProps {
  car: Car;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
}

export default function CarCard({ car, onDelete, isDeleting }: ICarCardProps) {
  const t = useTranslations("fleet");
  const locale = useLocale();
  const [openModal, setOpenModal] = useState(false);
  const [deleteCar, setDeleteCar] = useState(false);
  const categoryLabel = CATEGORY_LABELS[car.category][locale as "en" | "ar"];
  const deleteConfirmation = () => {
    return (
      <div className="flex flex-row gap-3">
        <Button
          type="button"
          onClick={() => {
            setDeleteCar(false);
          }}
          variant="outline"
          size="sm"
          className="w-full border-luxury-border text-cream"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="gold"
          size="sm"
          className="w-full uppercase tracking-widest"
          onClick={() => {
            onDelete?.();
            setDeleteCar(false);
          }}
        >
          {isDeleting ? "Deleting car..." : "Delete"}
        </Button>
      </div>
    );
  };
  return (
    <div className="card-glass group overflow-hidden flex flex-col">
      {/* Image */}
      <Modal
        isOpen={deleteCar}
        onClose={() => setDeleteCar(false)}
        content={deleteConfirmation()}
        title={`Are you Sure u want to delete ${car.name}`}
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
            <button
              onClick={() => setOpenModal(true)}
              className="btn-gold-outline text-xs tracking-widest uppercase px-5 py-2"
            >
              Edit Car
            </button>
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
          {onDelete && (
            <button
              className="text-[#c9a84c] transition-all duration-300 
         hover:bg-[#c9a84c]/15 hover:-translate-y-1 
         hover:shadow-[0_0_15px_rgba(201,168,76,0.6),0_0_30px_rgba(201,168,76,0.3)]
         hover:drop-shadow-[0_0_5px_rgba(201,168,76,0.5)]"
              onClick={() => setDeleteCar(true)}
            >
              <Trash2 />
            </button>
          )}
        </div>
      </div>
      <Modal
        onClose={() => setOpenModal(false)}
        isOpen={openModal}
        content={
          <CarForm onClose={() => setOpenModal(false)} initialData={car} />
        }
      />
    </div>
  );
}
