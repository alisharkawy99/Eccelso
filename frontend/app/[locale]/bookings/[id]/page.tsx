'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { cancelBooking, getApiErrorMessage, getBookingById } from '@/lib/api';
import { Booking } from '@/types';
import { Badge } from '@/components/ui/badge';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  Tag,
  XCircle,
} from 'lucide-react';

export default function BookingDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const bookingId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    getBookingById(bookingId).then((data) => {
      setBooking(data);
      setLoading(false);
      if (!data) setError(locale === 'ar' ? 'الحجز غير موجود' : 'Booking not found');
    });
  }, [bookingId, isAuthenticated, locale, router]);

  const handleCancel = async () => {
    if (!booking) return;
    const confirmed = window.confirm(
      locale === 'ar'
        ? 'هل أنت متأكد من إلغاء هذا الحجز؟'
        : 'Are you sure you want to cancel this booking?',
    );
    if (!confirmed) return;

    setCancelling(true);
    setError('');
    try {
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black pt-28 flex items-center justify-center">
        <div className="h-64 w-full max-w-2xl bg-luxury-gray animate-pulse rounded-2xl mx-4" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-luxury-black pt-28 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-cream/50">{error || (locale === 'ar' ? 'الحجز غير موجود' : 'Booking not found')}</p>
        <Link href="/my-bookings">
          <Button variant="outline">
            {locale === 'ar' ? 'العودة للحجوزات' : 'Back to My Bookings'}
          </Button>
        </Link>
      </div>
    );
  }

  const car = booking.car;
  const isSold = car?.sold ?? false;
  const isCancelled = booking.status === 'cancelled';
  const isRejected = booking.status === 'rejected';
  const canCancel =
    booking.status === 'pending' || booking.status === 'approved';
  const imageUrl = car?.images?.[0]?.url || booking.car_image_url || '';
  const conditionLabel =
    booking.car_condition === 'new'
      ? locale === 'ar' ? 'جديدة' : 'New'
      : locale === 'ar' ? 'مستعملة' : 'Used';

  const bookedDate = new Date(booking.created_at).toLocaleDateString(
    locale === 'ar' ? 'ar-EG' : 'en-GB',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  );

  return (
    <>
      <section className="pt-24 pb-6 bg-luxury-dark border-b border-luxury-border/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/my-bookings"
            className={`inline-flex items-center gap-2 text-xs tracking-widest uppercase text-cream/50 hover:text-gold transition-colors mb-6${isRTL ? ' flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`h-4 w-4${isRTL ? ' rotate-180' : ''}`} />
            {locale === 'ar' ? 'حجوزاتي' : 'My Bookings'}
          </Link>
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-cream">
            {booking.car_name}
          </h1>
          <p className="text-cream/40 text-sm mt-1">{booking.car_brand}</p>
        </div>
      </section>

      <section className="section-padding bg-luxury-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {imageUrl && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-luxury-gray">
                <Image
                  src={imageUrl}
                  alt={booking.car_name}
                  fill
                  className={`object-cover ${isSold || isCancelled ? 'grayscale-[0.35]' : ''}`}
                />
              </div>
            )}

            <div className={`space-y-6${isRTL ? ' text-right' : ''}`}>
              <div className={`flex flex-wrap gap-2${isRTL ? ' flex-row-reverse' : ''}`}>
                <Badge variant="condition">
                  <Tag className="h-3 w-3" />
                  {conditionLabel}
                </Badge>
                <BookingStatusBadge booking={booking} />
              </div>

              <div className="space-y-3 text-sm">
                <div className={`flex items-center gap-2 text-cream/50${isRTL ? ' flex-row-reverse' : ''}`}>
                  <Calendar className="h-4 w-4 text-gold/60" />
                  <span>
                    {locale === 'ar' ? 'تاريخ الحجز' : 'Booking date'}: {bookedDate}
                  </span>
                </div>
                {booking.cancelled_at && (
                  <div className="text-cream/50">
                    {locale === 'ar' ? 'تاريخ الإلغاء' : 'Cancelled on'}:{' '}
                    {new Date(booking.cancelled_at).toLocaleDateString(
                      locale === 'ar' ? 'ar-EG' : 'en-GB',
                    )}
                  </div>
                )}
              </div>

              {booking.notes && (
                <div className="rounded-xl border border-luxury-border/30 bg-luxury-gray/20 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-gold mb-2">
                    {locale === 'ar' ? 'ملاحظات' : 'Notes'}
                  </p>
                  <p className="text-sm text-cream/60 leading-relaxed">{booking.notes}</p>
                </div>
              )}

              {isSold && !isCancelled && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm text-red-400/90 leading-relaxed">
                    {locale === 'ar'
                      ? 'تم بيع هذه السيارة. لم تعد متاحة للشراء. سيتم إزالة القائمة خلال 48 ساعة من تاريخ البيع.'
                      : 'This vehicle has been sold and is no longer available for purchase. The listing will be removed within 48 hours of the sale.'}
                  </p>
                </div>
              )}

              <div className={`flex flex-col sm:flex-row gap-3 pt-2${isRTL ? ' sm:flex-row-reverse' : ''}`}>
                {!isCancelled && !isRejected && !isSold && canCancel && (
                  <Button
                    variant="outline"
                    className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    <XCircle className="h-4 w-4" />
                    {cancelling
                      ? locale === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...'
                      : locale === 'ar' ? 'إلغاء الحجز' : 'Cancel Booking'}
                  </Button>
                )}
                {car && (
                  <Link href={`/fleet/${car.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      {locale === 'ar' ? 'عرض السيارة' : 'View Car Listing'}
                    </Button>
                  </Link>
                )}
                <a
                  href="https://wa.me/201000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="gold" className="w-full gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
