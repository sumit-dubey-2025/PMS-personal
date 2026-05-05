'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MatrixReportingForm } from './MatrixReportingForm';
import { Close, PhotoCamera, Person, Lock, AccountTree } from '@/components/ui/Icons';
import type { Employee } from '@/types/employee';
import { useCreateEmployee, usePatchEmployee, useUploadEmployeePhoto } from '@/hooks/useEmployeeMutations';
import PeoplePicker from '@/components/ui/PeoplePicker';
import {
  ROLE_FAMILY_MAP,
  JOB_LEVEL_MAP,
  ROLE_FAMILY_BY_CODE,
  JOB_LEVEL_BY_ID
} from '@/lib/lookups';

// ─── Form schema ───────────────────────────────────────────────────────────────
const employeeSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  employeeCode: z.string().optional(),
  status: z.string(),
  departmentId: z.string(),
  primaryManagerId: z.string().optional(),
  roleFamilyId: z.string().optional(),
  jobLevelId: z.string().optional(),
  employmentType: z.string(),
  joinDate: z.string(),
  matrixManagers: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      weight: z.number().min(0).max(100),
    }),
  ),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────────
type CreateMutation = ReturnType<typeof useCreateEmployee>;
type PatchMutation  = ReturnType<typeof usePatchEmployee>;

interface OrgNode {
  id: string;
  nodeCode: string;
  name: string;
  type: string;
}

interface Props {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  createMutation: CreateMutation;
  patchMutation: PatchMutation;
  orgNodes: OrgNode[];
  isOrgNodesLoading: boolean;
}

// ─── Shared field label ────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5">
      {children}
    </label>
  );
}

// ─── Section heading — styled like old project sectionDivider ─────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--secondary-dark)] pb-1 border-b border-[var(--surface-container-high)] font-body">
      {children}
    </p>
  );
}

// ─── EmployeeFormSlideOver ─────────────────────────────────────────────────────
export default function EmployeeFormSlideOver({
  isOpen,
  employee,
  onClose,
  createMutation,
  patchMutation,
  orgNodes,
  isOrgNodesLoading,
}: Props) {
  const isEdit = employee !== null;
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const uploadPhotoMutation = useUploadEmployeePhoto();

  useEffect(() => {
    setPhotoPreview(employee?.profilePhotoUrl ?? null);
  }, [employee]);

  const methods = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '', email: '', employeeCode: '', status: 'active',
      departmentId: '', primaryManagerId: '', roleFamilyId: '',
      jobLevelId: '', employmentType: 'full_time', joinDate: '',
      matrixManagers: [],
    },
  });

  useEffect(() => {
    if (employee) {
      methods.reset({
        name: employee.name,
        email: employee.email,
        employeeCode: employee.employeeCode ?? '',
        status: employee.status ?? 'active',
        departmentId: '',
        primaryManagerId: employee.primaryManager?.id ?? '',
        roleFamilyId: ROLE_FAMILY_BY_CODE[employee.roleFamily?.id ?? ''] ?? '',
        jobLevelId: JOB_LEVEL_BY_ID[employee.jobLevel?.id ?? ''] ?? '',
        employmentType: employee.employmentType ?? 'full_time',
        joinDate: employee.joinDate ? employee.joinDate.split('T')[0] : '',
        matrixManagers: [],
      });
    } else {
      methods.reset({
        name: '', email: '', employeeCode: '', status: 'active',
        departmentId: '', primaryManagerId: '', roleFamilyId: '',
        jobLevelId: '', employmentType: 'full_time', joinDate: '',
        matrixManagers: [],
      });
    }
  }, [employee, methods]);

  useEffect(() => {
    if (orgNodes.length === 0) return;
    if (employee?.department?.id) {
      const matchingNode = orgNodes.find(node => node.nodeCode === employee.department.id);
      if (matchingNode) {
        methods.setValue('departmentId', matchingNode.id, { shouldDirty: false });
        return;
      }
    }
    const currentValue = methods.getValues('departmentId');
    if (!currentValue) {
      methods.setValue('departmentId', orgNodes[0].id, { shouldDirty: false });
    }
  }, [orgNodes, employee, methods]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select a valid image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Image must be smaller than 2MB.'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(data: EmployeeFormValues) {
    const roleFamilyId = data.roleFamilyId ? String(ROLE_FAMILY_MAP[data.roleFamilyId] ?? '') : undefined;
    const jobLevelId   = data.jobLevelId   ? String(JOB_LEVEL_MAP[data.jobLevelId]   ?? '') : undefined;

    if (isEdit && employee) {
      patchMutation.mutate(
        { id: employee.id, data: { name: data.name, email: data.email, employeeCode: data.employeeCode || undefined, status: data.status, departmentId: data.departmentId, primaryManagerId: data.primaryManagerId || undefined, roleFamilyId, jobLevelId, employmentType: data.employmentType, joinDate: data.joinDate || undefined } },
        { onSuccess: async (updatedEmployee) => { try { if (photoFile) { await uploadPhotoMutation.mutateAsync({ id: updatedEmployee.id, file: photoFile }); } } finally { onClose(); } } },
      );
    } else {
      createMutation.mutate(
        { name: data.name, email: data.email, firstName: data.name.split(' ')[0], lastName: data.name, departmentId: data.departmentId, joinDate: data.joinDate, employeeCode: data.employeeCode || undefined, status: data.status, primaryManagerId: data.primaryManagerId || undefined, roleFamilyId, jobLevelId, employmentType: data.employmentType },
        { onSuccess: async (newEmployee) => { try { if (photoFile) { await uploadPhotoMutation.mutateAsync({ id: newEmployee.id, file: photoFile }); } } finally { onClose(); } } },
      );
    }
  }

  const isSaving  = createMutation.isPending || patchMutation.isPending;
  const saveError = createMutation.error ?? patchMutation.error;

  return (
    <>
      {/* ── Dim backdrop ───────────────────────────────────────────── */}
      <div
        className="bg-tertiary/10 fixed inset-0 z-40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Slide-over panel ───────────────────────────────────────── */}
      <aside className="bg-surface-container-lowest shadow-ambient-lifted fixed top-16 right-0 z-50 flex h-[calc(100vh-4rem)] w-[420px] flex-col rounded-l-2xl">

        {/* Header */}
        <header className="border-outline-variant/15 bg-surface-container-lowest/90 sticky top-0 z-10 flex shrink-0 items-center justify-between border-b px-6 py-4 backdrop-blur-[20px]">
          <div>
            {isEdit && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary-dark)] mb-1">
                ID: {employee.employeeCode ?? employee.id}
              </p>
            )}
            <h2 className="text-xl font-headline font-bold text-[var(--primary)]">
              {isEdit ? 'Edit Employee' : 'Add New Employee'}
            </h2>
          </div>
          <button
            onClick={onClose}
            title="Close"
            className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <Close size={20} className="text-[var(--on-surface-variant)]" />
          </button>
        </header>

        {/* ── Scrollable form body ───────────────────────────────────── */}
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-y-auto"
          >
            <div className="flex flex-col gap-5 px-6 py-6">

              {/* Profile photo */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="relative">
                  <div className="bg-[var(--surface-container-high)] shadow-ambient ring-[var(--secondary-container)]/15 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl ring-4">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Employee photo" className="h-full w-full object-cover" />
                    ) : (
                      <Person size={36} className="text-[var(--on-surface-variant)]" />
                    )}
                  </div>
                  <button
                    type="button"
                    title="Upload photo"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-outline-variant/20 bg-[var(--surface-container-lowest)] text-[var(--secondary)] shadow-ambient hover:bg-[var(--surface-container-low)] absolute -right-2 -bottom-2 rounded-md border p-1.5 transition-colors"
                  >
                    <PhotoCamera size={15} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setPhotoFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-[10px] text-red-500 underline"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {/* Full Name */}
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <input
                  {...methods.register('name')}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-4 py-3 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium outline-none transition-all"
                />
                {methods.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-500">{methods.formState.errors.name.message}</p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <FieldLabel>Work Email</FieldLabel>
                <div className="relative">
                  <input
                    {...methods.register('email')}
                    type="email"
                    readOnly={isEdit}
                    placeholder="jane@company.com"
                    className={`w-full px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all ${
                      isEdit
                        ? 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] cursor-not-allowed pr-10'
                        : 'bg-[var(--surface-container-low)] text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] border-none'
                    }`}
                  />
                  {isEdit && (
                    <Lock size={14} className="text-[var(--on-surface-variant)]/50 pointer-events-none absolute top-4 right-3" />
                  )}
                </div>
                {!isEdit && methods.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-500">{methods.formState.errors.email.message}</p>
                )}
              </div>

              {/* Employee Code + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Employee Code</FieldLabel>
                  <input
                    {...methods.register('employeeCode')}
                    placeholder="e.g. EMP-001"
                    className="w-full px-4 py-3 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium outline-none transition-all"
                  />
                </div>
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <div className="relative">
                    <select
                      {...methods.register('status')}
                      className="w-full px-4 py-3 pr-10 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium appearance-none outline-none transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-4 w-4 h-4 text-[var(--on-surface-variant)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Organization & Role section ─────────────────────────── */}
            <div className="flex flex-col gap-5 px-6 pt-5 pb-6 mt-2">
              <SectionHeading>Organization &amp; Role</SectionHeading>

              {/* Department */}
              <div>
                <FieldLabel>Department</FieldLabel>
                <div className="relative">
                  <select
                    {...methods.register('departmentId')}
                    disabled={isOrgNodesLoading}
                    className="w-full px-4 py-3 pr-10 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium appearance-none outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {orgNodes.map(node => (
                      <option key={node.id} value={node.id}>
                        {node.name ? `${node.name} (${node.nodeCode})` : node.nodeCode}
                      </option>
                    ))}
                  </select>
                  <AccountTree size={15} className="text-[var(--on-surface-variant)] pointer-events-none absolute right-3 top-4" />
                </div>
              </div>

              {/* Primary Manager */}
              <div>
                <FieldLabel>
                  Primary Manager{' '}
                  <span className="text-[var(--on-surface-variant)] font-normal normal-case tracking-normal">(optional)</span>
                </FieldLabel>
                <PeoplePicker
                  value={methods.watch('primaryManagerId') ?? ''}
                  onChange={id => methods.setValue('primaryManagerId', id)}
                  placeholder="Search by name…"
                  excludeId={employee?.id}
                  initialEmployee={employee?.primaryManager ? {
                    id: employee.primaryManager.id,
                    name: employee.primaryManager.name,
                    email: employee.primaryManager.id,
                  } : null}
                />
              </div>

              {/* Role Family + Job Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Role Family</FieldLabel>
                  <div className="relative">
                    <select
                      {...methods.register('roleFamilyId')}
                      className="w-full px-4 py-3 pr-10 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium appearance-none outline-none transition-all"
                    >
                      <option value="">Select…</option>
                      {Object.entries(ROLE_FAMILY_MAP).map(([key]) => (
                        <option key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-4 w-4 h-4 text-[var(--on-surface-variant)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <FieldLabel>Job Level</FieldLabel>
                  <div className="relative">
                    <select
                      {...methods.register('jobLevelId')}
                      className="w-full px-4 py-3 pr-10 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium appearance-none outline-none transition-all"
                    >
                      <option value="">Select…</option>
                      {Object.entries(JOB_LEVEL_MAP).map(([key]) => (
                        <option key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-4 w-4 h-4 text-[var(--on-surface-variant)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Employment Type + Joining Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Employment Type</FieldLabel>
                  <div className="relative">
                    <select
                      {...methods.register('employmentType')}
                      className="w-full px-4 py-3 pr-10 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium appearance-none outline-none transition-all"
                    >
                      <option value="full_time">Full-time Regular</option>
                      <option value="part_time">Part-time</option>
                      <option value="contractor">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-4 w-4 h-4 text-[var(--on-surface-variant)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <FieldLabel>Joining Date</FieldLabel>
                  <input
                    type="date"
                    {...methods.register('joinDate')}
                    className="w-full px-4 py-3 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ── Matrix Reporting section ────────────────────────────── */}
            <MatrixReportingForm />

            {/* ── Sticky footer ───────────────────────────────────────── */}
            <footer className="border-outline-variant/15 bg-surface-container-lowest/90 sticky bottom-0 z-10 flex shrink-0 flex-col gap-3 border-t px-6 py-4 backdrop-blur-[20px]">
              {saveError && (() => {
                const err = saveError as Error & { detail?: string; errors?: { field: string; message: string }[] };
                const fieldErrors = err.errors ?? [];
                return (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-red-500 space-y-1 text-[11px]">
                      <p className="font-semibold">{err.message || 'Failed to save. Please try again.'}</p>
                      {fieldErrors.length > 0 && (
                        <ul className="list-disc pl-4 space-y-0.5">
                          {fieldErrors.map((e, i) => (
                            <li key={i}><span className="font-medium capitalize">{e.field}</span>: {e.message}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-bold text-[var(--on-surface)] bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] rounded-lg transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 text-sm font-bold text-[var(--on-primary)] bg-[var(--primary-dark)] hover:bg-[var(--primary)] shadow-[0_4px_12px_rgba(0,25,66,0.3)] rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </footer>
          </form>
        </FormProvider>
      </aside>
    </>
  );
}
