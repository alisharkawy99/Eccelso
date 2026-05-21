import * as React from 'react';

const badgeBase =
  'inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase transition-colors';

const badgeVariantClasses = {
  gold: 'border-gold/40 bg-gold/10 text-gold',
  available: 'border-emerald-700/40 bg-emerald-900/20 text-emerald-400',
  unavailable: 'border-red-800/40 bg-red-900/20 text-red-400',
  dark: 'border-luxury-border bg-luxury-gray text-cream/60',
} as const;

type BadgeVariant = keyof typeof badgeVariantClasses;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = 'gold', ...props }: BadgeProps) {
  return (
    <div
      className={`${badgeBase} ${badgeVariantClasses[variant]}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}

export { Badge };
