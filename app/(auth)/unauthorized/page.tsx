import type { Metadata } from 'next';
import { GlassCard } from '@/components/ui';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Access Denied' };

export default function UnauthorizedPage() {
  return (
    <GlassCard className="text-center">
      <div className="bg-error-container/20 mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-error"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>

      <h1 className="font-headline text-primary mb-4 text-3xl font-extrabold tracking-tight">
        Access Restricted
      </h1>

      <p className="font-body text-on-surface-variant mx-auto mb-10 max-w-sm text-sm leading-relaxed">
        Your account does not have the necessary permissions to access this administrative area.
        Please contact IT Support if you believe this is an error.
      </p>

      <Link
        href="/dashboard"
        className="btn-primary-gradient text-on-primary focus-visible:ring-primary/50 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
      >
        Return to Dashboard
      </Link>

      <div className="border-outline-variant/20 mt-8 w-full border-t pt-8">
        <p className="text-on-surface-variant/60 text-[10px] font-bold tracking-widest uppercase">
          Required Group: PMS-IT-Admins
        </p>
      </div>
    </GlassCard>
  );
}
