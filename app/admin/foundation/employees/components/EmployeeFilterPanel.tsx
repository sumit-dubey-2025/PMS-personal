'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ExpandMore, Close, FilterList, FiberManualRecord } from '@/components/ui/Icons';

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEPARTMENT_OPTIONS = [
  'Engineering',
  'Design',
  'Sales',
  'Marketing',
  'People Ops',
  'Finance',
  'Operations',
  'Product',
];

const STATUS_OPTIONS: { label: string; value: string; colorClass: string }[] = [
  { label: 'Active', value: 'active', colorClass: 'text-success' },
  { label: 'On Leave', value: 'on_leave', colorClass: 'text-warning' },
  { label: 'Terminated', value: 'terminated', colorClass: 'text-error' },
];

const ROLE_FAMILY_OPTIONS = [
  'Engineering',
  'Design',
  'Sales',
  'Operations',
  'Finance',
  'People & Culture',
  'Marketing',
  'Product',
];

const EMPLOYMENT_TYPE_OPTIONS = [
  'Full-time Regular',
  'Part-time',
  'Contract',
  'Intern',
  'Consultant',
];
const statusColorClass: Record<string, string> = {
  active: 'text-success',
  on_leave: 'text-warning',
  inactive: 'text-error',
};



// ─── Sub-components ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  onReset: () => void;
  isDirty: boolean;
}
function SectionHeader({ title, onReset, isDirty }: SectionHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-on-surface-variant/70 text-xs font-semibold tracking-wider uppercase">
        {title}
      </span>
      {isDirty && (
        <button
          onClick={onReset}
          className="text-secondary hover:text-secondary/70 text-xs font-semibold transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}

interface SelectDropdownProps {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}
function SelectDropdown({ value, placeholder, options, onChange }: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors ${
          open
            ? 'bg-surface-container-low border-secondary/50 ring-secondary/20 ring-2'
            : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60'
        } ${value ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ExpandMore
          size={16}
          className={`text-on-surface-variant shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="bg-surface-container-lowest border-outline-variant/20 shadow-ambient-lifted absolute top-full right-0 left-0 z-[60] mt-1 max-h-48 overflow-y-auto rounded-lg border py-1">
          <button
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="text-on-surface-variant hover:bg-surface-container-low w-full px-3 py-2 text-left text-sm transition-colors"
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                opt === value
                  ? 'bg-secondary/10 text-secondary font-medium'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface StatusDropdownProps {
  value: string;
  onChange: (v: string) => void;
}
function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = STATUS_OPTIONS.find((s) => s.value === value);
  const colorClass = current
  ? statusColorClass[current.value ?? '']
  : '';

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors ${
          open
            ? 'bg-surface-container-low border-secondary/50 ring-secondary/20 ring-2'
            : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60'
        }`}
      >
        <span
          className={`flex items-center gap-2 ${current ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}
        >
          {current && (
           <FiberManualRecord
    size={10}
    className={`${colorClass} shrink-0`}
  />
          )}
          {current ? current.label : 'All statuses'}
        </span>
        <ExpandMore
          size={16}
          className={`text-on-surface-variant shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="bg-surface-container-lowest border-outline-variant/20 shadow-ambient-lifted absolute top-full right-0 left-0 z-[60] mt-1 rounded-lg border py-1">
          <button
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="text-on-surface-variant hover:bg-surface-container-low w-full px-3 py-2 text-left text-sm transition-colors"
          >
            All statuses
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                opt.value === value
                  ? 'bg-secondary/10 text-on-surface font-medium'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <FiberManualRecord size={10} style={{ color: opt.colorClass, flexShrink: 0 }} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Filter Panel ─────────────────────────────────────────────────────────

export interface FilterValues {
  department: string;
  status: string;
  roleFamily: string;
  employmentType: string;
  keyword: string;
}

interface EmployeeFilterPanelProps {
  values: FilterValues;
  onApply: (values: FilterValues) => void;
  onClose: () => void;
}

export default function EmployeeFilterPanel({
  values,
  onApply,
  onClose,
}: EmployeeFilterPanelProps) {
  // Local draft state — only committed on "Apply now"
  const [draft, setDraft] = useState<FilterValues>({ ...values });

  const set = useCallback(
    <K extends keyof FilterValues>(key: K) =>
      (val: FilterValues[K]) =>
        setDraft((prev) => ({ ...prev, [key]: val })),
    [],
  );

  const activeCount = Object.values(draft).filter(Boolean).length;

  return (
    <div
      className="bg-surface-container-lowest border-outline-variant/20 shadow-ambient-lifted absolute top-full right-0 z-50 mt-2 w-[320px] rounded-xl border"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      {/* ── Panel header ────────────────────────────────────────────────── */}
      <div className="border-outline-variant/15 flex items-center justify-between border-b px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <FilterList size={18} className="text-primary" />
          <span className="font-headline text-on-surface text-base font-semibold">Filter</span>
          {activeCount > 0 && (
            <span className="bg-secondary text-on-secondary inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md p-1.5 transition-colors"
        >
          <Close size={16} />
        </button>
      </div>

      {/* ── Filter sections ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 px-5 py-4">
        {/* Department */}
        <div>
          <SectionHeader
            title="Department"
            isDirty={!!draft.department}
            onReset={() => set('department')('')}
          />
          <SelectDropdown
            value={draft.department}
            placeholder="All departments"
            options={DEPARTMENT_OPTIONS}
            onChange={set('department')}
          />
        </div>

        {/* Status */}
        <div>
          <SectionHeader
            title="Status"
            isDirty={!!draft.status}
            onReset={() => set('status')('')}
          />
          <StatusDropdown value={draft.status} onChange={set('status')} />
        </div>

        {/* Role Family */}
        <div>
          <SectionHeader
            title="Role Family"
            isDirty={!!draft.roleFamily}
            onReset={() => set('roleFamily')('')}
          />
          <SelectDropdown
            value={draft.roleFamily}
            placeholder="All role families"
            options={ROLE_FAMILY_OPTIONS}
            onChange={set('roleFamily')}
          />
        </div>

        {/* Employment Type */}
        <div>
          <SectionHeader
            title="Employment Type"
            isDirty={!!draft.employmentType}
            onReset={() => set('employmentType')('')}
          />
          <SelectDropdown
            value={draft.employmentType}
            placeholder="All types"
            options={EMPLOYMENT_TYPE_OPTIONS}
            onChange={set('employmentType')}
          />
        </div>

        {/* Keyword Search */}
        <div>
          <SectionHeader
            title="Keyword Search"
            isDirty={!!draft.keyword}
            onReset={() => set('keyword')('')}
          />
          <div className="relative">
            <Search
              size={15}
              className="text-on-surface-variant/60 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              type="text"
              value={draft.keyword}
              onChange={(e) => set('keyword')(e.target.value)}
              placeholder="Search…"
              className="bg-surface-container-low border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary/50 focus:ring-secondary/20 w-full rounded-md border py-2.5 pr-3 pl-9 text-sm transition-all outline-none focus:ring-2"
            />
            {draft.keyword && (
              <button
                onClick={() => set('keyword')('')}
                className="text-on-surface-variant/50 hover:text-on-surface-variant absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors"
              >
                <Close size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer CTAs ─────────────────────────────────────────────────── */}
      <div className="border-outline-variant/15 flex items-center justify-between gap-3 border-t px-5 py-4">
        <button
          onClick={() =>
            setDraft({
              department: '',
              status: '',
              roleFamily: '',
              employmentType: '',
              keyword: '',
            })
          }
          className="text-on-surface-variant hover:text-on-surface text-sm font-semibold transition-colors"
        >
          Reset all
        </button>
        <button
          onClick={() => {
            onApply(draft);
            onClose();
          }}         
          className="btn-primary-gradient text-on-primary flex-1 rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                 >
          Apply now
        </button>
      </div>
    </div>
  );
}
