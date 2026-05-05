'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Employee } from '@/types/employee';
import { searchEmployees } from '@/lib/api/employees';

interface PeoplePickerProps {
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
  placeholder?: string;
  hasError?: boolean;
}

function getInitials(name?: string): string {
  if (!name) return 'NA';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function PeoplePicker({
  value,
  onChange,
  placeholder = 'Search by name or email…',
  hasError = false,
}: PeoplePickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
const latestQueryRef = useRef("");

useEffect(() => {
  if (!query.trim()) {
    setResults([]);
    setIsOpen(false);
    setIsLoading(false);
    latestQueryRef.current = "";
    return;
  }

  setIsLoading(true);
  latestQueryRef.current = query;

  const timer = setTimeout(() => {
    const currentQuery = query;

    searchEmployees(currentQuery)
      .then((data) => {
        if (latestQueryRef.current !== currentQuery) return;

        const safeData = (data || []).filter(
          (emp) => emp && emp.name
        );

        setResults(safeData);
        setIsOpen(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Search failed:", err);
        setIsLoading(false);
      });
  }, 250);

  return () => clearTimeout(timer);
}, [query]);

  function handleSelect(employee: Employee) {
    onChange(employee);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  // ── Selected state ──────────────────────────────────────────────────────────
  if (value) {
    return (
      <div
        className={`flex items-center gap-3 bg-[var(--surface-container-low)] rounded-lg p-3 transition-all ${hasError ? 'ring-2 ring-red-500' : ''}`}
      >
        <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--on-primary)] text-xs font-bold shrink-0">
          {getInitials(value.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[var(--on-surface)] truncate">{value.name}</div>
          <div className="text-xs text-[var(--on-surface-variant)] truncate">
            {value.email} · {value.designation}
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] transition-colors"
          aria-label="Clear selection"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // ── Search state ────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center gap-2 bg-[var(--surface-container-low)] rounded-lg px-4 py-3 transition-all ${hasError ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-[var(--secondary)]'}`}
      >
        <Search size={14} className="text-[var(--on-surface-variant)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none text-[var(--on-surface)] text-sm font-medium focus:outline-none placeholder:text-[var(--on-surface-muted)]"
          aria-label="Search employee"
        />
        {isLoading && (
          <div className="w-4 h-4 border-2 border-[var(--secondary)] border-t-transparent rounded-full animate-spin shrink-0" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-xl shadow-[0_8px_32px_rgba(33,33,33,0.14)] bg-[rgba(255,255,255,0.92)] backdrop-blur-[20px] border border-[var(--outline-variant)] border-opacity-20 overflow-hidden">
          <ul className="max-h-56 overflow-y-auto py-1" aria-label="Employee results">
            {results
  .filter(Boolean)
  .map((emp) => (
              <li key={emp.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(emp)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-container-low)] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--on-primary)] text-xs font-bold shrink-0">
                    {getInitials(emp.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--on-surface)] truncate">{emp.name}</div>
                    <div className="text-xs text-[var(--on-surface-variant)] truncate">
                      {emp.email} · {emp.department.name}
                    </div>
                  </div>
                  {emp.jobLevel && (
                    <div className="text-xs font-mono text-[var(--on-surface-muted)] shrink-0">{emp.jobLevel.code}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && !isLoading && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-xl shadow-[0_8px_32px_rgba(33,33,33,0.14)] bg-[rgba(255,255,255,0.92)] backdrop-blur-[20px] p-4 text-center text-sm text-[var(--on-surface-variant)]">
          No employees found for <strong>&quot;{query}&quot;</strong>
        </div>
      )}
    </div>
  );
}
