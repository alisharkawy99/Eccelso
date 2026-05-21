'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { Car } from '@/types';
import { getFeaturedCars } from '@/lib/api';
import CarCard from '@/components/CarCard';
import { Button } from '@/components/ui/button';
import { Shield, Star, Zap } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/instagram-icon';

export default function HomePage() {
  const t = useTranslations('home');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedCars().then((cars) => {
      setFeaturedCars(cars);
      setLoading(false);
    });
  }, []);

  const stats = [
    { value: '500+', label: t('statsClients') },
    { value: '8+', label: t('statsFleet') },
    { value: '4', label: t('statsYears') },
    { value: '24/7', label: t('statsSupport') },
  ];

  const whyItems = [
    {
      icon: <Star className="w-6 h-6 text-gold" />,
      title: t('whyPremiumTitle'),
      desc: t('whyPremiumDesc'),
    },
    {
      icon: <Shield className="w-6 h-6 text-gold" />,
      title: t('whyTrustedTitle'),
      desc: t('whyTrustedDesc'),
    },
    {
      icon: <Zap className="w-6 h-6 text-gold" />,
      title: t('whyFlexibleTitle'),
      desc: t('whyFlexibleDesc'),
    },
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=85"
            alt="Luxury car"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-luxury-black/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/40 via-transparent to-luxury-black" />
        </div>

        {/* Content */}
        <div className={`relative z-10 text-center px-4 animate-fade-in${isRTL ? ' text-center' : ''}`}>
          <p className="text-xs tracking-[0.4em] uppercase text-gold mb-4">
            {locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}
          </p>
          <h1 className="font-playfair text-6xl sm:text-8xl lg:text-9xl font-bold tracking-[0.08em] text-cream uppercase leading-none">
            {t('heroTitle')}
          </h1>
          <p className="text-sm sm:text-base tracking-[0.3em] text-gold uppercase mt-2 mb-3">
            {t('heroSubtitle')}
          </p>
          <div className="divider-gold mb-6" />
          <p className="text-cream/60 text-sm sm:text-base tracking-widest uppercase mb-10">
            {t('heroTagline')}
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center${isRTL ? ' sm:flex-row-reverse' : ''}`}>
            <Link href="/fleet">
              <Button variant="gold" size="lg" className="w-full sm:w-auto">
                {t('heroCTA1')}
              </Button>
            </Link>
            <Link href="/booking">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t('heroCTA2')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-40">
          <div className="w-px h-8 bg-gold/60" />
          <div className="w-1 h-1 bg-gold rounded-full" />
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────── */}
      <section className="bg-luxury-dark border-y border-luxury-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="font-playfair text-3xl sm:text-4xl font-bold text-gold-gradient">
                  {stat.value}
                </div>
                <div className="text-xs tracking-widest uppercase text-cream/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Fleet ────────────────────────────────────────────── */}
      <section className="section-padding bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs tracking-[0.3em] uppercase text-gold">{locale === 'ar' ? 'الأسطول' : 'Fleet'}</p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-cream">
              {t('featuredTitle')}
            </h2>
            <div className="divider-gold" />
            <p className="text-cream/50 text-sm max-w-md mx-auto">{t('featuredSubtitle')}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-luxury-gray animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/fleet">
              <Button variant="outline" size="lg">
                {t('viewAll')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Eccelso ───────────────────────────────────────────────── */}
      <section className="section-padding bg-luxury-dark border-y border-luxury-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs tracking-[0.3em] uppercase text-gold">
              {locale === 'ar' ? 'مميزاتنا' : 'Our Edge'}
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-cream">{t('whyTitle')}</h2>
            <div className="divider-gold" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyItems.map((item) => (
              <div
                key={item.title}
                className={`text-center p-8 card-glass space-y-4${isRTL ? ' text-right' : ''}`}
              >
                <div className="flex justify-center">{item.icon}</div>
                <h3 className="font-playfair text-lg font-semibold text-cream">{item.title}</h3>
                <p className="text-cream/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instagram CTA ─────────────────────────────────────────────── */}
      <section className="section-padding bg-luxury-black">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <InstagramIcon className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-cream">{t('instagramTitle')}</h2>
          <p className="text-gold tracking-widest">{t('instagramHandle')}</p>
          <div className="divider-gold" />
          <p className="text-cream/40 text-sm">
            {locale === 'ar'
              ? 'تابع أحدث السيارات والعروض الحصرية على إنستغرام'
              : 'Follow us for the latest cars, exclusive offers, and behind-the-scenes moments.'}
          </p>
          <a
            href="https://instagram.com/eccelso.sharkawy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block btn-gold px-8 py-3 text-xs tracking-widest uppercase"
          >
            {t('instagramCTA')}
          </a>
        </div>
      </section>
    </>
  );
}
