import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeBase =
  'inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em] whitespace-nowrap backdrop-blur-md transition-all duration-300';

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[9px] rounded-md',
  md: 'px-2.5 py-1 text-[10px] rounded-lg',
  lg: 'px-3 py-1.5 text-[11px] rounded-lg',
} as const;

const badgeVariantClasses = {
  gold:
    'border border-gold/35 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent text-gold shadow-[inset_0_1px_0_rgba(232,197,106,0.15),0_0_14px_rgba(201,168,76,0.1)]',
  featured:
    'border border-gold/60 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-luxury-black shadow-[0_0_18px_rgba(201,168,76,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]',
  available:
    'border border-emerald-500/35 bg-gradient-to-br from-emerald-950/50 to-emerald-900/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.12)]',
  unavailable:
    'border border-red-500/35 bg-gradient-to-br from-red-950/50 to-red-900/20 text-red-400 shadow-[0_0_12px_rgba(248,113,113,0.1)]',
  sold:
    'border border-red-400/45 bg-gradient-to-r from-red-600/90 via-red-500/85 to-red-600/90 text-white shadow-[0_0_16px_rgba(239,68,68,0.25)]',
  booked:
    'border border-gold/40 bg-gradient-to-br from-gold/15 to-gold/5 text-gold-light shadow-[0_0_12px_rgba(201,168,76,0.12)]',
  cancelled:
    'border border-cream/12 bg-luxury-gray/70 text-cream/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
  pending:
    'border border-amber-500/35 bg-gradient-to-br from-amber-950/40 to-amber-900/15 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.1)]',
  approved:
    'border border-emerald-500/35 bg-gradient-to-br from-emerald-950/50 to-emerald-900/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.12)]',
  rejected:
    'border border-red-500/35 bg-gradient-to-br from-red-950/50 to-red-900/20 text-red-400 shadow-[0_0_12px_rgba(248,113,113,0.1)]',
  condition:
    'border border-white/12 bg-black/55 text-cream/85 shadow-[0_2px_8px_rgba(0,0,0,0.35)]',
  category:
    'border border-white/10 bg-black/50 text-cream/90 shadow-[0_2px_10px_rgba(0,0,0,0.4)]',
  dark:
    'border border-luxury-border/60 bg-luxury-gray/60 text-cream/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
} as const;

const dotClasses = {
  gold: 'bg-gold shadow-[0_0_6px_rgba(201,168,76,0.8)]',
  featured: 'bg-luxury-black/80',
  available: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]',
  unavailable: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]',
  sold: 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]',
  booked: 'bg-gold-light shadow-[0_0_6px_rgba(232,197,106,0.9)]',
  cancelled: 'bg-cream/35',
  pending: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]',
  approved: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]',
  rejected: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]',
  condition: 'bg-cream/50',
  category: 'bg-gold/70',
  dark: 'bg-cream/30',
} as const;

export type BadgeVariant = keyof typeof badgeVariantClasses;
export type BadgeSize = keyof typeof sizeClasses;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

function Badge({
  className,
  variant = 'gold',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        badgeBase,
        sizeClasses[size],
        badgeVariantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            dotClasses[variant],
            variant === 'available' || variant === 'pending' ? 'animate-pulse' : '',
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
