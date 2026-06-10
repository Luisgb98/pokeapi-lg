'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/presentation/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder: string;
  className?: string;
  /** Rendered as a sticky header inside the dropdown when values.length >= 1. */
  headerSlot?: ReactNode;
}

export function MultiSelect({
  values,
  onChange,
  options,
  placeholder,
  className,
  headerSlot,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  function getTriggerLabel() {
    if (values.length === 0) return null;
    if (values.length <= 2) {
      return values.map((v) => options.find((o) => o.value === v)?.label ?? v).join(', ');
    }
    return `${values.length} selected`;
  }

  const label = getTriggerLabel();
  const hasValues = values.length > 0;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/20 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-stone-400/20',
          hasValues ? 'text-stone-700 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500',
        )}
      >
        <span className="truncate">{label ?? placeholder}</span>
        <span className="flex shrink-0 items-center gap-1">
          {hasValues && (
            <span
              role="button"
              aria-label="Clear selection"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="rounded p-0.5 text-stone-400 hover:text-stone-600"
            >
              <X className="size-3" />
            </span>
          )}
          <ChevronDown
            className={cn('size-4 text-stone-400 transition-transform', open && 'rotate-180')}
          />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-full min-w-[10rem] rounded-xl border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-900">
          {headerSlot && (
            <div className="sticky top-0 rounded-t-xl border-b border-stone-100 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900">
              {headerSlot}
            </div>
          )}
          <ul role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => {
              const selected = values.includes(opt.value);
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggle(opt.value)}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border',
                      selected
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-200 dark:bg-stone-200 dark:text-stone-900'
                        : 'border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-800',
                    )}
                  >
                    {selected && <Check className="size-3" />}
                  </span>
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
