'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

// ─── Public type ──────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  /** Must be a key present in the Material Symbols icon_names list in app/layout.tsx */
  icon: string;
  href: string;
  /** Optional section header label. Items sharing the same section are grouped under a header. */
  section?: string;
  /** Optional child navigation items */
  subItems?: { label: string; href: string }[];
}

interface SidebarProps {
  navItems: NavItem[];
  bottomItems?: NavItem[];
  /** Render a Sign-out button at the foot of the sidebar */
  showSignOut?: boolean;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
// Design.md: No background fill — inherits Background (#F3F3F6), light sidebar.
// Active: 4px left pill in Primary + Primary Container/15 row tint.
// Hover:  Surface Container Low (#EBEBEE) row tint.
// Logo:   On Surface (#212121) — on light surface, not dark.
export default function Sidebar({ navItems, bottomItems = [], showSignOut = false }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href || pathname.startsWith('/dashboard/')
      : pathname.startsWith(href);

  // Group navItems by section, preserving insertion order.
  // Items with no section are placed in a null group at the top.
  const groups: { section: string | null; items: NavItem[] }[] = [];
  for (const item of navItems) {
    const key = item.section ?? null;
    const last = groups[groups.length - 1];
    if (last && last.section === key) {
      last.items.push(item);
    } else {
      groups.push({ section: key, items: [item] });
    }
  }

  const renderNavLink = (item: NavItem) => {
    const isItemActive = isActive(item.href);
    const hasActiveSubItem = item.subItems?.some((sub) => isActive(sub.href));
    const isExpanded = isItemActive || hasActiveSubItem;

    return (
      <div key={item.label} className="flex flex-col">
        {isItemActive && !hasActiveSubItem ? (
          /* Active (no active subitem) */
          <Link
            href={item.href as Route}
            className="bg-primary-container/[0.15] text-on-surface relative flex items-center gap-3 py-2.5 pr-4 pl-5"
          >
            <span className="bg-primary absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full" />
            <span className="material-symbols-rounded text-primary text-[20px] leading-none">
              {item.icon}
            </span>
            <span className="font-body text-[13px] font-semibold tracking-wide">{item.label}</span>
          </Link>
        ) : (
          /* Inactive (or active but we show its subitems without the top-level main background) */
          <Link
            href={item.href as Route}
           className={cn(
              'flex items-center gap-3 py-2.5 pr-4 pl-5 transition-colors',
              isExpanded 
                ? 'text-on-surface font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
            )}
          >
            <span className="material-symbols-rounded text-[20px] leading-none">{item.icon}</span>
            <span className="font-body text-[13px] tracking-wide">{item.label}</span>
          </Link>
        )}

        {/* SubItems */}
        {item.subItems && isExpanded && (
          <div className="mt-0.5 mb-1 flex flex-col gap-0.5 pr-4 pl-12">
            {item.subItems.map((sub) => {
              const isSubActive = isActive(sub.href);
              return isSubActive ? (
                <Link
                  key={sub.label}
                  href={sub.href as Route}
                  className="bg-primary-container/[0.15] text-on-surface relative flex items-center rounded-md px-3 py-2"
                >
                  <span className="bg-primary absolute top-1/2 -left-2.5 h-4 w-1 -translate-y-1/2 rounded-r-full" />
                  <span className="font-body text-[12px] font-semibold tracking-wide">
                    {sub.label}
                  </span>
                </Link>
              ) : (
                <Link
                  key={sub.label}
                  href={sub.href as Route}
                  className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center rounded-md px-3 py-2 transition-colors"
                >
                  <span className="font-body text-[12px] font-medium tracking-wide">
                    {sub.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="border-outline-variant/30 flex min-h-screen w-56 shrink-0 flex-col border-r py-6">
      {/* Logo */}
      <div className="mb-8 px-5">
        <Link href={'/dashboard'} className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/PulsePerform.png" alt="PulsePerform" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      {/* Main nav — grouped by section */}
      <nav className="flex flex-1 flex-col gap-0">
        {groups.map(({ section, items }, groupIdx) => (
          <div key={section ?? `__top__${groupIdx}`} className={groupIdx > 0 ? 'mt-4' : ''}>
            {section && (
              <p className="font-body text-on-surface-variant/60 mb-1 px-5 text-[10px] font-semibold tracking-widest uppercase select-none">
                {section}
              </p>
            )}
            <div className="flex flex-col gap-0.5">{items.map(renderNavLink)}</div>
          </div>
        ))}
      </nav>

      {/* Bottom nav */}
      {(bottomItems.length > 0 || showSignOut) && (
        <div className="border-outline-variant/30 mt-4 flex flex-col gap-0.5 border-t pt-4">
          {bottomItems.map((item) => (
            <Link
              key={item.label}
              href={item.href as Route}
              className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center gap-3 py-2.5 pr-4 pl-5 transition-colors"
            >
              <span className="material-symbols-rounded text-[20px] leading-none">{item.icon}</span>
              <span className="font-body text-[13px] font-medium tracking-wide">{item.label}</span>
            </Link>
          ))}

          {showSignOut && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex w-full cursor-pointer items-center gap-3 py-2.5 pr-4 pl-5 transition-colors"
            >
              <span className="material-symbols-rounded text-[20px] leading-none">logout</span>
              <span className="font-body text-[13px] font-medium tracking-wide">Sign out</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
