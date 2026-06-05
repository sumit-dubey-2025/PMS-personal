'use client';

import { useEffect, useState } from 'react';
import { Button, FieldLabel, Input, Select } from '@/components/ui';
import { Tooltip } from '@/components/ui/Tooltip';
import { Close, Archive } from '@/components/ui/Icons';
import type { JobLevel, JobLevelBand } from '@/types/role';
import type { useCreateJobLevel, usePatchJobLevel, useArchiveJobLevel } from '@/hooks/useRoleMutations';

type CreateMutation  = ReturnType<typeof useCreateJobLevel>;
type PatchMutation   = ReturnType<typeof usePatchJobLevel>;
type ArchiveMutation = ReturnType<typeof useArchiveJobLevel>;

interface Props {
  isOpen: boolean;
  jobLevel: JobLevel | null;
  onClose: () => void;
  createMutation: CreateMutation;
  patchMutation: PatchMutation;
  archiveMutation: ArchiveMutation;
}

const BANDS: JobLevelBand[] = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];

const TRACKS = [
  'Core Track',
  'Specialist Track',
  'Leadership Track',
  'Executive Track',
  'Individual Contributor',
];

export default function JobLevelFormPanel({
  isOpen,
  jobLevel,
  onClose,
  createMutation,
  patchMutation,
  archiveMutation,
}: Props) {
  const isEdit = jobLevel !== null;

  const [name,           setName]           = useState('');
  const [code,           setCode]           = useState('');
  const [order,          setOrder]          = useState(1);
  const [band,           setBand]           = useState<JobLevelBand>('L1');
  const [track,          setTrack]          = useState('Core Track');
  const [salaryMin,      setSalaryMin]      = useState('');
  const [salaryMax,      setSalaryMax]      = useState('');
  const [submitted,      setSubmitted]      = useState(false);
  const [saveError,      setSaveError]      = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(jobLevel?.name ?? '');
    setCode(jobLevel?.code ?? '');
    setOrder(jobLevel?.order ?? 1);
    setBand(jobLevel?.band ?? 'L1');
    setTrack(jobLevel?.track ?? 'Core Track');
    setSalaryMin(jobLevel?.salaryMin ? String(jobLevel.salaryMin) : '');
    setSalaryMax(jobLevel?.salaryMax ? String(jobLevel.salaryMax) : '');
    setSubmitted(false);
    setSaveError(null);
    setConfirmArchive(false);
  }, [jobLevel, isOpen]);

  const isMutating = createMutation.isPending || patchMutation.isPending || archiveMutation.isPending;

  const handleSave = async () => {
    setSubmitted(true);
    if (!name.trim() || !code.trim()) return;
    setSaveError(null);
    const payload = {
      name:      name.trim(),
      code:      code.trim().toUpperCase(),
      order:     Number(order),
      band,
      track,
      salaryMin: salaryMin ? Number(salaryMin) : 0,
      salaryMax: salaryMax ? Number(salaryMax) : 0,
    };
    try {
      if (isEdit && jobLevel) {
        await patchMutation.mutateAsync({ id: jobLevel.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      setSaveError('Something went wrong. Please try again.');
    }
  };

  const handleArchive = async () => {
    if (!jobLevel) return;
    try {
      await archiveMutation.mutateAsync(jobLevel.id);
      onClose();
    } catch {
      setSaveError('Archive failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col bg-[var(--surface-container-lowest)] shadow-2xl rounded-l-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--outline-variant)]/30 px-6 py-5">
          <h2 className="text-base font-bold text-[var(--on-surface)]">
            {isEdit ? 'Edit Job Level' : 'Add Job Level'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <Close size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <div>
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--on-surface-variant)] mb-1.5">
              Level Name
              <Tooltip label="Level Name" description="e.g. Manager, Senior Consultant" />
            </label>
            <Input
              id="jl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Manager"
              aria-invalid={submitted && !name.trim()}
            />
            {submitted && !name.trim() && (
              <p className="mt-1 text-[11px] text-[var(--error)]">Level name is required</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--on-surface-variant)] mb-1.5">
                Level Code
                <Tooltip label="Level Code" description="Unique code, e.g. JC-L5. Read-only after save." />
              </label>
              <Input
                id="jl-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. JC-L5"
                readOnly={isEdit}
                className={isEdit ? 'opacity-60 cursor-not-allowed' : ''}
                aria-invalid={submitted && !code.trim()}
              />
              {submitted && !code.trim() && (
                <p className="mt-1 text-[11px] text-[var(--error)]">Code is required</p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="jl-order">Level Order</FieldLabel>
              <Input
                id="jl-order"
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                placeholder="#2"
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="jl-band">Level Band</FieldLabel>
            <Select
              id="jl-band"
              value={band}
              onChange={(e) => setBand(e.target.value as JobLevelBand)}
            >
              {BANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
          </div>

          <div>
            <FieldLabel htmlFor="jl-track">Track</FieldLabel>
            <Select
              id="jl-track"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
            >
              {TRACKS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>

          {/* Salary Band */}
          <div>
            <FieldLabel>Salary Band (Annual USD)</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--on-surface-muted)]">$</span>
                <Input
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="145,000"
                  className="pl-7"
                  type="number"
                  min={0}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--on-surface-muted)]">$</span>
                <Input
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="185,000"
                  className="pl-7"
                  type="number"
                  min={0}
                />
              </div>
            </div>
          </div>

          {saveError && (
            <p className="rounded-lg bg-[var(--error-container)] px-4 py-2.5 text-sm text-[var(--error)]">
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--outline-variant)]/30 px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <Button variant="primary" onClick={handleSave} isLoading={isMutating} disabled={isMutating}>
              {isEdit ? 'Save Changes' : 'Add Level'}
            </Button>
            <button
              type="button"
              onClick={onClose}
              disabled={isMutating}
              className="px-4 py-2 text-sm font-semibold text-[var(--on-surface-variant)] border border-[var(--outline-variant)]/40 rounded-lg hover:bg-[var(--surface-container-low)] transition-colors disabled:opacity-50"
            >
              Discard
            </button>
          </div>

          {isEdit && (
            <div className="pt-1">
              {!confirmArchive ? (
                <button
                  type="button"
                  onClick={() => setConfirmArchive(true)}
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--error)] hover:opacity-80 transition-opacity"
                >
                  <Archive size={13} />
                  Archive Level
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-[11px] text-[var(--on-surface-muted)]">Are you sure?</p>
                  <button
                    type="button"
                    onClick={handleArchive}
                    disabled={isMutating}
                    className="text-[11px] font-bold uppercase tracking-wider text-[var(--error)] hover:opacity-80"
                  >
                    Yes, Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmArchive(false)}
                    className="text-[11px] font-bold uppercase tracking-wider text-[var(--on-surface-variant)] hover:opacity-80"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
