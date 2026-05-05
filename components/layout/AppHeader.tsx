'use client';

import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import styles from './AppHeader.module.css';

export interface UserProfile {
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

interface AppHeaderProps {
  user?: UserProfile;
  userRoleLabel?: string;
}

// ─── Route → display title mapping ───────────────────────────────────────────
// Longest-prefix match: more specific routes must come first in the entries
// used for matching so they beat shorter prefixes.
const PAGE_TITLE_MAP: [string, string][] = [
  // ── Foundation ──────────────────────────────────────────────────────────────
  ['/admin/foundation/employees', 'Employee Registry'],
  ['/admin/foundation/org',       'Org Hierarchy'],
  ['/admin/foundation',           'Foundation'],
  // ── Settings ────────────────────────────────────────────────────────────────
  ['/admin/settings/storage', 'Storage Configuration'],
  ['/admin/settings',         'System Configuration'],
  // ── Catch-alls ──────────────────────────────────────────────────────────────
  ['/admin/security', 'Security'],
  ['/admin/logs', 'Logs'],
  ['/admin/foundation/org', 'Org Hierarchy'],
  ['/admin', 'Admin'],
  ['/dashboard', 'Dashboard'],
  ['/help', 'Help'],
];

function getPageTitle(pathname: string): string {
  const match = PAGE_TITLE_MAP.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/'),
  );
  return match ? match[1] : 'PulsePerform';
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── AppHeader ────────────────────────────────────────────────────────────────
// Design.md §2:
//   Header surface → Background (#F3F3F6) — no tonal lift, stays flush with page.
//   Dropdown → Glassmorphism: bg-surface-container-lowest/80 + backdrop-blur-[20px]
//   Separator → Ghost Border: outline-variant at 20% opacity
export default function AppHeader({ user, userRoleLabel = 'Employee' }: AppHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const title = getPageTitle(pathname);
  const initials = getInitials(user?.name);
  const hasImage = Boolean(user?.image);

  return (
    <header className={`${styles.header} bg-background border-outline-variant/20 border-b`}>
      {/* ── Page title ─────────────────────────────────────────────── */}
      <h1 className={styles.title}>{title}</h1>

      {/* ── Profile pill ───────────────────────────────────────────── */}
      <div className={styles.profileContainer} ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={styles.profileButton}
          aria-label="Profile menu"
        >
          {/* Avatar: photo or initials */}
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user!.image!}
              alt={user?.name ?? 'Profile photo'}
              className={styles.avatar}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              <span className={styles.initials}>{initials}</span>
            </div>
          )}

          {/* Display name and role — hidden on very small viewports */}
          <div className="hidden flex-col items-start justify-center sm:flex">
            <span className={styles.name}>{user?.name ?? 'User'}</span>
            <span className={styles.role}>{userRoleLabel}</span>
          </div>

          {/* Chevron — rotates 180° when open */}
          <span
            className={`material-symbols-rounded ${styles.chevron} ${open ? styles.chevronOpen : styles.chevronClosed}`}
          >
            expand_more
          </span>
        </button>

        {/* ── Dropdown — Glassmorphism (design.md §2 Glass & Gradient) ── */}
        {open && (
          <div className={styles.dropdown}>
            {/* User identity block */}
            <div className={styles.identityBlock}>
              {/* Avatar (larger in dropdown) */}
              {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user!.image!}
                  alt={user?.name ?? 'Profile photo'}
                  className={styles.avatarLarge}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={styles.avatarLargeFallback}>
                  <span className={styles.initialsLarge}>{initials}</span>
                </div>
              )}
              {/* Name + email */}
              <div className={styles.identityText}>
                <p className={styles.identityName}>{user?.name ?? 'User'}</p>
                <p className={styles.identityRole}>{userRoleLabel}</p>
                {user?.email && <p className={styles.identityEmail}>{user.email}</p>}
              </div>
            </div>

            {/* Ghost divider (design.md §2 Ghost Border: outline-variant/20) */}
            <div className={styles.divider} />

            {/* Sign out */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={styles.signOut}
            >
              <span className={`material-symbols-rounded ${styles.signOutIcon}`}>logout</span>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
