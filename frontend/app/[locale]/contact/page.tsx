'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { submitContactMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Phone, MapPin, CheckCircle } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/instagram-icon';

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await submitContactMessage(form);
    setSubmitting(false);
    setFormSuccess(true);
    setForm({ name: '', phone: '', message: '' });
  };

  const contactItems = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: t('whatsapp'),
      value: '+20 100 000 0000',
      href: 'https://wa.me/201000000000',
      bg: 'bg-green-900/20 border-green-700/30',
      iconColor: 'text-green-400',
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: t('phone'),
      value: '+20 100 000 0000',
      href: 'tel:+201000000000',
      bg: 'bg-blue-900/20 border-blue-700/30',
      iconColor: 'text-blue-400',
    },
    {
      icon: <InstagramIcon className="w-6 h-6" />,
      label: t('instagram'),
      value: '@eccelso.sharkawy',
      href: 'https://instagram.com/eccelso.sharkawy',
      bg: 'bg-pink-900/20 border-pink-700/30',
      iconColor: 'text-pink-400',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: t('location'),
      value: t('location'),
      href: 'https://maps.google.com/?q=Cairo,Egypt',
      bg: 'bg-luxury-gray border-luxury-border',
      iconColor: 'text-gold',
    },
  ];

  return (
    <>
      {/* Header */}
      <section className="pt-28 pb-12 bg-luxury-dark border-b border-luxury-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-gold">
            {locale === 'ar' ? 'نحن هنا' : "We're Here"}
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-cream">{t('title')}</h1>
          <div className="divider-gold" />
          <p className="text-cream/50 text-sm max-w-md mx-auto">{t('subtitle')}</p>
        </div>
      </section>

      <section className="section-padding bg-luxury-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* WhatsApp — Primary CTA */}
          <div className="mb-10">
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-4 w-full py-5 bg-green-900/20 border border-green-700/30 hover:bg-green-900/40 hover:border-green-600/50 transition-all duration-300"
            >
              <MessageCircle className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
              <div className={`${isRTL ? 'text-right' : ''}`}>
                <div className="text-base font-semibold text-cream tracking-wide">{t('whatsapp')}</div>
                <div className="text-sm text-green-400">+20 100 000 0000</div>
              </div>
            </a>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10${isRTL ? ' lg:flex lg:flex-row-reverse' : ''}`}>
            {/* Contact Cards */}
            <div className="space-y-4">
              <h2 className={`text-xs tracking-[0.3em] uppercase text-gold font-semibold mb-4${isRTL ? ' text-right' : ''}`}>
                {locale === 'ar' ? 'طرق التواصل' : 'Reach Us'}
              </h2>
              {contactItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 p-4 border ${item.bg} hover:border-gold/30 transition-all duration-200${isRTL ? ' flex-row-reverse text-right' : ''}`}
                >
                  <div className={`flex-shrink-0 ${item.iconColor}`}>{item.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs tracking-widest uppercase text-cream/40">{item.label}</p>
                    <p className="text-sm text-cream truncate">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Contact Form */}
            <div className="card-glass p-6 space-y-5">
              <h2 className={`text-xs tracking-[0.3em] uppercase text-gold font-semibold${isRTL ? ' text-right' : ''}`}>
                {t('formTitle')}
              </h2>
              <div className="divider-gold" style={{ margin: '0' }} />

              {formSuccess ? (
                <div className="py-8 text-center space-y-3 animate-slide-up">
                  <CheckCircle className="w-10 h-10 text-gold mx-auto" />
                  <p className="text-sm text-cream/70">{t('formSuccess')}</p>
                  <button
                    onClick={() => setFormSuccess(false)}
                    className="text-xs text-gold hover:underline tracking-widest uppercase"
                  >
                    {locale === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`block text-xs tracking-widest uppercase text-cream/60${isRTL ? ' text-right' : ''}`}>
                      {t('formName')} *
                    </label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`block text-xs tracking-widest uppercase text-cream/60${isRTL ? ' text-right' : ''}`}>
                      {t('formPhone')} *
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t('phonePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`block text-xs tracking-widest uppercase text-cream/60${isRTL ? ' text-right' : ''}`}>
                      {t('formMessage')} *
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder={t('messagePlaceholder')}
                      rows={4}
                      required
                      dir={isRTL ? 'rtl' : 'ltr'}
                      className="flex w-full bg-luxury-gray border border-luxury-border rounded-none px-4 py-2 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting
                      ? (locale === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                      : t('formSubmit')}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
