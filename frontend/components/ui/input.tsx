import * as React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const inputBase =
  'flex h-10 w-full bg-luxury-gray border border-luxury-border rounded-none px-4 py-2 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`${inputBase}${className ? ` ${className}` : ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
