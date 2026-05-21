'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { Car } from '@/types';
import { getCarById } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/types';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CarDetailPage() {
  const params = useParams();
  const t = useTranslations('car');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      getCarById(params.id as string).then((data) => {
        setCar(data);
        setLoading(false);
      });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black pt-20 flex items-center justify-center">
        <div className="text-gold/40 text-sm tracking-widest uppercase animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-luxury-black pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-cream/40 text-sm">Car not found</p>
        <Link href="/fleet">
          <Button variant="outline">{t('backToFleet')}</Button>
        </Link>
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[car.category][locale as 'en' | 'ar'];

  return (
    <>
      {/* Back button */}
      <div className="pt-24 pb-4 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/fleet"
            className={`inline-flex items-center gap-2 text-xs tracking-widest uppercase text-cream/40 hover:text-gold transition-colors${isRTL ? ' flex-row-reverse' : ''}`}
          >
            {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            {t('backToFleet')}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="bg-luxury-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* ── Gallery ── */}
            <div className="space-y-3">
              {/* Main image */}
              <div className="relative aspect-[16/10] bg-luxury-gray overflow-hidden">
                <Image
                  src={car.images[activeImage]}
                  alt={`${car.name} - image ${activeImage + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {/* Prev/Next arrows */}
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((p) => (p - 1 + car.images.length) % car.images.length)}
                      className={`absolute top-1/2 -translate-y-1/2 p-2 bg-luxury-black/60 hover:bg-luxury-black text-cream hover:text-gold transition-colors ${
                        isRTL ? 'right-2' : 'left-2'
                      }`}
                    >
                      {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setActiveImage((p) => (p + 1) % car.images.length)}
                      className={`absolute top-1/2 -translate-y-1/2 p-2 bg-luxury-black/60 hover:bg-luxury-black text-cream hover:text-gold transition-colors ${
                        isRTL ? 'left-2' : 'right-2'
                      }`}
                    >
                      {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {car.images.length > 1 && (
                <div className={`flex gap-2${isRTL ? ' flex-row-reverse' : ''}`}>
                  {car.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative flex-1 aspect-[4/3] overflow-hidden border-2 transition-colors ${
                        activeImage === i ? 'border-gold' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${car.name} thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className={`flex items-center gap-2 mb-2 flex-wrap${isRTL ? ' flex-row-reverse' : ''}`}>
                  <Badge variant="gold">{categoryLabel}</Badge>
                  <Badge variant={car.available ? 'available' : 'unavailable'}>
                    {car.available ? t('available') : t('unavailable')}
                  </Badge>
                </div>
                <p className="text-xs tracking-[0.3em] uppercase text-cream/40 mb-1">{car.brand}</p>
                <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-cream">{car.name}</h1>
              </div>

              {/* Price */}
              <div className="border-t border-b border-luxury-border/30 py-4">
                <div className={`flex items-baseline gap-2${isRTL ? ' flex-row-reverse' : ''}`}>
                  <span className="font-playfair text-4xl font-bold text-gold">
                    {formatPrice(car.pricePerDay, locale)}
                  </span>
                  <span className="text-sm text-cream/40 tracking-wide">{t('pricePerDay')}</span>
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <p className="text-cream/50 text-sm leading-relaxed">{car.description}</p>
              )}

              {/* Specs */}
              <div className="space-y-3">
                <h2 className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">{t('specs')}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t('engine'), value: car.specs.engine },
                    { label: t('power'), value: car.specs.power },
                    { label: t('seats'), value: String(car.specs.seats) },
                    { label: t('transmission'), value: car.specs.transmission },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className={`bg-luxury-gray p-3 space-y-1${isRTL ? ' text-right' : ''}`}
                    >
                      <p className="text-[10px] tracking-widest uppercase text-cream/30">{spec.label}</p>
                      <p className="text-sm font-medium text-cream">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className={`flex gap-3${isRTL ? ' flex-row-reverse' : ''}`}>
                <Link href={`/booking?car=${car.id}`} className="flex-1">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={!car.available}
                  >
                    {t('bookNow')}
                  </Button>
                </Link>
                <a
                  href="https://wa.me/201000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
