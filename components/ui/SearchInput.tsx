'use client';

import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('relative flex items-center', className)}>
      {/* Search icon */}
      <Search
        size={14}
        className="absolute left-4 text-[var(--on-surface-muted)] pointer-events-none"
      />

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full outline-none transition-all',
          'bg-[var(--input-bg)] border border-[var(--input-border)]/40',
          'rounded-[var(--input-radius)]',
          'pl-10 pr-9 py-[var(--input-py)]',
          'text-on-surface text-[length:var(--input-font-size)] font-medium',
          'placeholder:text-on-surface-muted',
          'focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent',
        )}
      />

      {/* Clear button — only shown when there is text */}
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="absolute right-3 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:bg-[var(--outline-variant)] transition-colors"
          aria-label="Clear search"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}
