'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-surface-container-lowest/85 border-outline-variant/20 shadow-ambient sticky top-0 z-40 border-b backdrop-blur-[20px]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/PulsePerform.png" alt="PulsePerform" className="h-8 w-auto object-contain" />
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          <li>
            <Link
              href="/dashboard"
              className="font-body text-on-surface-variant hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="btn-primary-gradient font-body text-on-primary rounded-lg px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
