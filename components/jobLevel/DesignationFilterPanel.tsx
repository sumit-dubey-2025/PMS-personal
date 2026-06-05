'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ExpandMore, Close, FilterList } from '@/components/ui/Icons';
import type { JobLevel } from '@/types/jobLevel';

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
            onClick={() => { onChange(''); setOpen(false); }}
            className="text-on-surface-variant hover:bg-surface-container-low w-full px-3 py-2 text-left text-sm transition-colors"
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
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

// ─── Main Filter Panel ─────────────────────────────────────────────────────────

export interface DesignationFilterValues {
  levelId: string;
  department: string;
}

interface Props {
  values: DesignationFilterValues;
  jobLevels: JobLevel[];
  departments: string[];
  onApply: (values: DesignationFilterValues) => void;
  onClose: () => void;
}

export default function DesignationFilterPanel({
  values,
  jobLevels,
  departments,
  onApply,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<DesignationFilterValues>({ ...values });

  const set = useCallback(
    <K extends keyof DesignationFilterValues>(key: K) =>
      (val: DesignationFilterValues[K]) =>
        setDraft((prev) => ({ ...prev, [key]: val })),
    [],
  );

  const activeCount = Object.values(draft).filter(Boolean).length;

  const levelOptions = jobLevels.map((jl) => `${jl.code} – ${jl.name}`);
  const levelIdFromLabel = (label: string) =>
    jobLevels.find((jl) => `${jl.code} – ${jl.name}` === label)?.id ?? '';
  const labelFromLevelId = (id: string) => {
    const jl = jobLevels.find((j) => j.id === id);
    return jl ? `${jl.code} – ${jl.name}` : '';
  };

  return (
    <div
      className="bg-surface-container-lowest border-outline-variant/20 shadow-ambient-lifted absolute top-full right-0 z-50 mt-2 w-[300px] rounded-xl border"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      {/* Header */}
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

      {/* Filter sections */}
      <div className="flex flex-col gap-5 px-5 py-4">
        {/* Job Level */}
        <div>
          <SectionHeader
            title="Job Level"
            isDirty={!!draft.levelId}
            onReset={() => set('levelId')('')}
          />
          <SelectDropdown
            value={labelFromLevelId(draft.levelId)}
            placeholder="All levels"
            options={levelOptions}
            onChange={(label) => set('levelId')(levelIdFromLabel(label))}
          />
        </div>

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
            options={departments}
            onChange={set('department')}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-outline-variant/15 flex items-center justify-between gap-3 border-t px-5 py-4">
        <button
          onClick={() => setDraft({ levelId: '', department: '' })}
          className="text-on-surface-variant hover:text-on-surface text-sm font-semibold transition-colors"
        >
          Reset all
        </button>
        <button
          onClick={() => { onApply(draft); onClose(); }}
          className="btn-primary-gradient text-on-primary flex-1 rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Apply now
        </button>
      </div>
    </div>
  );
}
