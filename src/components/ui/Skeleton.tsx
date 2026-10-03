import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ className }: {className?: string;}) {
  return <div aria-hidden="true" className={twMerge('animate-pulse rounded bg-cream-200', className)} />;
}