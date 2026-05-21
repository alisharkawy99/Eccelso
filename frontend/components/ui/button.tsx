'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

const buttonBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-semibold tracking-widest uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-40';

const buttonVariantClasses = {
  gold: 'btn-gold px-6 py-3',
  outline: 'btn-gold-outline px-6 py-3',
  ghost: 'text-gold hover:text-gold-light hover:bg-luxury-gray px-4 py-2',
  link: 'text-gold underline-offset-4 hover:underline p-0',
  destructive:
    'bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 px-4 py-2',
} as const;

const buttonSizeClasses = {
  default: 'h-10 px-6 py-2',
  sm: 'h-8 px-4 text-xs',
  lg: 'h-12 px-8 text-base',
  icon: 'h-9 w-9 p-0',
} as const;

type ButtonVariant = keyof typeof buttonVariantClasses;
type ButtonSize = keyof typeof buttonSizeClasses;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const classes = `${buttonBase} ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]}${className ? ` ${className}` : ''}`;
    return <Comp className={classes} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button };
