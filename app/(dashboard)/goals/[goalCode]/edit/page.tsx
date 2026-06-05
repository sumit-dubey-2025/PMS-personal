import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { GoalEditorForm } from '@/components/goals/GoalEditorForm';
import { ExternalIcon } from '@/components/ui/ExternalIcon';
import Link from 'next/link';

interface EditGoalPageProps {
  params: Promise<{ goalCode: string }>;
}

export async function generateMetadata({ params }: EditGoalPageProps): Promise<Metadata> {
  const { goalCode } = await params;
  return { title: `Edit Goal ${goalCode} | PulsePerform` };
}

export default async function EditGoalPage({ params }: EditGoalPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { goalCode } = await params;

  return (
    <div className="bg-surface mx-auto min-h-screen w-full max-w-4xl p-6 md:p-10">
      {/* Page header */}
      <div className="mb-8">
        <nav className="text-on-surface-variant font-body mb-4 flex items-center gap-2 text-xs">
          <Link href="/dashboard/employee" className="hover:text-on-surface transition-colors">
            Dashboard
          </Link>
          <ExternalIcon name="chevron_right" className="h-3.5 w-3.5" />
          <span className="text-on-surface">Edit Goal</span>
        </nav>

        <h1 className="font-headline text-on-surface text-2xl font-semibold tracking-tight">
          Edit Goal
        </h1>
      </div>

      {/* Editor form — fetches goal details client-side to ensure auth is forwarded */}
      <GoalEditorForm goalCode={goalCode} />
    </div>
  );
}
