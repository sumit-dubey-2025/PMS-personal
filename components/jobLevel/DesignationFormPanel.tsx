'use client';

import { useEffect, useState } from 'react';
import { Button, FieldLabel, Input, Select } from '@/components/ui';
import { Close } from '@/components/ui/Icons';
import type { Designation, JobLevel } from '@/types/jobLevel';
import type { useCreateDesignation, usePatchDesignation } from '@/hooks/useJobLevelMutations';

type CreateMutation = ReturnType<typeof useCreateDesignation>;
type PatchMutation  = ReturnType<typeof usePatchDesignation>;

interface Props {
  isOpen: boolean;
  designation: Designation | null;
  jobLevels: JobLevel[];
  departments: string[];
  onClose: () => void;
  createMutation: CreateMutation;
  patchMutation: PatchMutation;
}

export default function DesignationFormPanel({
  isOpen,
  designation,
  jobLevels,
  departments,
  onClose,
  createMutation,
  patchMutation,
}: Props) {
  const isEdit = designation !== null;

  const [title,       setTitle]       = useState('');
  const [levelId,     setLevelId]     = useState('');
  const [department,  setDepartment]  = useState('');
  const [submitted,   setSubmitted]   = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(designation?.title ?? '');
    setLevelId(designation?.associatedLevelId ?? (jobLevels[0]?.id ?? ''));
    setDepartment(designation?.department ?? (departments[0] ?? ''));
    setSubmitted(false);
    setSaveError(null);
  }, [designation, isOpen, jobLevels, departments]);

  const isMutating = createMutation.isPending || patchMutation.isPending;

  const handleSave = async () => {
    setSubmitted(true);
    if (!title.trim() || !levelId || !department) return;
    setSaveError(null);
    const payload = {
      title:             title.trim(),
      associatedLevelId: levelId,
      department,
      employeeCount:     designation?.employeeCount ?? 0,
    };
    try {
      if (isEdit && designation) {
        await patchMutation.mutateAsync({ id: designation.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      setSaveError('Something went wrong. Please try again.');
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
            {isEdit ? 'Edit Designation' : 'Add Designation'}
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
          {/* Title */}
          <div>
            <FieldLabel htmlFor="des-title">Designation Title</FieldLabel>
            <Input
              id="des-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Product Designer"
              aria-invalid={submitted && !title.trim()}
            />
            {submitted && !title.trim() && (
              <p className="mt-1 text-[11px] text-[var(--error)]">Title is required</p>
            )}
          </div>

          {/* Associated Level — dropdown */}
          <div>
            <FieldLabel htmlFor="des-level">Associated Level</FieldLabel>
            <Select
              id="des-level"
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
            >
              <option value="">Select level…</option>
              {jobLevels.map((jl) => (
                <option key={jl.id} value={jl.id}>{jl.code} – {jl.name}</option>
              ))}
            </Select>
            {submitted && !levelId && (
              <p className="mt-1 text-[11px] text-[var(--error)]">Level is required</p>
            )}
          </div>

          {/* Department — dropdown */}
          <div>
            <FieldLabel htmlFor="des-dept">Department</FieldLabel>
            <Select
              id="des-dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Select department…</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            {submitted && !department && (
              <p className="mt-1 text-[11px] text-[var(--error)]">Department is required</p>
            )}
          </div>

          {/* Employee Count — pre-populated on edit, read-only */}
          {isEdit && (
            <div>
              <FieldLabel htmlFor="des-emp">Employee Count</FieldLabel>
              <Input
                id="des-emp"
                value={designation?.employeeCount ?? 0}
                readOnly
                className="opacity-60 cursor-not-allowed"
              />
              <p className="mt-1 text-[11px] text-[var(--on-surface-muted)]">
                Auto-populated from HR system.
              </p>
            </div>
          )}

          {saveError && (
            <p className="rounded-lg bg-[var(--error-container)] px-4 py-2.5 text-sm text-[var(--error)]">
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--outline-variant)]/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="primary" onClick={handleSave} isLoading={isMutating} disabled={isMutating}>
              {isEdit ? 'Save Changes' : 'Add Designation'}
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
        </div>
      </aside>
    </>
  );
}
