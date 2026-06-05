'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useRouter } from '@/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import {
  adminApproveBooking,
  adminGetBookingStats,
  adminGetBookings,
  adminMarkBookingSold,
  adminRejectBooking,
  getApiErrorMessage,
} from '@/lib/api';
import { AdminBookingStats, BookingWithUser } from '@/types';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  XCircle,
  Ban,
  Tag,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { isAdmin, isAuthenticated, authReady } = useAuth();

  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [stats, setStats] = useState<AdminBookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const [bookingsData, statsData] = await Promise.all([
      adminGetBookings(),
      adminGetBookingStats(),
    ]);
    setBookings(bookingsData);
    setStats(statsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    if (!isAdmin) {
      router.replace('/my-bookings');
      return;
    }
    loadData();
  }, [authReady, isAuthenticated, isAdmin, router, loadData]);

  const runAction = async (
    bookingId: string,
    action: 'approve' | 'reject' | 'sold',
  ) => {
    setActionId(bookingId);
    setError('');
    try {
      if (action === 'approve') await adminApproveBooking(bookingId);
      if (action === 'reject') await adminRejectBooking(bookingId);
      if (action === 'sold') await adminMarkBookingSold(bookingId);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  if (!authReady || !isAuthenticated || !isAdmin) return null;

  const statCards = stats
    ? [
        {
          label: locale === 'ar' ? 'إجمالي الحجوزات' : 'Total',
          value: stats.total_bookings,
          icon: Calendar,
        },
        {
          label: locale === 'ar' ? 'قيد المراجعة' : 'Pending',
          value: stats.pending_bookings,
          icon: Clock,
        },
        {
          label: locale === 'ar' ? 'موافق عليها' : 'Approved',
          value: stats.approved_bookings,
          icon: CheckCircle,
        },
        {
          label: locale === 'ar' ? 'مرفوضة' : 'Rejected',
          value: stats.rejected_bookings,
          icon: Ban,
        },
        {
          label: locale === 'ar' ? 'ملغاة' : 'Cancelled',
          value: stats.cancelled_bookings,
          icon: XCircle,
        },
      ]
    : [];

  return (
    <>
      <section className="pt-28 pb-10 bg-luxury-dark border-b border-luxury-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center gap-2 text-gold mb-2${isRTL ? ' flex-row-reverse' : ''}`}>
            <Crown className="h-4 w-4" />
            <p className="text-xs tracking-[0.3em] uppercase">
              {locale === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
            </p>
          </div>
          <h1 className="font-playfair text-4xl font-bold text-cream">
            {locale === 'ar' ? 'إدارة الحجوزات' : 'Bookings Management'}
          </h1>
          <div className="divider-gold mt-4 !mx-0" />
          <p className="text-cream/50 text-sm mt-4 max-w-2xl">
            {locale === 'ar'
              ? 'مراجعة طلبات الحجز والموافقة عليها أو رفضها، وتحديد السيارات المباعة'
              : 'Review booking requests, approve or reject them, and mark vehicles as sold'}
          </p>
        </div>
      </section>

      <section className="section-padding bg-luxury-black min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {error && (
            <p className="text-sm text-red-400 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              {error}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-luxury-gray animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="card-glass rounded-xl p-5 space-y-2">
                    <div className={`flex items-center gap-2 text-cream/40${isRTL ? ' flex-row-reverse' : ''}`}>
                      <Icon className="h-4 w-4 text-gold/70" />
                      <span className="text-[10px] uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="font-playfair text-3xl font-bold text-cream">{value}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-luxury-border/30">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b border-luxury-border/30 bg-luxury-dark/50">
                      {[
                        locale === 'ar' ? 'العميل' : 'Customer',
                        locale === 'ar' ? 'السيارة' : 'Vehicle',
                        locale === 'ar' ? 'الحالة' : 'Condition',
                        locale === 'ar' ? 'حالة الحجز' : 'Status',
                        locale === 'ar' ? 'التاريخ' : 'Date',
                        locale === 'ar' ? 'إجراءات' : 'Actions',
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-wider text-cream/40 font-semibold${isRTL ? ' text-right' : ' text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-cream/30">
                          {locale === 'ar' ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => {
                        const isPending = booking.status === 'pending';
                        const isApproved = booking.status === 'approved';
                        const isSold = booking.car?.sold;
                        const busy = actionId === booking.id;

                        return (
                          <tr
                            key={booking.id}
                            className="border-b border-luxury-border/15 hover:bg-luxury-gray/10 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <div className={`flex items-center gap-3${isRTL ? ' flex-row-reverse' : ''}`}>
                                {booking.user.avatar_url ? (
                                  <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                                    <Image
                                      src={booking.user.avatar_url}
                                      alt={booking.user.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </span>
                                ) : (
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">
                                    {booking.user.name[0]}
                                  </span>
                                )}
                                <div className={isRTL ? 'text-right' : ''}>
                                  <p className="font-medium text-cream">{booking.user.name}</p>
                                  <p className="text-xs text-cream/35">{booking.user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className={`flex items-center gap-3${isRTL ? ' flex-row-reverse' : ''}`}>
                                {booking.car_image_url && (
                                  <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-luxury-gray">
                                    <Image
                                      src={booking.car_image_url}
                                      alt={booking.car_name}
                                      fill
                                      className="object-cover"
                                    />
                                  </span>
                                )}
                                <div className={isRTL ? 'text-right' : ''}>
                                  <p className="text-cream font-medium">{booking.car_name}</p>
                                  <p className="text-xs text-cream/35">{booking.car_brand}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge variant="condition" size="sm">
                                <Tag className="h-3 w-3" />
                                {booking.car_condition === 'new'
                                  ? locale === 'ar' ? 'جديدة' : 'New'
                                  : locale === 'ar' ? 'مستعملة' : 'Used'}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <BookingStatusBadge booking={booking} size="sm" />
                            </td>
                            <td className="px-4 py-4 text-cream/50 text-xs whitespace-nowrap">
                              {new Date(booking.created_at).toLocaleDateString(
                                locale === 'ar' ? 'ar-EG' : 'en-GB',
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className={`flex flex-wrap gap-2${isRTL ? ' flex-row-reverse' : ''}`}>
                                {isPending && (
                                  <>
                                    <Button
                                      variant="gold"
                                      size="sm"
                                      disabled={busy}
                                      className="text-[10px] uppercase tracking-wider h-8 px-3"
                                      onClick={() => runAction(booking.id, 'approve')}
                                    >
                                      {busy ? '...' : locale === 'ar' ? 'موافقة' : 'Approve'}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={busy}
                                      className="text-[10px] uppercase tracking-wider h-8 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                      onClick={() => runAction(booking.id, 'reject')}
                                    >
                                      {locale === 'ar' ? 'رفض' : 'Reject'}
                                    </Button>
                                  </>
                                )}
                                {isApproved && !isSold && booking.car_id && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={busy}
                                    className="text-[10px] uppercase tracking-wider h-8 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          locale === 'ar'
                                            ? 'تأكيد وضع علامة مباعة على هذه السيارة؟'
                                            : 'Mark this vehicle as sold?',
                                        )
                                      ) {
                                        runAction(booking.id, 'sold');
                                      }
                                    }}
                                  >
                                    {locale === 'ar' ? 'مباعة' : 'Mark Sold'}
                                  </Button>
                                )}
                                {!isPending && !isApproved && (
                                  <span className="text-xs text-cream/25">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
