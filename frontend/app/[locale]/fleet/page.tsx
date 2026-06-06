"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Car, CarCategory } from "@/types";
import { getCars, getCarsByCategory } from "@/lib/api";
import CarCard from "@/components/CarCard";
import { useCars } from "@/app/hooks/useCar";
import { useAuth } from "@/app/hooks/useAuth";
import CarForm from "@/components/CarForm";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Zap, Crown, Flag, Mountain } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FILTERS: {
  key: "all" | CarCategory;
  labelKey: string;
  icon: LucideIcon;
}[] = [
  { key: "all", labelKey: "filterAll", icon: LayoutGrid },
  { key: "supercar", labelKey: "filterSupercar", icon: Zap },
  { key: "luxury_sedan", labelKey: "filterLuxurySedan", icon: Crown },
  { key: "sports", labelKey: "filterSports", icon: Flag },
  { key: "premium_suv", labelKey: "filterPremiumSuv", icon: Mountain },
];

// ... keep your imports ...

export default function FleetPage() {
  const t = useTranslations("fleet");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { handleDeleteCar, isDeleting } = useCars();
  const { isAdmin } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | CarCategory>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [addingCar, setAddingCar] = useState(false);
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // If activeFilter is "all", fetch everything, else fetch by category
    const fetchPromise =
      activeFilter === "all" ? getCars() : getCarsByCategory(activeFilter);

    fetchPromise.then((data) => {
      if (isMounted) {
        // Apply the "available only" filter locally (or move to backend if preferred)
        const finalData = availableOnly
          ? data.filter((car) => !car.sold)
          : data;
        setCars(finalData);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
    // We include availableOnly in the dependency array so it refreshes the view when toggled
  }, [activeFilter, availableOnly, addingCar, isDeleting]);

  // Now, 'cars' is already filtered from the backend, so we just map 'cars'
  return (
    <>
      {/* Filters */}
      <section className="bg-luxury-black/95 border-b border-luxury-border/20 sticky top-16 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div
            className={`flex flex-wrap items-center gap-3 sm:gap-4${isRTL ? " flex-row-reverse" : ""}`}
          >
            <div
              className={`inline-flex items-center gap-1 rounded-2xl border border-luxury-border/25 bg-luxury-gray/20 p-1 backdrop-blur-sm overflow-x-auto max-w-full${isRTL ? " flex-row-reverse" : ""}`}
            >
              {FILTERS.map(({ key, labelKey, icon: Icon }) => {
                const isActive = activeFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveFilter(key)}
                    className={`group inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-semibold tracking-wider uppercase transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-gold/25 via-gold/10 to-transparent border border-gold/40 text-gold shadow-[0_0_24px_rgba(201,168,76,0.12)]"
                        : "border border-transparent text-cream/40 hover:border-luxury-border/40 hover:bg-luxury-gray/40 hover:text-cream/75"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 transition-colors ${
                        isActive
                          ? "text-gold"
                          : "text-cream/30 group-hover:text-gold/60"
                      }`}
                    />
                    {t(labelKey as keyof typeof t)}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`inline-flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 transition-all duration-300${isRTL ? " flex-row-reverse" : ""} ${
                availableOnly
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-400"
                  : "border-luxury-border/25 bg-luxury-gray/20 text-cream/45 hover:border-luxury-border/50 hover:text-cream/65"
              }`}
            >
              <span
                className={`relative flex h-4 w-7 items-center rounded-full border transition-all duration-300 ${
                  availableOnly
                    ? "border-emerald-500/50 bg-emerald-500/20"
                    : "border-luxury-border bg-luxury-gray"
                }`}
              >
                <span
                  className={`absolute h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    availableOnly
                      ? "start-3.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                      : "start-0.5 bg-cream/30"
                  }`}
                />
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap">
                {locale === "ar" ? "المتاحة فقط" : "Available Only"}
              </span>
            </button>

            {isAdmin && (
              <Button
                variant="gold"
                size="sm"
                className="ms-auto gap-2 text-xs tracking-widest uppercase shrink-0"
                onClick={() => setOpenModal(true)}
              >
                <Plus className="h-4 w-4" />
                {locale === "ar" ? "إضافة سيارة" : "Add Vehicle"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="section-padding bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-luxury-gray animate-pulse" />
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20 text-cream/40 space-y-3">
              <p className="text-4xl">🚗</p>
              <p className="text-sm tracking-widest uppercase">
                {t("noResults")}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-cream/30 tracking-wider mb-6">
                {cars.length}{" "}
                {locale === "ar" ? "سيارة" : cars.length === 1 ? "car" : "cars"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    isAdmin={isAdmin}
                    onDelete={isAdmin ? () => handleDeleteCar(car.id) : undefined}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <Modal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          title={locale === "ar" ? "إضافة سيارة جديدة" : "Add New Vehicle"}
          subtitle={
            locale === "ar"
              ? "أدخل تفاصيل السيارة لإضافتها إلى الأسطول"
              : "Fill in the details to list a new vehicle in your fleet"
          }
          size="lg"
          content={
            <CarForm
              onClose={() => setOpenModal(false)}
              isLoading={addingCar}
              setisLoading={setAddingCar}
            />
          }
        />
      </section>
    </>
  );
}
