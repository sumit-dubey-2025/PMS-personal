import type { Metadata } from 'next';
import { GlassCard, MicrosoftLoginButton } from '@/components/ui';
import { signInWithMicrosoft } from '@/app/actions/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; returnUrl?: string; returnurl?: string }>;
}) {
  const { callbackUrl, returnUrl, returnurl } = await searchParams;
  const destination = returnUrl || returnurl || callbackUrl;
  const signInAction = signInWithMicrosoft.bind(null, destination);

  return (
    <GlassCard>
      <div className="mb-10 text-center">
        <h1 className="font-headline text-primary mb-3 text-3xl font-extrabold tracking-tight">
          Welcome Back
        </h1>
        <p className="font-body text-on-surface-variant mx-auto max-w-sm text-sm leading-relaxed">
          Empowering Performance through Insightful Data
        </p>
      </div>

      {/* Microsoft CTA */}
      <form action={signInAction}>
        <MicrosoftLoginButton type="submit" />
      </form>

      {/* Value Prop */}
      <div className="border-outline-variant/20 mt-10 border-t pt-10">
        <p className="font-body text-on-surface-variant text-center text-xs leading-relaxed">
          A high-performance HR ecosystem designed for the modern enterprise. Securely sign in using
          your corporate credentials via Microsoft Entra ID.
        </p>
      </div>

      {/* Tonal Indicator of Security */}
      <div className="bg-surface-container-low mt-8 flex items-center justify-center gap-2 rounded-full px-4 py-1.5">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-secondary"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span className="text-secondary-dark font-body text-[10px] font-bold tracking-widest uppercase">
          Enterprise Secured
        </span>
      </div>
    </GlassCard>
  );
}
