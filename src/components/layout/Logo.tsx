import React from 'react';
import { Link } from 'react-router-dom';

export function Logo({ to = '/', inverted = false }: {to?: string;inverted?: boolean;}) {
  return (
    <Link to={to} className="flex items-center gap-2.5 whitespace-nowrap" aria-label="Intelligent Job Portal home">
      <span className={`flex h-8 w-8 items-center justify-center rounded-md ${inverted ? 'bg-cream-50 text-sage-800' : 'bg-sage-700 text-cream-50'}`}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
          <path d="M8.5 11.5l1.8 1.8 3.4-3.6" />
        </svg>
      </span>
      <span className={`font-display text-[19px] font-medium tracking-tight ${inverted ? 'text-cream-50' : 'text-ink'}`}>Intelligent Job Portal</span>
    </Link>);

}