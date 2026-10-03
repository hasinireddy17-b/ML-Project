import React, { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export const inputStyles =
'w-full rounded-md border border-line-strong bg-surface px-3 text-[15px] text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 ease-out focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-200 disabled:opacity-60';

interface BaseProps {
  label: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
  hideLabel?: boolean;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & {multiline?: false;};
type AreaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & {multiline: true;};

export function TextField(props: InputProps | AreaProps) {
  const autoId = useId();
  const { label, hint, error, trailing, hideLabel, className, id, multiline, ...rest } = props;
  const fieldId = id ?? autoId;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  const stateCls = error ? 'border-rust-500 focus:border-rust-500 focus:ring-rust-50' : '';

  return (
    <div className={className}>
      <div className={hideLabel ? 'sr-only' : 'mb-1.5 flex items-center justify-between'}>
        <label htmlFor={fieldId} className="text-sm font-medium text-ink">
          {label}
        </label>
        {trailing}
      </div>
      {multiline ?
      <textarea
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={twMerge(inputStyles, 'min-h-[110px] py-2.5 leading-relaxed', stateCls)}
        {...rest as TextareaHTMLAttributes<HTMLTextAreaElement>} /> :


      <input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={twMerge(inputStyles, 'h-10', stateCls)}
        {...rest as InputHTMLAttributes<HTMLInputElement>} />

      }
      {error ?
      <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-rust-600">
          {error}
        </p> :
      hint ?
      <p id={`${fieldId}-hint`} className="mt-1.5 text-sm text-ink-muted">
          {hint}
        </p> :
      null}
    </div>);

}