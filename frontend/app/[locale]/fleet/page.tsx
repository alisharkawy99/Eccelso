'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Car, CarCategory } from '@/types';
import { getCars } from '@/lib/api';
import CarCard from '@/components/CarCard';

const FILTERS: { key: 'all' | CarCategory; labelKey: string }[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'supercar', labelKey: 'filterSupercar' },
  { key: 'luxury_sedan', labelKey: 'filterLuxurySedan' },
  { key: 'sports', labelKey: 'filterSports' },
  { key: 'premium_suv', labelKey: 'filterPremiumSuv' },
];

export default function FleetPage() {
  const t = useTranslations('fleet');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | CarCategory>('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    getCars().then((data) => {
      setCars(data);
      setLoading(false);
    });
  }, []);

  const filtered = cars.filter((car) => {
    const matchesCategory = activeFilter === 'all' || car.category === activeFilter;
    const matchesAvail = !availableOnly || car.available;
    return matchesCategory && matchesAvail;
  });

  return (
    <>
      {/* Page Header */}
      <section className="pt-28 pb-12 bg-luxury-dark border-b border-luxury-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-gold">
            {locale === 'ar' ? 'استكشف' : 'Explore'}
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-cream">
            {t('title')}
          </h1>
          <div className="divider-gold" />
          <p className="text-cream/50 text-sm max-w-lg mx-auto">{t('subtitle')}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-luxury-black border-b border-luxury-border/20 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex items-center gap-4 overflow-x-auto pb-1${isRTL ? ' flex-row-reverse' : ''}`}>
            {/* Category filters */}
            <div className={`flex items-center gap-2 flex-shrink-0${isRTL ? ' flex-row-reverse' : ''}`}>
              {FILTERS.map(({ key, labelKey }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-all duration-200 flex-shrink-0 ${
                    activeFilter === key
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-luxury-border text-cream/40 hover:border-gold/40 hover:text-cream/70'
                  }`}
                >
                  {t(labelKey as keyof typeof t)}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-luxury-border/50 flex-shrink-0 hidden sm:block" />

            {/* Available only toggle */}
            <label className={`flex items-center gap-2 flex-shrink-0 cursor-pointer${isRTL ? ' flex-row-reverse' : ''}`}>
              <div
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`w-9 h-5 rounded-full border transition-all duration-200 relative cursor-pointer ${
                  availableOnly
                    ? 'bg-gold/20 border-gold'
                    : 'bg-luxury-gray border-luxury-border'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-gold absolute top-0.5 transition-all duration-200 ${
                    availableOnly ? 'left-5' : 'left-1'
                  }`}
                />
              </div>
              <span className="text-xs tracking-wider text-cream/50">
                {locale === 'ar' ? 'المتاحة فقط' : 'Available Only'}
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-luxury-gray animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-cream/40 space-y-3">
              <p className="text-4xl">🚗</p>
              <p className="text-sm tracking-widest uppercase">{t('noResults')}</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-cream/30 tracking-wider mb-6">
                {filtered.length} {locale === 'ar' ? 'سيارة' : filtered.length === 1 ? 'car' : 'cars'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
