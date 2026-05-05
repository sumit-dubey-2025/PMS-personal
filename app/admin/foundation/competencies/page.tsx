import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competencies | PulsePerform',
  description: 'Define and manage competency frameworks.',
};

export default function CompetenciesPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Competencies</h1>
        <p className="mt-1 text-sm font-normal text-[var(--color-on-surface-muted)]">
          Define and manage competency frameworks for performance evaluation.
        </p>
      </div>
      <div className="rounded-xl bg-[var(--color-surface-lowest)] p-12 text-center shadow-sm">
        <span className="material-symbols-outlined text-5xl text-[var(--color-on-surface-muted)]">
          list_alt
        </span>
        <p className="mt-4 text-base font-semibold text-[var(--color-on-surface)]">
          Coming Soon
        </p>
        <p className="mt-1 text-sm font-normal text-[var(--color-on-surface-muted)]">
          Competency management is under development.
        </p>
      </div>
    </div>
  );
}
