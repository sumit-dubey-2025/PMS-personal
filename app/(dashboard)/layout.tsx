import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getDashboardAccess, getHighestDashboardRoleLabel } from '@/lib/auth/dashboard-access';
import AppShell from '../../components/layout/AppShell';
import type { NavItem } from '../../components/layout/Sidebar';

function getDashboardNavItems(hasAdmin: boolean): NavItem[] {
  const navItems: NavItem[] = [{ label: 'Dashboard', icon: 'grid_view', href: '/dashboard' }];

  if (!hasAdmin) {
    return navItems;
  }

  navItems.push(
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
    },
    {
      label: 'Job Level & Designation',
      icon: 'layers',
      href: '/admin/foundation/job-levels',
      section: 'Foundation Setup',
    },
    {
      label: 'Cycles',
      icon: 'sync',
      href: '/admin/foundation/cycles',
      section: 'Foundation Setup',
    },
    {
      label: 'Storage',
      icon: 'database',
      href: '/admin/settings/storage',
      section: 'System Settings',
    },
  );

  return navItems;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { hasAdmin } = getDashboardAccess(session);
  const navItems = getDashboardNavItems(hasAdmin);
  const userRoleLabel = getHighestDashboardRoleLabel(session.user.roles, session.user.groups);

  return (
    <AppShell
      navItems={navItems}
      bottomItems={[]}
      showSignOut={false}
      user={session.user}
      userRoleLabel={userRoleLabel}
    >
      {children}
    </AppShell>
  );
}
