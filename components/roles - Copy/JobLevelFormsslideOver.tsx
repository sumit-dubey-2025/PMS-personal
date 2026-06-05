'use client';

import { useEffect, useState } from 'react';
import { Button, FieldLabel, Input, Select } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Tooltip } from '@/components/ui/Tooltip';
import { Close } from '@/components/ui/Icons';
import type { RoleFamily, JobLevel } from '@/types/role';
import type { useCreateRoleFamily, usePatchRoleFamily } from '@/hooks/useRoleMutations';

type CreateMutation = ReturnType<typeof useCreateRoleFamily>;
type PatchMutation  = ReturnType<typeof usePatchRoleFamily>;

interface Props {
  isOpen: boolean;
  roleFamily: RoleFamily | null;
  jobLevels: JobLevel[];
  onClose: () => void;
  createMutation: CreateMutation;
  patchMutation: PatchMutation;
}

const ROLE_ICONS = [
  { value: 'code',                    label: 'Engineering / Tech' },
  { value: 'trending_up',             label: 'Sales / Growth' },
  { value: 'precision_manufacturing', label: 'Operations' },
  { value: 'account_balance',         label: 'Finance' },
  { value: 'campaign',                label: 'Marketing' },
  { value: 'support_agent',           label: 'Customer Success' },
  { value: 'manage_accounts',         label: 'HR / People' },
  { value: 'gavel',                   label: 'Legal / Compliance' },
  { value: 'science',                 label: 'Research / Data' },
  { value: 'design_services',         label: 'Design / Creative' },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--secondary-dark)] pb-1 border-b border-[var(--surface-container-high)]">
      {children}
    </p>
  );
}

export default function RoleFormSlideOver({
  isOpen,
  roleFamily,
  jobLevels,
  onClose,
  createMutation,
  patchMutation,
}: Props) {
  const isEdit = roleFamily !== null;

  const [name,             setName]             = useState('');
  const [code,             setCode]             = useState('');
  const [isActive,         setIsActive]         = useState(true);
  const [description,      setDescription]      = useState('');
  const [icon,             setIcon]             = useState('code');
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);
  const [submitted,        setSubmitted]        = useState(false);
  const [saveError,        setSaveError]        = useState<string | null>(null);

  const sortedLevels = [...jobLevels].sort((a, b) => a.order - b.order);

  // Derive selected level IDs from minLevelCode/maxLevelCode when editing
  useEffect(() => {
    if (!isOpen) return;
    setName(roleFamily?.name ?? '');
    setCode(roleFamily?.code ?? '');
    setIsActive(roleFamily?.isActive ?? true);
    setDescription(roleFamily?.description ?? '');
    setIcon(roleFamily?.icon ?? 'code');

    // Build selected IDs from min→max range
    if (roleFamily?.minLevelCode && roleFamily?.maxLevelCode) {
      const min = sortedLevels.findIndex((l) => l.band === roleFamily.minLevelCode);
      const max = sortedLevels.findIndex((l) => l.band === roleFamily.maxLevelCode);
      if (min !== -1 && max !== -1) {
        setSelectedLevelIds(sortedLevels.slice(min, max + 1).map((l) => l.id));
      } else {
        setSelectedLevelIds([]);
      }
    } else {
      setSelectedLevelIds([]);
    }

    setSubmitted(false);
    setSaveError(null);
  }, [roleFamily, isOpen]);

  const toggleLevel = (id: string) => {
    setSelectedLevelIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  // Derive min/max from selected IDs
  const getMinMax = () => {
    const selected = sortedLevels.filter((l) => selectedLevelIds.includes(l.id));
    if (selected.length === 0) return { minLevelCode: '', maxLevelCode: '' };
    return {
      minLevelCode: selected[0].band,
      maxLevelCode: selected[selected.length - 1].band,
    };
  };

  const isMutating = createMutation.isPending || patchMutation.isPending;

  const handleSave = async () => {
    setSubmitted(true);
    if (!name.trim() || !code.trim()) return;
    setSaveError(null);
    const { minLevelCode, maxLevelCode } = getMinMax();
    const payload = {
      name: name.trim(),
      code: code.trim(),
      isActive,
      description: description.trim(),
      icon,
      minLevelCode,
      maxLevelCode,
    };
    try {
      if (isEdit && roleFamily) {
        await patchMutation.mutateAsync({ id: roleFamily.id, data: payload });
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
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-[var(--surface-container-lowest)] shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--outline-variant)]/30 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-[var(--on-surface)]">
              {isEdit ? 'Edit Role' : 'Add Role'}
            </h2>
            {isEdit && roleFamily && (
              <p className="mt-0.5 text-[11px] text-[var(--on-surface-muted)]">
                Modifying: {roleFamily.name} ({roleFamily.code})
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <Close size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <SectionHeading>Basic Information</SectionHeading>

          <div className="space-y-4 pt-1">

            {/* Role Name */}
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--on-surface-variant)] mb-1.5">
                Role Family Name
                <span className="text-[var(--error)] text-sm font-bold ml-0.5">*</span>
                <Tooltip label="Role Name" description="Max 100 characters" />
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Engineering"
                aria-invalid={submitted && !name.trim()}
              />
              {submitted && !name.trim() && (
                <p className="mt-1 text-[11px] text-[var(--error)]">Role name is required</p>
              )}
            </div>

            {/* Family Code + Status — Fix 3: same height, aligned row */}
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--on-surface-variant)] mb-1.5">
                  Family Code
                  <span className="text-[var(--error)] text-sm font-bold ml-0.5">*</span>
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RF-ENG-001"
                  readOnly={isEdit}
                  className={isEdit ? 'opacity-60 cursor-not-allowed' : ''}
                  aria-invalid={submitted && !code.trim()}
                />
                {submitted && !code.trim() && (
                  <p className="mt-1 text-[11px] text-[var(--error)]">Code is required</p>
                )}
              </div>

              <div>
                <FieldLabel htmlFor="rf-status">Status</FieldLabel>
                <Select
                  id="rf-status"
                  value={isActive ? 'Active' : 'Inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'Active')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <FieldLabel htmlFor="rf-description">Description</FieldLabel>
              <Textarea
                id="rf-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the scope and responsibilities of this role family..."
                rows={4}
              />
            </div>

            {/* Icon */}
            <div>
              <FieldLabel htmlFor="rf-icon">Icon</FieldLabel>
              <Select
                id="rf-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                {ROLE_ICONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-container-high)]">
                  <span className="material-symbols-rounded text-[20px] text-[var(--on-surface-variant)]">
                    {icon}
                  </span>
                </div>
                <span className="text-xs text-[var(--on-surface-muted)]">Preview</span>
              </div>
            </div>
          </div>

          {/* Assigned Job Levels — Fix 4: multi-select chips back */}
          <div className="space-y-3 pt-1">
            <SectionHeading>Assigned Job Levels</SectionHeading>
            <p className="text-[11px] text-[var(--on-surface-muted)]">
              Select the job levels that apply to this role family.
            </p>
            <div className="flex flex-wrap gap-2">
              {sortedLevels.map((level) => {
                const selected = selectedLevelIds.includes(level.id);
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => toggleLevel(level.id)}
                    className={[
                      'px-4 py-2 rounded-lg text-sm font-semibold transition-all border',
                      selected
                        ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                        : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]/40 hover:border-[var(--primary)]/50',
                    ].join(' ')}
                  >
                    {level.band}
                  </button>
                );
              })}
              {sortedLevels.length === 0 && (
                <p className="text-xs text-[var(--on-surface-muted)]">
                  No job levels defined yet. Add them in the Job Levels tab.
                </p>
              )}
            </div>
          </div>

          {saveError && (
            <p className="rounded-lg bg-[var(--error-container)] px-4 py-2.5 text-sm text-[var(--error)]">
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--outline-variant)]/30 px-6 py-4">
          <Button variant="primary" onClick={handleSave} isLoading={isMutating} disabled={isMutating}>
            {isEdit ? 'Save Changes' : 'Create Role'}
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
      </aside>
    </>
  );
}
