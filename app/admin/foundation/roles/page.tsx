import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Role Framework | PulsePerform',
  description: 'Define and manage job roles and role families.',
};

export default function RoleFrameworkPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Role Framework</h1>
        <p className="mt-1 text-sm font-normal text-[var(--color-on-surface-muted)]">
          Define and manage job roles and role families across the organisation.
        </p>
      </div>
      <div className="rounded-xl bg-[var(--color-surface-lowest)] p-12 text-center shadow-sm">
        <span className="material-symbols-outlined text-5xl text-[var(--color-on-surface-muted)]">
          layers
        </span>
        <p className="mt-4 text-base font-semibold text-[var(--color-on-surface)]">
          Coming Soon
        </p>
        <p className="mt-1 text-sm font-normal text-[var(--color-on-surface-muted)]">
          Role Framework configuration is under development.
        </p>
      </div>
    </div>
  );
}
