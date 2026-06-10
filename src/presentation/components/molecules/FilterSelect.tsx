'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { cn } from '@/presentation/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: Option[];
  placeholder: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: FilterSelectProps) {
  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => onChange(v === '__all' ? undefined : v || undefined)}
    >
      <SelectTrigger
        className={cn(
          'h-10 rounded-xl border-stone-200 bg-white text-sm text-stone-700 focus:ring-stone-900/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:ring-stone-400/20',
          !value && 'text-stone-400 dark:text-stone-500',
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-stone-200">
        <SelectItem value="__all" className="text-stone-500">
          {placeholder}
        </SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
