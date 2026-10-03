import React, { type ReactNode } from 'react';
import { CheckIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

/** Toggleable selection chip (skills, preferences, filters). */
export function Chip({ selected = false, onClick, children, size = 'md', className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={twMerge(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-[background-color,border-color,color] duration-150 ease-out',
        size === 'sm' ? 'h-7 px-2.5 text-[13px]' : 'h-9 px-3.5 text-sm',
        selected ?
        'border-sage-600 bg-sage-700 text-cream-50 hover:bg-sage-800' :
        'border-line-strong bg-surface text-ink-soft hover:border-taupe-400 hover:text-ink',
        className
      )}>
      
      {selected && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </button>);

}