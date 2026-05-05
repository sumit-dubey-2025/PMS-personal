'use client';

import { useState, useRef, useEffect } from 'react';
import { Sync, UploadFile, Search, Close, FilterList, Sort, Add } from '@/components/ui/Icons';
import EmployeeFilterPanel, { type FilterValues } from './EmployeeFilterPanel';
import EmployeeSortPanel, { type SortValue, SORT_COLUMNS } from './EmployeeSortPanel';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface EmployeeToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  roleFamily: string;
  setRoleFamily: (value: string) => void;
  jobLevel: string;
  setJobLevel: (value: string) => void;
  employmentType: string;
  setEmploymentType: (value: string) => void;
  sort: SortValue;
  onSortChange: (value: SortValue) => void;
  onSync: () => void;
  onBulkImport: () => void;
  onAddNew: () => void;
  onClearAll: () => void;
}

// ─── Active filter/sort pill ───────────────────────────────────────────────────

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="bg-secondary/10 border-secondary/20 text-secondary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="text-secondary/60 hover:text-secondary transition-colors"
        aria-label={`Remove ${label}`}
      >
        <Close size={12} />
      </button>
    </span>
  );
}

// ─── Toolbar ───────────────────────────────────────────────────────────────────

export default function EmployeeToolbar({
  search,
  onSearch,
  department,
  setDepartment,
  status,
  setStatus,
  roleFamily,
  setRoleFamily,
  jobLevel: _jobLevel,
  setJobLevel: _setJobLevel,
  employmentType,
  setEmploymentType,
  sort,
  onSortChange,
  onSync,
  onBulkImport,
  onAddNew,
  onClearAll,
}: EmployeeToolbarProps) {
  // ── Filter panel ─────────────────────────────────────────────────────────────
  const [filterOpen, setFilterOpen] = useState(false);
  const filterAnchorRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (filterAnchorRef.current && !filterAnchorRef.current.contains(e.target as Node))
        setFilterOpen(false);
    }
    if (filterOpen) document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [filterOpen]);

  // ── Sort panel ───────────────────────────────────────────────────────────────
  const [sortOpen, setSortOpen] = useState(false);
  const sortAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (sortAnchorRef.current && !sortAnchorRef.current.contains(e.target as Node))
        setSortOpen(false);
    }
    if (sortOpen) document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [sortOpen]);

  // Mutual exclusion — opening one panel closes the other
  function openFilter() {
    setSortOpen(false);
    setFilterOpen((p) => !p);
  }
  function openSort() {
    setFilterOpen(false);
    setSortOpen((p) => !p);
  }

  // ── Active chips ─────────────────────────────────────────────────────────────
  const activeFilters: { key: string; label: string; clear: () => void }[] = [
    ...(department
      ? [{ key: 'dept', label: `Dept: ${department}`, clear: () => setDepartment('') }]
      : []),
    ...(status
      ? [
          {
            key: 'status',
            label: `Status: ${status.replace('_', ' ')}`,
            clear: () => setStatus(''),
          },
        ]
      : []),
    ...(roleFamily
      ? [{ key: 'rf', label: `Role: ${roleFamily}`, clear: () => setRoleFamily('') }]
      : []),
    ...(employmentType
      ? [{ key: 'et', label: `Type: ${employmentType}`, clear: () => setEmploymentType('') }]
      : []),
    ...(keyword ? [{ key: 'kw', label: `"${keyword}"`, clear: () => setKeyword('') }] : []),
  ];

  const activeSort = sort.column
    ? {
        label: `${SORT_COLUMNS.find((c) => c.key === sort.column)?.label ?? sort.column}: ${sort.direction === 'asc' ? '↑ Asc' : '↓ Desc'}`,
        clear: () => onSortChange({ column: '', direction: 'asc' }),
      }
    : null;

  const activeCount = activeFilters.length;
  const hasSortChip = !!activeSort;
  const hasAnyChip = activeCount > 0 || hasSortChip;

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleApplyFilter(values: FilterValues) {
    setDepartment(values.department);
    setStatus(values.status);
    setRoleFamily(values.roleFamily);
    setEmploymentType(values.employmentType);
    setKeyword(values.keyword);
  }

  function handleClearAll() {
    setKeyword('');
    onSortChange({ column: '', direction: 'asc' });
    onClearAll();
  }

  const currentFilterValues: FilterValues = {
    department,
    status,
    roleFamily,
    employmentType,
    keyword,
  };

  return (
    <section className="flex flex-col gap-5">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-headline text-primary text-[28px] leading-tight font-bold tracking-tight">
            Employee Registry
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Manage {(1248).toLocaleString()} active team members across 14 regions.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onAddNew}
            className="btn-primary-gradient text-on-primary shadow-ambient flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold transition-transform hover:opacity-90 active:scale-[0.98]"
          >
            <Add size={18} className="shrink-0" />
            Add New Employee
          </button>
          <button
            onClick={onSync}
            className="bg-surface-container-highest text-on-surface hover:bg-surface-dim flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors active:scale-[0.98]"
          >
            <Sync size={18} className="shrink-0" />
            Sync from HRIS
          </button>
          <button
            onClick={onBulkImport}
            className="bg-surface-container-highest text-on-surface hover:bg-surface-dim flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors active:scale-[0.98]"
          >
            <UploadFile size={18} className="shrink-0" />
            Bulk Import
          </button>
        </div>
      </div>

      {/* ── Filter / sort bar ────────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest shadow-ambient rounded-xl px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[280px] flex-1">
            <Search
              size={16}
              className="text-on-surface-variant pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by name, email, department…"
              className="bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 focus:ring-secondary/40 border-outline-variant/20 focus:border-secondary/40 w-full rounded-md border py-2 pr-4 pl-9 text-sm transition-all outline-none focus:ring-2"
            />
          </div>

          {/* ── Filter button + panel ─────────────────────────────────────── */}
          <div ref={filterAnchorRef} className="relative">
            <button
              onClick={openFilter}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors active:scale-[0.98] ${
                filterOpen || activeCount > 0
                  ? 'bg-secondary/10 border-secondary/30 text-secondary border'
                  : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:text-on-surface border'
              }`}
            >
              <FilterList size={18} className="shrink-0" />
              Filter
              {activeCount > 0 && (
                <span className="bg-secondary text-on-secondary ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                  {activeCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <EmployeeFilterPanel
                values={currentFilterValues}
                onApply={handleApplyFilter}
                onClose={() => setFilterOpen(false)}
              />
            )}
          </div>

          {/* ── Sort button + panel ───────────────────────────────────────── */}
          <div ref={sortAnchorRef} className="relative">
            <button
              onClick={openSort}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors active:scale-[0.98] ${
                sortOpen || sort.column
                  ? 'bg-secondary/10 border-secondary/30 text-secondary border'
                  : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:text-on-surface border'
              }`}
            >
              <Sort size={18} className="shrink-0" />
              Sort
              {sort.column && (
                <span className="bg-secondary text-on-secondary ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                  1
                </span>
              )}
            </button>

            {sortOpen && (
              <EmployeeSortPanel
                value={sort}
                onApply={(v) => onSortChange(v)}
                onClose={() => setSortOpen(false)}
              />
            )}
          </div>

          {/* Clear all */}
          {hasAnyChip && (
            <button
              onClick={handleClearAll}
              className="text-secondary hover:text-secondary/80 ml-auto text-sm font-semibold transition-colors hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* ── Active chips row ─────────────────────────────────────────────── */}
        {hasAnyChip && (
          <div className="border-outline-variant/15 mt-3 flex flex-wrap gap-2 border-t pt-3">
            {activeFilters.map((f) => (
              <ActivePill key={f.key} label={f.label} onRemove={f.clear} />
            ))}
            {activeSort && (
              <ActivePill
                key="sort"
                label={`Sort: ${activeSort.label}`}
                onRemove={activeSort.clear}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
