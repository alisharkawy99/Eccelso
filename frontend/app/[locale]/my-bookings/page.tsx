'use client';

import { useEffect, useState } from 'react';
import { useRouter, Link } from '@/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/app/hooks/useAuth';
import { getMyBookings } from '@/lib/api';
import { Booking } from '@/types';
import BookingCard from '@/components/BookingCard';
import { Button } from '@/components/ui/button';
import { Calendar, Car } from 'lucide-react';

function EmptyBookings({ locale }: { locale: string }) {
  return (
    <div className="card-glass rounded-2xl border border-luxury-border/30 py-16 px-6 text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-luxury-gray/60 border border-luxury-border/40">
        <Calendar className="h-7 w-7 text-cream/25" />
      </div>
      <div className="space-y-2">
        <h2 className="font-playfair text-xl font-semibold text-cream">
          {locale === 'ar' ? 'لا توجد حجوزات' : 'No Bookings Found'}
        </h2>
        <p className="text-sm text-cream/40 max-w-md mx-auto leading-relaxed">
          {locale === 'ar'
            ? 'لم تقم بحجز أي سيارة بعد. تصفح الأسطول واختر السيارة المناسبة لك.'
            : "You haven't booked any vehicles yet. Browse our fleet and reserve the car that's right for you."}
        </p>
      </div>
      <Link href="/fleet">
        <Button variant="gold" className="gap-2 mt-2">
          <Car className="h-4 w-4" />
          {locale === 'ar' ? 'تصفح الأسطول' : 'Browse Fleet'}
        </Button>
      </Link>
    </div>
  );
}

export default function MyBookingsPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    getMyBookings().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, [authReady, isAuthenticated, router]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-luxury-black pt-28">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="h-64 bg-luxury-gray animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <section className="pt-28 pb-10 bg-luxury-dark border-b border-luxury-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-gold">
            {locale === 'ar' ? 'حجوزاتي' : 'My Bookings'}
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-cream">
            {locale === 'ar' ? 'سياراتي المحجوزة' : 'Your Booked Vehicles'}
          </h1>
          <div className="divider-gold" />
          <p className="text-cream/50 text-sm max-w-lg mx-auto">
            {locale === 'ar'
              ? 'عرض السيارات التي قمت بحجزها للشراء'
              : 'View the vehicles you have reserved for purchase'}
          </p>
        </div>
      </section>

      <section className="section-padding bg-luxury-black min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-80 bg-luxury-gray animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <EmptyBookings locale={locale} />
          ) : (
            <>
              <p className={`text-xs text-cream/30 tracking-wider mb-6${isRTL ? ' text-right' : ''}`}>
                {bookings.length}{' '}
                {locale === 'ar' ? 'حجز' : bookings.length === 1 ? 'booking' : 'bookings'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
