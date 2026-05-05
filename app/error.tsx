'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-on-surface text-2xl font-semibold">Something went wrong</h2>
      <p className="text-on-surface-variant text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="btn-primary-gradient text-on-primary rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
