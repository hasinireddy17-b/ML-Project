import React from 'react';
import type { Company } from '../../types/job';

const SIZES = { sm: 'h-9 w-9 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-16 w-16 text-lg' };

export function CompanyLogo({ company, size = 'md' }: {company: Company;size?: 'sm' | 'md' | 'lg';}) {
  const letters = company.name.
  split(/\s+/).
  slice(0, 2).
  map((w) => w[0]).
  join('').
  toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`${SIZES[size]} inline-flex shrink-0 items-center justify-center rounded-md font-semibold tracking-wide text-cream-50`}
      style={{ backgroundColor: company.color }}>
      
      {letters}
    </span>);

}