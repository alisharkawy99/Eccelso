'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Car } from '@/types';
import { getCars, submitBooking } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateDays, getTodayISO, getTomorrowISO } from '@/lib/utils';
import { FormField } from '@/components/ui/FormField';
import {
  FieldErrors,
  hasErrors,
  inputErrorClass,
  validateDateRange,
  validateName,
  validatePhone,
  validateRequired,
} from '@/lib/validation';
import { CheckCircle, Car as CarIcon } from 'lucide-react';

export default function BookingPage() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const searchParams = useSearchParams();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState({
    carId: searchParams.get('car') || '',
    startDate: getTodayISO(),
    endDate: getTomorrowISO(),
    customerName: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    getCars().then((data) => {
      setCars(data.filter((c) => c.available));
      setLoading(false);
    });
  }, []);

  const selectedCar = cars.find((c) => c.id === form.carId) || null;
  const totalDays = calculateDays(form.startDate, form.endDate);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      if (name === 'startDate' || name === 'endDate') {
        delete next.startDate;
        delete next.endDate;
      }
      return next;
    });
  };

  const validateBooking = (): FieldErrors => {
    const next: FieldErrors = {};
    const carError = validateRequired(form.carId, 'Car selection');
    const nameError = validateName(form.customerName);
    const phoneError = validatePhone(form.phone);
    const dateErrors = validateDateRange(form.startDate, form.endDate);

    if (carError) next.carId = carError;
    if (nameError) next.customerName = nameError;
    if (phoneError) next.phone = phoneError;
    return { ...next, ...dateErrors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBooking();
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    setSubmitting(true);
    await submitBooking(form);
    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center px-4 pt-16">
        <div className="text-center space-y-5 max-w-md animate-slide-up">
          <CheckCircle className="w-16 h-16 text-gold mx-auto" />
          <h2 className="font-playfair text-3xl font-bold text-cream">{t('successTitle')}</h2>
          <div className="divider-gold" />
          <p className="text-cream/50 text-sm leading-relaxed">{t('successDesc')}</p>
          <div className="flex gap-3 justify-center pt-2">
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold px-6 py-3 text-xs tracking-widest uppercase"
            >
              WhatsApp
            </a>
            <button
              onClick={() => setSuccess(false)}
              className="btn-gold-outline px-6 py-3 text-xs tracking-widest uppercase"
            >
              {locale === 'ar' ? 'حجز آخر' : 'New Booking'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="pt-28 pb-10 bg-luxury-dark border-b border-luxury-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-gold">
            {locale === 'ar' ? 'الحجز' : 'Reservation'}
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-cream">{t('title')}</h1>
          <div className="divider-gold" />
          <p className="text-cream/50 text-sm">{t('subtitle')}</p>
        </div>
      </section>

      <section className="section-padding bg-luxury-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8${isRTL ? ' lg:flex lg:flex-row-reverse' : ''}`}>
            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="form-scroll lg:col-span-2 space-y-6 max-h-[70vh]" noValidate>
              <FormField label={t('selectCar')} error={errors.carId} required>
                <select
                  name="carId"
                  value={form.carId}
                  onChange={handleChange}
                  className={inputErrorClass(
                    !!errors.carId,
                    'flex h-10 w-full rounded-xl bg-luxury-gray border border-luxury-border px-4 py-2 text-sm text-cream focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors',
                  )}
                >
                  <option value="">{loading ? '...' : t('selectCar')}</option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name} — {car.brand}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4${isRTL ? ' sm:flex sm:flex-row-reverse' : ''}`}>
                <FormField label={t('pickupDate')} error={errors.startDate} required>
                  <Input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    min={getTodayISO()}
                    onChange={handleChange}
                    className={inputErrorClass(!!errors.startDate)}
                  />
                </FormField>
                <FormField label={t('returnDate')} error={errors.endDate} required>
                  <Input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    min={form.startDate || getTomorrowISO()}
                    onChange={handleChange}
                    className={inputErrorClass(!!errors.endDate)}
                  />
                </FormField>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4${isRTL ? ' sm:flex sm:flex-row-reverse' : ''}`}>
                <FormField label={t('fullName')} error={errors.customerName} required>
                  <Input
                    type="text"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder={locale === 'ar' ? 'الاسم الكامل' : 'John Doe'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className={inputErrorClass(!!errors.customerName)}
                  />
                </FormField>
                <FormField label={t('phone')} error={errors.phone} required>
                  <Input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+20 1xx xxx xxxx"
                    className={inputErrorClass(!!errors.phone)}
                  />
                </FormField>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className={`block text-xs tracking-widest uppercase text-cream/60${isRTL ? ' text-right' : ''}`}>
                  {t('notes')}
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder={t('notesPlaceholder')}
                  rows={3}
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
                  : t('submit')}
              </Button>
            </form>

            {/* ── Summary Card ── */}
            <div className="lg:col-span-1">
              <div className="card-glass p-6 sticky top-24 space-y-4">
                <h3 className={`text-xs tracking-[0.3em] uppercase text-gold font-semibold${isRTL ? ' text-right' : ''}`}>
                  {t('summaryTitle')}
                </h3>
                <div className="divider-gold" />

                {!selectedCar ? (
                  <div className={`text-center py-6 text-cream/30 text-xs${isRTL ? ' text-right' : ''}`}>
                    <CarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="tracking-wide">{t('selectCarFirst')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`space-y-1${isRTL ? ' text-right' : ''}`}>
                      <p className="font-playfair font-semibold text-cream">{selectedCar.name}</p>
                      <p className="text-xs text-cream/40">{selectedCar.brand}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      {[
                        {
                          label: t('pickupDate'),
                          value: form.startDate || '—',
                        },
                        {
                          label: t('returnDate'),
                          value: form.endDate || '—',
                        },
                        {
                          label: t('totalDays'),
                          value: `${totalDays} ${locale === 'ar' ? 'يوم' : totalDays === 1 ? 'day' : 'days'}`,
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className={`flex justify-between${isRTL ? ' flex-row-reverse' : ''}`}
                        >
                          <span className="text-cream/40">{row.label}</span>
                          <span className="text-cream">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-luxury-border/30 pt-3">
                      <p className={`text-xs text-cream/45 leading-relaxed${isRTL ? ' text-right' : ''}`}>
                        {locale === 'ar'
                          ? 'سيتواصل فريقنا معك لتأكيد التفاصيل والأسعار.'
                          : 'Our team will contact you to confirm details and pricing.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
