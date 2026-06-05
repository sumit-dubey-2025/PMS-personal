import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { GoalEditorForm } from '@/components/goals/GoalEditorForm';
import { ExternalIcon } from '@/components/ui/ExternalIcon';
import Link from 'next/link';

export const metadata: Metadata = { title: 'New Goal | PulsePerform' };

interface NewGoalPageProps {
  searchParams: Promise<{ cycleCode?: string }>;
}

export default async function NewGoalPage({ searchParams }: NewGoalPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const cycleCode =
    typeof params.cycleCode === 'string' && params.cycleCode.trim().length > 0
      ? params.cycleCode.trim()
      : null;

  // Do not default to a stale hard-coded cycle. Require an explicit cycle code.
  if (!cycleCode) {
    redirect('/dashboard/employee');
  }

  return (
    <div className="bg-surface mx-auto min-h-screen w-full max-w-4xl p-6 md:p-10">
      {/* Page header */}
      <div className="mb-8">
        <nav className="text-on-surface-variant font-body mb-4 flex items-center gap-2 text-xs">
          <Link href="/dashboard/employee" className="hover:text-on-surface transition-colors">
            Dashboard
          </Link>
          <ExternalIcon name="chevron_right" className="h-3.5 w-3.5" />
          <span className="text-on-surface">New Goal</span>
        </nav>

        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-on-surface text-2xl font-semibold tracking-tight">
            Create Individual Goal
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Cycle: <span className="text-on-surface font-medium">{cycleCode}</span>
            {' · '}
            Draft goals can be edited until submitted for approval.
          </p>
        </div>
      </div>

      {/* Editor form */}
      <GoalEditorForm cycleCode={cycleCode} />
    </div>
  );
}
