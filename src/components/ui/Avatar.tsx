import React from 'react';
import { initials } from '../../utils/format';

interface AvatarProps {
  name: string;
  photo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-24 w-24 text-2xl' };

export function Avatar({ name, photo, size = 'md' }: AvatarProps) {
  if (photo) return <img src={photo} alt={name} className={`${SIZES[size]} shrink-0 rounded-full object-cover`} />;
  return (
    <span aria-hidden="true" className={`${SIZES[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-taupe-200 font-semibold text-taupe-700`}>
      {initials(name)}
    </span>);

}