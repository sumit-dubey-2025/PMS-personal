'use client';

import { useState } from 'react';
import { Sort, Close } from '@/components/ui/Icons';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export interface SortColumn {
  key: string;
  label: string;
  /** Optional description shown as supporting text */
  description?: string;
}

export interface SortValue {
  column: string;
  direction: SortDirection;
}

// ─── Sortable columns definition ──────────────────────────────────────────────

export const SORT_COLUMNS: SortColumn[] = [
  { key: 'name', label: 'Name', description: 'A → Z / Z → A' },
  { key: 'department', label: 'Department', description: 'A → Z / Z → A' },
  { key: 'roleFamily', label: 'Role Family', description: 'A → Z / Z → A' },
  { key: 'jobLevel', label: 'Job Level', description: 'L1 → L6 / L6 → L1' },
  { key: 'employmentType', label: 'Employment Type', description: 'A → Z / Z → A' },
  { key: 'status', label: 'Status', description: 'Active first / last' },
  { key: 'joinDate', label: 'Join Date', description: 'Newest / oldest first' },
  { key: 'manager', label: 'Manager', description: 'A → Z / Z → A' },
];

// ─── Direction toggle ──────────────────────────────────────────────────────────

interface DirectionToggleProps {
  value: SortDirection;
  onChange: (d: SortDirection) => void;
}

function DirectionToggle({ value, onChange }: DirectionToggleProps) {
  return (
    <div className="border-outline-variant/25 bg-surface-container-low flex overflow-hidden rounded-md border">
      {(['asc', 'desc'] as const).map((dir) => {
        const active = value === dir;
        return (
          <button
            key={dir}
            onClick={() => onChange(dir)}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'btn-primary-gradient text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            {/* Arrow icon */}
            <svg
              viewBox="0 0 24 24"
              width={15}
              height={15}
              fill="currentColor"
              aria-hidden
              className={`shrink-0 transition-transform ${dir === 'desc' ? 'rotate-180' : ''}`}
            >
              <path d="M4 18h4v-2H4v2zM4 6v2h16V6H4zm0 7h10v-2H4v2z" />
            </svg>
            {dir === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sort Panel ────────────────────────────────────────────────────────────────

interface EmployeeSortPanelProps {
  value: SortValue;
  onApply: (value: SortValue) => void;
  onClose: () => void;
}

export default function EmployeeSortPanel({ value, onApply, onClose }: EmployeeSortPanelProps) {
  const [draft, setDraft] = useState<SortValue>({ ...value });

  const isActive = !!draft.column;

  return (
    <div
     className="bg-surface-container-lowest border-outline-variant/20 shadow-ambient-lifted absolute top-full right-0 z-50 mt-2 w-[300px] rounded-xl border"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="border-outline-variant/15 flex items-center justify-between border-b px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Sort size={18} className="text-primary" />
          <span className="font-headline text-on-surface text-base font-semibold">Sort by</span>
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md p-1.5 transition-colors"
        >
          <Close size={16} />
        </button>
      </div>

      {/* ── Column list ────────────────────────────────────────────────────── */}
      <div className="max-h-[272px] overflow-y-auto px-2 py-2">
        {SORT_COLUMNS.map((col) => {
          const selected = draft.column === col.key;
          return (
            <button
              key={col.key}
              onClick={() =>
                setDraft((prev) => ({
                  column: col.key,
                  direction: prev.direction || 'asc',
                }))
              }
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                selected ? 'bg-secondary/10' : 'hover:bg-surface-container-low'
              }`}
            >
              {/* Selection indicator */}
              <span
                className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border-2 transition-colors ${
                  selected
                    ? 'border-secondary bg-secondary'
                    : 'border-outline-variant/60 group-hover:border-outline'
                }`}
              >
                {selected && <span className="bg-on-secondary h-1.5 w-1.5 rounded-full" />}
              </span>

              {/* Label + description */}
              <div className="flex min-w-0 flex-col">
                <span
                  className={`truncate text-sm leading-tight font-medium ${selected ? 'text-secondary' : 'text-on-surface'}`}
                >
                  {col.label}
                </span>
                {col.description && (
                  <span className="text-on-surface-variant/60 mt-0.5 truncate text-xs">
                    {col.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Separator ─────────────────────────────────────────────────────── */}
      <div className="border-outline-variant/15 mx-5 border-t" />

      {/* ── Direction toggle ──────────────────────────────────────────────── */}
      <div className="px-5 py-4">
        <p className="text-on-surface-variant/70 mb-2.5 text-xs font-semibold tracking-wider uppercase">
          Order
        </p>
        <DirectionToggle
          value={draft.direction}
          onChange={(d) => setDraft((prev) => ({ ...prev, direction: d }))}
        />
      </div>

      {/* ── Footer CTAs ───────────────────────────────────────────────────── */}
      <div className="border-outline-variant/15 flex items-center justify-between gap-3 border-t px-5 pt-4 pb-5">
        <button
          onClick={() => setDraft({ column: '', direction: 'asc' })}
          disabled={!isActive}
          className="text-on-surface-variant hover:text-on-surface text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear sort
        </button>
        <button
          onClick={() => {
            onApply(draft);
            onClose();
          }}
          disabled={!isActive}
          className="text-on-primary flex-1 rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: 'linear-gradient(160deg,#002d6a 0%,#001942 100%)' }}
        >
          Apply sort
        </button>
      </div>
    </div>
  );
}
