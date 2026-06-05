import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getHighestDashboardRoleLabel } from '@/lib/auth/dashboard-access';
import AppShell from '@/components/layout/AppShell';
import type { NavItem } from '@/components/layout/Sidebar';

const NAV_ITEMS: NavItem[] = [
  // Top-level
  { label: 'Dashboard', icon: 'grid_view', href: '/dashboard' },

  // Foundation Setup — Module 1 screens (screen-spec.md §Screen 0 sidebar)
  {
    label: 'Org Hierarchy',
    icon: 'schema',
    href: '/admin/foundation/org',
    section: 'Foundation Setup',
  },
  {
    label: 'Employees',
    icon: 'table_rows',
    href: '/admin/foundation/employees',
    section: 'Foundation Setup',
    subItems: [
      {
        label: 'Bulk Import',
        href: '/admin/foundation/employees/import',
      },
    ],
  },
  {
    label: 'Job Level & Designation',
    icon: 'layers',
    href: '/admin/foundation/job-levels',
    section: 'Foundation Setup',
  },
  { label: 'Cycles', icon: 'sync', href: '/admin/foundation/cycles', section: 'Foundation Setup' },

  // System Settings — IT Administrator only
  {
    label: 'Storage',
    icon: 'database',
    href: '/admin/settings/storage',
    section: 'System Settings',
  },
];

const BOTTOM_ITEMS: NavItem[] = [{ label: 'Help', icon: 'help', href: '/help' }];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userRoleLabel = getHighestDashboardRoleLabel(session.user.roles, session.user.groups);

  return (
    <AppShell
      navItems={NAV_ITEMS}
      bottomItems={BOTTOM_ITEMS}
      showSignOut
      user={session.user}
      userRoleLabel={userRoleLabel}
    >
      {children}
    </AppShell>
  );
}
