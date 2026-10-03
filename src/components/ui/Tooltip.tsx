import React, { useId, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'center' | 'end';
}

/** Lightweight tooltip shown on hover and keyboard focus. */
export function Tooltip({ content, children, side = 'top', align = 'center' }: TooltipProps) {
  const id = useId();
  const pos = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const alignCls = align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0';
  return (
    <span className="group/tt relative inline-flex" aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute ${pos} ${alignCls} z-40 w-max max-w-[240px] rounded-md bg-ink px-2.5 py-1.5 text-xs font-normal leading-snug text-cream-50 opacity-0 shadow-lift transition-opacity duration-150 ease-out group-hover/tt:opacity-100 group-focus-within/tt:opacity-100`}>
        
        {content}
      </span>
    </span>);

}