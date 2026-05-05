import type { Metadata } from 'next';
import { Logo } from '@/components/ui';

export const metadata: Metadata = {
  title: {
    template: '%s | PulsePerform',
    default: 'Auth',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mesh font-body selection:bg-primary-fixed selection:text-on-primary-fixed relative flex min-h-screen flex-col">
      {/* Top Bar (Suppressed Nav, Only Logo) */}
      <header className="flex w-full items-center justify-center bg-transparent pt-12 pb-2">
        <Logo size="2xl" />
      </header>

      <main className="relative flex flex-grow flex-col items-center justify-start px-4 pt-4">
        {children}

        {/* Decorative Background Element */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2">
          <div className="from-primary/5 to-secondary-container/30 absolute inset-0 rounded-full bg-gradient-to-tr blur-3xl"></div>
        </div>
      </main>

      {/* Footer Component */}
      <footer className="fixed bottom-0 flex w-full flex-row justify-center bg-transparent px-4 pb-8"></footer>
    </div>
  );
}
