'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Star, Eye, Heart, Shield } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const values = [
    {
      icon: <Star className="w-6 h-6 text-gold" />,
      title: t('value1Title'),
      desc: t('value1Desc'),
    },
    {
      icon: <Eye className="w-6 h-6 text-gold" />,
      title: t('value2Title'),
      desc: t('value2Desc'),
    },
    {
      icon: <Heart className="w-6 h-6 text-gold" />,
      title: t('value3Title'),
      desc: t('value3Desc'),
    },
    {
      icon: <Shield className="w-6 h-6 text-gold" />,
      title: t('value4Title'),
      desc: t('value4Desc'),
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-luxury-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=60"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-luxury-dark" />
        <div className={`relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4${isRTL ? ' text-center' : ''}`}>
          <p className="text-xs tracking-[0.3em] uppercase text-gold">
            {locale === 'ar' ? 'القصة' : 'Our Story'}
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-cream">
            {t('title')}
          </h1>
          <p className="font-playfair text-xl text-gold italic">{t('subtitle')}</p>
          <div className="divider-gold" />
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-luxury-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className={`space-y-5${isRTL ? ' text-right md:order-2' : ''}`}>
              <p className="text-cream/70 leading-relaxed">{t('story')}</p>
              <p className="text-cream/70 leading-relaxed">{t('story2')}</p>
            </div>
            <div className={`relative aspect-[3/4] bg-luxury-gray overflow-hidden${isRTL ? ' md:order-1' : ''}`}>
              <Image
                src="https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800&q=85"
                alt="Eccelso luxury cars"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 border border-gold/20" />
              {/* Gold corner accent */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/60" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-luxury-dark border-y border-luxury-border/20 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: '500+', label: locale === 'ar' ? 'عميل سعيد' : 'Happy Clients' },
              { num: '8+', label: locale === 'ar' ? 'سيارة فاخرة' : 'Premium Cars' },
              { num: '4', label: locale === 'ar' ? 'سنوات تميز' : 'Years Excellence' },
              { num: '100%', label: locale === 'ar' ? 'رضا العملاء' : 'Satisfaction' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-playfair text-3xl font-bold text-gold-gradient">{stat.num}</div>
                <div className="text-xs tracking-widest uppercase text-cream/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-luxury-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 space-y-3${isRTL ? ' text-center' : ''}`}>
            <p className="text-xs tracking-[0.3em] uppercase text-gold">
              {locale === 'ar' ? 'مبادئنا' : 'Principles'}
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-cream">{t('valuesTitle')}</h2>
            <div className="divider-gold" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((val) => (
              <div
                key={val.title}
                className={`card-glass p-6 space-y-3 text-center${isRTL ? ' text-right' : ''}`}
              >
                <div className="flex justify-center">{val.icon}</div>
                <h3 className="font-playfair font-semibold text-cream">{val.title}</h3>
                <p className="text-xs text-cream/40 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-16 bg-luxury-dark border-t border-luxury-border/20">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <p className="text-cream/40 text-sm">
            {locale === 'ar'
              ? 'شاهد سياراتنا الفاخرة على إنستغرام'
              : 'See our luxury fleet in action on Instagram'}
          </p>
          <a
            href="https://instagram.com/eccelso.sharkawy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block btn-gold-outline px-8 py-3 text-xs tracking-widest uppercase"
          >
            @eccelso.sharkawy
          </a>
        </div>
      </section>
    </>
  );
}
