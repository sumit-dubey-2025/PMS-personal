import Sidebar, { NavItem } from './Sidebar';
import AppHeader, { UserProfile } from './AppHeader';

interface AppShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  bottomItems?: NavItem[];
  showSignOut?: boolean;
  user?: UserProfile;
  userRoleLabel?: string;
}

/**
 * AppShell — shared authenticated page skeleton.
 *
 * Renders the full-height sidebar + scrollable main content area.
 * Auth/session logic stays in each route-group layout — this component
 * is purely structural.
 *
 * Usage:
 *   <AppShell navItems={NAV_ITEMS} bottomItems={BOTTOM_ITEMS} showSignOut>
 *     {children}
 *   </AppShell>
 */
export default function AppShell({
  children,
  navItems,
  bottomItems,
  showSignOut,
  user,
  userRoleLabel,
}: AppShellProps) {
  return (
    <div className="bg-background font-body flex min-h-screen">
      <Sidebar navItems={navItems} bottomItems={bottomItems} showSignOut={showSignOut} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={user} userRoleLabel={userRoleLabel} />
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
