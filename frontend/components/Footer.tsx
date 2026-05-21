'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { MessageCircle, MapPin, Phone } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/instagram-icon';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/fleet', label: t('nav.fleet') },
    { href: '/booking', label: t('nav.booking') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <footer className="bg-luxury-dark border-t border-luxury-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-10${isRTL ? ' text-right' : ''}`}>
          <div className="space-y-4">
            <div>
              <div className="font-playfair text-2xl font-bold tracking-[0.15em] text-cream uppercase">
                Eccelso
              </div>
              <div className="text-xs tracking-[0.2em] text-gold uppercase">by Sharkawy</div>
            </div>
            <p className="text-cream/40 text-sm leading-relaxed max-w-xs">
              {locale === 'ar'
                ? 'تأجير السيارات الفاخرة في القاهرة، مصر. اختبر قمة التميز في عالم السيارات.'
                : 'Luxury car rental in Cairo, Egypt. Experience the pinnacle of automotive excellence.'}
            </p>
            <div className={`flex items-center gap-4${isRTL ? ' flex-row-reverse justify-end' : ''}`}>
              <a
                href="https://instagram.com/eccelso.sharkawy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/40 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/40 hover:text-gold transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs tracking-[0.2em] uppercase text-gold font-semibold">
              {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-cream/40 hover:text-gold transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs tracking-[0.2em] uppercase text-gold font-semibold">
              {locale === 'ar' ? 'تواصل معنا' : 'Contact'}
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+201000000000"
                className={`flex items-center gap-3 text-sm text-cream/40 hover:text-gold transition-colors${
                  isRTL ? ' flex-row-reverse' : ''
                }`}
              >
                <Phone className="w-4 h-4 flex-shrink-0 text-gold/60" />
                <span>+20 100 000 0000</span>
              </a>
              <div
                className={`flex items-center gap-3 text-sm text-cream/40${
                  isRTL ? ' flex-row-reverse' : ''
                }`}
              >
                <MapPin className="w-4 h-4 flex-shrink-0 text-gold/60" />
                <span>{t('contact.location')}</span>
              </div>
              <a
                href="https://instagram.com/eccelso.sharkawy"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 text-sm text-cream/40 hover:text-gold transition-colors${
                  isRTL ? ' flex-row-reverse' : ''
                }`}
              >
                <InstagramIcon className="w-4 h-4 flex-shrink-0 text-gold/60" />
                <span>@eccelso.sharkawy</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-luxury-border/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream/30 tracking-wide">
          <p>
            © {new Date().getFullYear()} Eccelso by Sharkawy. {t('common.allRights')}.
          </p>
          <p>{locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</p>
        </div>
      </div>
    </footer>
  );
}
