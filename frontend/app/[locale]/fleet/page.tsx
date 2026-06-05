"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Car, CarCategory } from "@/types";
import { getCars, getCarsByCategory } from "@/lib/api";
import CarCard from "@/components/CarCard";
import axios from "axios";
import { useCars } from "@/app/hooks/useCar";
import CarForm from "@/components/CarForm";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const FILTERS: { key: "all" | CarCategory; labelKey: string }[] = [
  { key: "all", labelKey: "filterAll" },
  { key: "supercar", labelKey: "filterSupercar" },
  { key: "luxury_sedan", labelKey: "filterLuxurySedan" },
  { key: "sports", labelKey: "filterSports" },
  { key: "premium_suv", labelKey: "filterPremiumSuv" },
];

// ... keep your imports ...

export default function FleetPage() {
  const t = useTranslations("fleet");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { handleDeleteCar, isDeleting } = useCars();
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
          ? data.filter((car) => car.available)
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
      <section className="bg-luxury-black border-b border-luxury-border/20 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div
            className={`flex items-center gap-4 overflow-x-auto pb-1${isRTL ? " flex-row-reverse" : ""}`}
          >
            {/* Category filters */}
            <div
              className={`flex items-center gap-2 flex-shrink-0${isRTL ? " flex-row-reverse" : ""}`}
            >
              {FILTERS.map(({ key, labelKey }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-all duration-200 flex-shrink-0 ${
                    activeFilter === key
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-luxury-border text-cream/40 hover:border-gold/40 hover:text-cream/70"
                  }`}
                >
                  {t(labelKey as keyof typeof t)}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-luxury-border/50 flex-shrink-0 hidden sm:block" />

            {/* Available only toggle */}
            <label
              className={`flex items-center gap-2 flex-shrink-0 cursor-pointer${isRTL ? " flex-row-reverse" : ""}`}
            >
              <div
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`w-9 h-5 rounded-full border transition-all duration-200 relative cursor-pointer ${
                  availableOnly
                    ? "bg-gold/20 border-gold"
                    : "bg-luxury-gray border-luxury-border"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-gold absolute top-0.5 transition-all duration-200 ${
                    availableOnly ? "left-5" : "left-1"
                  }`}
                />
              </div>
              <span className="text-xs tracking-wider text-cream/50">
                {locale === "ar" ? "المتاحة فقط" : "Available Only"}
              </span>
            </label>
            <Button
              variant="gold"
              size="sm"
              className="ms-auto gap-2 text-xs tracking-widest uppercase"
              onClick={() => setOpenModal(true)}
            >
              <Plus className="h-4 w-4" />
              {locale === "ar" ? "إضافة سيارة" : "Add Vehicle"}
            </Button>
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
                    onDelete={() => handleDeleteCar(car.id)}
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
