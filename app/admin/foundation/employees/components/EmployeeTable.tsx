'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircleFilled, Person } from '@/components/ui/Icons';
import type { Employee } from '@/types/employee';
import { resolveRoleFamily, resolveJobLevel } from '@/lib/lookups';
import Image from 'next/image';

// ─── Sub-components ───────────────────────────────────────────────────────────



function formatEmploymentType(type: string | null): string {
  if (!type) return '—';
  const map: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contractor: 'Contract',
    intern: 'Intern',
    Intern: 'Intern',
    Permanent: 'Permanent',
    Contract: 'Contract',
  };
  return map[type] ?? type;
}
const normalizeStatus = (status?: string | null) => {
  if (!status) return '';

  return status
    .toLowerCase()
    .replace(/\s+/g, '_'); // "On Leave" → "on_leave"
};
/** Status badge — soft-tint approach (design.md §5) */
function StatusBadge({ status }: { status: string | null }) {
  type Config = { label: string; wrapperCn: string; dotCn: string };

  // ✅ Normalize API/UI values
  const normalizeStatus = (value?: string | null) => {
    if (!value) return '';

    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_'); // "On Leave" → "on_leave"
  };

  const config: Record<string, Config> = {
    active: {
      label: 'Active',
      wrapperCn: 'bg-tertiary-fixed/60 text-on-tertiary-fixed-variant',
      dotCn: 'bg-secondary',
    },
    on_leave: {
      label: 'On Leave',
      wrapperCn: 'bg-error-container/70 text-on-error-container',
      dotCn: 'bg-warning',
    },
    inactive: {
      label: 'Inactive',
      wrapperCn: 'bg-surface-container-high text-on-surface-variant',
      dotCn: 'bg-outline',
    },
  };

  const normalized = normalizeStatus(status);

  const { label, wrapperCn, dotCn } = config[normalized] ?? {
    label: status ?? 'Unknown',
    wrapperCn: 'bg-surface-container text-on-surface-variant',
    dotCn: 'bg-outline',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-bold ${wrapperCn}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotCn}`} />
      {label}
    </span>
  );
}

/** Reporting badge derived from secondaryManagers */
function ReportingBadge({ employee }: { employee: Employee }) {
  const matrixCount = employee.secondaryManagers?.length ?? 0;
  const isMatrix = matrixCount > 0;

  return (
    <div className="flex items-center gap-2">
      <CheckCircleFilled size={18} className="text-secondary shrink-0" aria-label="Synced" />
      {isMatrix ? (
        <span className="bg-primary-fixed text-on-primary-fixed-variant rounded-md px-2 py-[3px] text-[10px] font-bold uppercase">
          Matrix {matrixCount}:1
        </span>
      ) : (
        <span className="bg-outline-variant/25 text-on-surface-variant rounded-md px-2 py-[3px] text-[10px] font-bold uppercase">
          Direct
        </span>
      )}
    </div>
  );
}

/** Avatar placeholder */
function AvatarPlaceholder({ highlighted }: { highlighted?: boolean }) {
  return (
    <div
      className={[
        'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full',
        highlighted
          ? 'border-secondary/25 bg-surface-container-high border-2'
          : 'bg-surface-container-highest',
      ].join(' ')}
    >
      <Person size={20} className="text-on-surface-variant" />
    </div>
  );
}

// ─── Vertical dots icon ────────────────────────────────────────────────────────

function DotsVerticalIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

// ─── Context menu SVG icons ────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function IconDelete() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <path d="M20.54 5.23l-1.39-1.68A1.51 1.51 0 0 0 18 3H6a1.51 1.51 0 0 0-1.15.55L3.46 5.23A2 2 0 0 0 3 6.5V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.5a2 2 0 0 0-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" />
    </svg>
  );
}

function IconActivate() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function IconDeactivate() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  );
}

// ─── Context menu items ────────────────────────────────────────────────────────

type MenuAction = 'edit' | 'delete' | 'archive' | 'activate' | 'deactivate';

interface MenuItem {
  action: MenuAction;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
  dividerBefore?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { action: 'edit', label: 'Edit', icon: <IconEdit /> },
  { action: 'delete', label: 'Delete', icon: <IconDelete />, danger: true },
  { action: 'archive', label: 'Archive', icon: <IconArchive />, dividerBefore: true },
  { action: 'activate', label: 'Activate', icon: <IconActivate /> },
  { action: 'deactivate', label: 'Deactivate', icon: <IconDeactivate /> },
];

// ─── Row context menu ──────────────────────────────────────────────────────────

interface RowMenuProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onAction?: (action: MenuAction, employee: Employee) => void;
}

function RowMenu({ employee, onEdit, onAction }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Approx height of the fully-expanded menu (5 items + separator + padding)
  const MENU_HEIGHT = 220;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open]);

  function toggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    // Decide whether to flip upward before opening
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < MENU_HEIGHT);
    }
    setOpen(true);
  }

  function handleItem(item: MenuItem) {
    setOpen(false);
    if (item.action === 'edit') {
      onEdit(employee);
    } else {
      onAction?.(item.action, employee);
    }
  }

  // Position class: open upward when near the bottom of the viewport
  const dropdownPos = openUpward
    ? 'bottom-full mb-1' // opens above the trigger
    : 'top-full mt-1'; // opens below the trigger (default)

  return (
    <div ref={wrapRef} className="relative flex justify-end">
      {/* Trigger — vertical dots */}
      <button
        ref={btnRef}
        onClick={toggleOpen}
        aria-label={`Actions for ${employee.name}`}
        className={`rounded-md p-2 transition-colors ${open
          ? 'bg-surface-container text-on-surface'
          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
      >
        <DotsVerticalIcon size={18} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute right-0 ${dropdownPos} border-outline-variant/20 bg-surface-container-lowest shadow-ambient-lifted z-50 w-44 rounded-xl border py-1.5`}
          style={{ backdropFilter: 'blur(20px)' }}
        >
          {MENU_ITEMS.map((item) => (
            <div key={item.action}>
              {/* Separator before grouped actions */}
              {item.dividerBefore && (
                <div className="border-outline-variant/20 mx-3 my-1.5 border-t" />
              )}

              <button
                onClick={() => handleItem(item)}
                className={`flex w-full items-center gap-3 px-3.5 py-2 text-sm transition-colors ${item.danger
                  ? 'text-error hover:bg-error-container/30'
                  : 'text-on-surface hover:bg-surface-container-low'
                  }`}
              >
                <span
                  className={`flex-none ${item.danger ? 'text-error' : 'text-on-surface-variant'}`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmployeeTableProps {
  employees: Employee[];
  totalCount: number | null;
  isFetching: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  onEdit: (employee: Employee) => void;
  onAction?: (action: MenuAction, employee: Employee) => void;
}

// ─── EmployeeTable ────────────────────────────────────────────────────────────

export default function EmployeeTable({
  employees,
  totalCount,
  isFetching,
  hasNextPage,
  fetchNextPage,
  onEdit,
  onAction,
}: EmployeeTableProps) {
  return (
    <div className="bg-surface-container-lowest shadow-ambient rounded-xl">
      <table className="w-full border-collapse text-left">
        {/* ── Header ── */}
        <thead>
          <tr className="bg-surface-container-low">
            {(['Full Name', 'Dept / Role', 'Level & Type', 'Status', 'Reporting'] as const).map(
              (col) => (
                <th
                  key={col}
                  className="text-outline px-6 py-[14px] text-[10px] font-bold tracking-[0.06em] uppercase"
                >
                  {col}
                </th>
              ),
            )}
            {/* No "Actions" header — just a narrow gutter for the ⋮ button */}
            <th className="w-12 px-3 py-[14px]" aria-label="Row actions" />
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {employees.map((emp, idx) => {
            const isFirst = idx === 0;
            return (
              <tr
                key={emp.id}
                className={[
                  'group border-outline-variant/10 hover:bg-surface-container-low/40 border-t transition-colors',
                  isFirst ? 'bg-secondary/[0.03]' : 'bg-surface-container-lowest',
                ].join(' ')}
              >
                {/* Full Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {emp.profilePhotoUrl ? (
                      <Image
                        src={emp.profilePhotoUrl}
                        alt={emp.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover shrink-0"
                        unoptimized
                      />
                    ) : (
                      <AvatarPlaceholder highlighted={isFirst} />
                    )}
                    <div className="min-w-0">
                      <p className="text-primary text-sm font-bold">{emp.name}</p>
                      <p className="text-on-surface-variant mt-0.5 text-xs">{emp.email}</p>
                    </div>
                  </div>
                </td>

                {/* Dept / Role */}

                <td className="px-6 py-4">
                  <p className="text-on-surface text-sm font-semibold">
                    {emp.department?.name ?? emp.department?.id ?? '—'}
                  </p>
                  <p className="text-on-surface-variant mt-0.5 text-xs">
                    {/* {emp.roleFamily?.name ?? emp.roleFamily?.id ?? ''} */}
                    {resolveRoleFamily(emp.roleFamily?.id)}
                  </p>
                </td>

                {/* Level & Type */}
                <td className="px-6 py-4">
                  <span className="bg-surface-container text-on-surface rounded-md px-2 py-[3px] text-xs font-medium">
                    {/* {emp.jobLevel?.label ?? emp.jobLevel?.code ?? '—'} */}
                    {resolveJobLevel(emp.jobLevel?.id)}
                  </span>
                  <p className="text-outline mt-1.5 text-[10px] font-medium">
                    {formatEmploymentType(emp.employmentType)}
                  </p>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <StatusBadge status={emp.status} />
                </td>

                {/* Reporting */}
                <td className="px-6 py-4">
                  <ReportingBadge employee={emp} />
                </td>

                {/* ⋮ Context menu */}
                <td className="px-3 py-4">
                  <RowMenu employee={emp} onEdit={onEdit} onAction={onAction} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Footer ── */}
      <div className="border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between border-t px-6 py-4">
        <p className="text-on-surface-variant text-xs">
          {employees.length.toLocaleString()} of{' '}
          {totalCount !== null ? totalCount.toLocaleString() : '…'} employees
        </p>

        {hasNextPage && (
          <button
            onClick={fetchNextPage}
            disabled={isFetching}
            className="border-outline-variant/25 bg-surface-container-lowest text-primary hover:border-outline-variant/50 hover:bg-surface-container-low rounded-md border px-4 py-1.5 text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40"
          >
            {isFetching ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
}
