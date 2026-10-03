import React, { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2Icon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-sage-700 text-cream-50 hover:bg-sage-800',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-cream-100',
  ghost: 'text-ink-soft hover:bg-cream-100 hover:text-ink',
  danger: 'bg-rust-500 text-white hover:bg-rust-600',
  subtle: 'bg-sage-50 text-sage-800 hover:bg-sage-100'
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]'
};

export function buttonStyles(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = ''): string {
  return twMerge(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    extra
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
{ variant = 'primary', size = 'md', loading = false, className = '', disabled, children, type = 'button', ...rest },
ref)
{
  return (
    <button ref={ref} type={type} className={buttonStyles(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>);

});