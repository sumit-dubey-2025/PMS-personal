'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Close } from '@/components/ui/Icons';
import { listEmployees } from '@/lib/api/employees';
import type { Employee } from '@/types/employee';

interface Props {
  value: string;           // stores the selected employee ID
  onChange: (id: string) => void;
  placeholder?: string;
  excludeId?: string;      // optionally exclude an employee (e.g. the employee being edited)
  initialEmployee?: { id: string; name: string | null; email: string } | null;
}

export default function PeoplePicker({
  value,
  onChange,
  placeholder = 'Search by name…',
  excludeId,
  initialEmployee,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // If editing an existing employee, load their name on mount
useEffect(() => {
  if (!value) {
    setSelectedEmployee(null);
    return;
  }

  // Use initialEmployee directly if id matches — avoids searching by email
  if (initialEmployee && initialEmployee.id === value) {
     setSelectedEmployee({
      ...initialEmployee,
      name: initialEmployee.name ?? ""
    } as Employee);
    return;
  }

  // Fallback: fetch from API (works when value is a numeric id)
  if (!selectedEmployee || selectedEmployee.id !== value) {
    listEmployees({ search: value, limit: 5 })
      .then(res => {
        const match = res.data.find(e => e.id === value);
        if (match) setSelectedEmployee(match);
      })
      .catch(() => {});
  }
}, [value, initialEmployee]); // 👈 add initialEmployee to deps

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await listEmployees({ search: query, limit: 10, status: 'Active' });
        const filtered = excludeId
          ? res.data.filter(e => e.id !== excludeId)
          : res.data;
        setResults(filtered);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, excludeId]);

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

  function handleSelect(employee: Employee) {
    setSelectedEmployee(employee);
    onChange(employee.id);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  function handleClear() {
    setSelectedEmployee(null);
    onChange('');
    setQuery('');
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Selected person tag */}
      {selectedEmployee ? (
        <div className="bg-secondary-container/30 border-outline-variant/20 flex items-center gap-2 rounded-md border px-3 py-2">
          <div className="bg-secondary/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase">
            {selectedEmployee.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-on-surface text-sm font-medium truncate">
              {selectedEmployee.name}
            </p>
            <p className="text-outline text-[10px] truncate">{selectedEmployee.email}</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-outline hover:text-on-surface shrink-0 transition-colors"
            title="Remove"
          >
            <Close size={14} />
          </button>
        </div>
      ) : (
        /* Search input */
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className="bg-surface-container-low text-on-surface focus:ring-secondary/40 w-full rounded-md px-3 py-2.5 pr-9 text-sm outline-none focus:ring-2"
          />
          <div className="pointer-events-none absolute right-3">
            {isLoading ? (
              <div className="border-secondary h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent" />
            ) : (
              <Search size={14} className="text-on-surface-variant" />
            )}
          </div>
        </div>
      )}

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
  <ul className="bg-surface-container-low border-outline-variant/20 shadow-ambient absolute z-50 mt-1 w-full overflow-hidden rounded-md border">
    {results.map(emp => (
            <li key={emp.id}>
              <button
                type="button"
                onClick={() => handleSelect(emp)}
                className="hover:bg-surface-container flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
              >
                <div className="bg-secondary/20 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase">
                  {emp.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-on-surface text-sm font-medium truncate">{emp.name}</p>
                  <p className="text-outline text-[10px] truncate">{emp.email}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {isOpen && !isLoading && results.length === 0 && query.trim() && (
        <div className="bg-surface-container-low border-outline-variant/20 shadow-ambient-md absolute z-50 mt-1 w-full rounded-md border px-3 py-3">
          <p className="text-outline text-sm">No employees found for "{query}"</p>
        </div>
      )}
    </div>
  );
}