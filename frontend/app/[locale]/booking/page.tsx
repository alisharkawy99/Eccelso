'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/navigation';
import { Car } from '@/types';
import { createBooking, getApiErrorMessage, getCars } from '@/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/FormField';
import { FieldErrors, hasErrors, inputErrorClass, validateRequired } from '@/lib/validation';
import { CheckCircle, Car as CarIcon, Lock } from 'lucide-react';
import UserAuthForm from '@/components/UserForm';
import Modal from '@/components/Modal';

export default function BookingPage() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const [form, setForm] = useState({
    carId: searchParams.get('car') || '',
    notes: '',
  });

  useEffect(() => {
    getCars().then((data) => {
      setCars(data.filter((c) => !c.sold));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
    }
  }, [isAuthenticated]);

  const selectedCar = cars.find((c) => c.id === form.carId) || null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (apiError) setApiError('');
  };

  const validateBooking = (): FieldErrors => {
    const next: FieldErrors = {};
    const carError = validateRequired(form.carId, 'Car selection');
    if (carError) next.carId = carError;
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    const validationErrors = validateBooking();
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    setApiError('');
    try {
      await createBooking({ car_id: form.carId, notes: form.notes || undefined });
      setSuccess(true);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center px-4 pt-16">
        <div className="text-center space-y-5 max-w-md animate-slide-up">
          <CheckCircle className="w-16 h-16 text-gold mx-auto" />
          <h2 className="font-playfair text-3xl font-bold text-cream">{t('successTitle')}</h2>
          <div className="divider-gold" />
          <p className="text-cream/50 text-sm leading-relaxed">{t('successDesc')}</p>
          <p className="text-xs text-gold/70">
            {locale === 'ar'
              ? 'حالة الحجز: قيد المراجعة — سنتواصل معك بعد الموافقة'
              : 'Status: Pending review — we will contact you once approved'}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="gold" onClick={() => router.push('/my-bookings')}>
              {locale === 'ar' ? 'حجوزاتي' : 'My Bookings'}
            </Button>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({ carId: '', notes: '' });
              }}
              className="btn-gold-outline px-6 py-3 text-xs tracking-widest uppercase"
            >
              {locale === 'ar' ? 'حجز آخر' : 'Book Another'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal
        variant="auth"
        isOpen={showLogin && !isAuthenticated}
        onClose={() => {
          setShowLogin(false);
          router.push('/fleet');
        }}
        content={
          <UserAuthForm
            onClose={() => {
              setShowLogin(false);
            }}
          />
        }
      />

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
          {!isAuthenticated && (
            <div className="mb-8 flex items-center gap-3 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-cream/70">
              <Lock className="h-5 w-5 text-gold shrink-0" />
              <p>
                {locale === 'ar'
                  ? 'يجب تسجيل الدخول لحجز سيارة للشراء.'
                  : 'You must be signed in to book a vehicle for purchase.'}
              </p>
              <Button
                variant="gold"
                size="sm"
                className="ms-auto shrink-0"
                onClick={() => setShowLogin(true)}
              >
                {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </Button>
            </div>
          )}

          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8${isRTL ? ' lg:flex lg:flex-row-reverse' : ''}`}>
            <form onSubmit={handleSubmit} className="form-scroll lg:col-span-2 space-y-6 max-h-[70vh]" noValidate>
              <FormField label={t('selectCar')} error={errors.carId} required>
                <select
                  name="carId"
                  value={form.carId}
                  onChange={handleChange}
                  disabled={!isAuthenticated}
                  className={inputErrorClass(
                    !!errors.carId,
                    'flex h-10 w-full rounded-xl bg-luxury-gray border border-luxury-border px-4 py-2 text-sm text-cream focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors disabled:opacity-50',
                  )}
                >
                  <option value="">{loading ? '...' : t('selectCar')}</option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name} — {car.brand} ({car.condition === 'new' ? (locale === 'ar' ? 'جديدة' : 'New') : (locale === 'ar' ? 'مستعملة' : 'Used')})
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="space-y-2">
                <label className={`block text-xs tracking-widest uppercase text-cream/60${isRTL ? ' text-right' : ''}`}>
                  {t('notes')}
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  disabled={!isAuthenticated}
                  placeholder={t('notesPlaceholder')}
                  rows={4}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className="flex w-full bg-luxury-gray border border-luxury-border rounded-none px-4 py-2 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors resize-none disabled:opacity-50"
                />
              </div>

              {apiError && <p className="text-sm text-red-400">{apiError}</p>}

              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={submitting || !isAuthenticated}
                className="w-full"
              >
                {submitting
                  ? (locale === 'ar' ? 'جاري الحجز...' : 'Booking...')
                  : t('submit')}
              </Button>
            </form>

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
                      <p className="text-xs text-gold/80 uppercase tracking-wider">
                        {selectedCar.condition === 'new'
                          ? locale === 'ar' ? 'جديدة' : 'New'
                          : locale === 'ar' ? 'مستعملة' : 'Used'}
                      </p>
                    </div>
                    <div className="border-t border-luxury-border/30 pt-3">
                      <p className={`text-xs text-cream/45 leading-relaxed${isRTL ? ' text-right' : ''}`}>
                        {locale === 'ar'
                          ? 'سيتواصل فريقنا معك لتأكيد تفاصيل الشراء.'
                          : 'Our team will contact you to confirm your purchase details.'}
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
