import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, SearchIcon, XIcon } from 'lucide-react';
import { useActivity } from '../../contexts/ActivityContext';
import { getSuggestions } from '../../utils/ml/search';

const EXAMPLES = ['Python developer in Hyderabad', 'Frontend jobs with React', 'Entry level data analyst', 'Machine learning jobs', 'Remote Java jobs'];

type ItemKind = 'Recent' | 'Try' | 'Role' | 'Skill' | 'Company' | 'Location';
interface Item {
  label: string;
  kind: ItemKind;
}

interface SearchBoxProps {
  initialValue?: string;
  size?: 'lg' | 'md' | 'compact';
  shortcut?: boolean;
  autoFocus?: boolean;
}

const HEIGHTS = { lg: 'h-14 pl-12 pr-28 text-base', md: 'h-11 pl-10 pr-10 text-[15px]', compact: 'h-9 pl-9 pr-8 text-sm' };

export function SearchBox({ initialValue = '', size = 'md', shortcut = false, autoFocus = false }: SearchBoxProps) {
  const navigate = useNavigate();
  const { searchHistory } = useActivity();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLFormElement>(null);
  const listId = useId();
  const inputId = useId();

  useEffect(() => setValue(initialValue), [initialValue]);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const items = useMemo<Item[]>(() => {
    if (value.trim()) return getSuggestions(value).map((s) => ({ label: s.label, kind: s.type }));
    const recent = searchHistory.slice(0, 4).map((h): Item => ({ label: h.query, kind: 'Recent' }));
    const tries = EXAMPLES.filter((e) => !recent.some((r) => r.label.toLowerCase() === e.toLowerCase())).
    slice(0, size === 'compact' ? 3 : 4).
    map((label): Item => ({ label, kind: 'Try' }));
    return [...recent, ...tries];
  }, [value, searchHistory, size]);

  useEffect(() => setActive(-1), [value]);

  const submit = (q: string) => {
    const t = q.trim();
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
    navigate(t ? `/search?q=${encodeURIComponent(t)}` : '/search');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => items.length ? (a + 1) % items.length : -1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => items.length ? a <= 0 ? items.length - 1 : a - 1 : -1);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  const showList = open && items.length > 0;
  const iconPos = size === 'lg' ? 'left-4 h-5 w-5' : size === 'md' ? 'left-3.5 h-4 w-4' : 'left-3 h-4 w-4';

  return (
    <form
      ref={wrapRef}
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        submit(active >= 0 && items[active] ? items[active].label : value);
      }}>
      
      <label htmlFor={inputId} className="sr-only">
        Search jobs, skills, companies, or roles
      </label>
      <SearchIcon className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-muted ${iconPos}`} aria-hidden="true" />
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        autoComplete="off"
        autoFocus={autoFocus}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={size === 'compact' ? 'Search jobs, skills, companies' : 'Search jobs, skills, companies, or roles'}
        className={`w-full rounded-lg border border-line-strong bg-surface text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 ease-out focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-200 ${HEIGHTS[size]}`} />
      
      {shortcut && !value &&
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line bg-cream-100 px-1.5 text-[11px] text-ink-muted">/</kbd>
      }
      {value && size !== 'lg' &&
      <button type="button" onClick={() => setValue('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-ink" aria-label="Clear search">
          <XIcon className="h-4 w-4" />
        </button>
      }
      {size === 'lg' &&
      <button type="submit" className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-md bg-sage-700 px-5 text-sm font-medium text-cream-50 transition-colors duration-150 hover:bg-sage-800">
          Search
        </button>
      }

      {showList &&
      <ul
        id={listId}
        role="listbox"
        className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-lg border border-line bg-surface py-1.5 shadow-lift">
        
          {items.map((item, i) => {
          const header =
          !value.trim() && (i === 0 || items[i - 1].kind !== item.kind) ? item.kind === 'Recent' ? 'Recent searches' : 'Try searching' : null;
          return (
            <React.Fragment key={`${item.kind}-${item.label}`}>
                {header && <li className="px-4 pb-1 pt-2 text-xs font-medium text-ink-muted" role="presentation">{header}</li>}
                <li
                id={`${listId}-${i}`}
                role="option"
                aria-selected={active === i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  submit(item.label);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-sm ${active === i ? 'bg-cream-100 text-ink' : 'text-ink-soft'}`}>
                
                  {item.kind === 'Recent' ?
                <ClockIcon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" /> :

                <SearchIcon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                }
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {value.trim() && <span className="text-xs text-ink-muted">{item.kind}</span>}
                </li>
              </React.Fragment>);

        })}
        </ul>
      }
    </form>);

}