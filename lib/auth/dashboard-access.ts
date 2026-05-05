import type { Session } from 'next-auth';

const IT_ADMIN_ROLE = process.env.PMS_IT_ADMINS_ROLE || 'ITAdmin';

function includesRole(roles: string[] | null | undefined, match: string): boolean {
  return (roles ?? []).some((role) => role.includes(match));
}

export function hasAdminDashboardAccess(
  roles: string[] | null | undefined,
  _groups: string[] | null | undefined,
): boolean {
  return includesRole(roles, 'Admin') || includesRole(roles, 'HR') || (roles ?? []).includes(IT_ADMIN_ROLE);
}

export function hasManagerDashboardAccess(roles: string[] | null | undefined): boolean {
  return includesRole(roles, 'Manager');
}

export function getHighestDashboardRole(
  roles: string[] | null | undefined,
  groups: string[] | null | undefined,
): 'HR Admin' | 'Manager' | 'Employee' {
  if (hasAdminDashboardAccess(roles, groups)) {
    return 'HR Admin';
  }

  if (hasManagerDashboardAccess(roles)) {
    return 'Manager';
  }

  return 'Employee';
}

export const getHighestDashboardRoleLabel = getHighestDashboardRole;

export function getDashboardAccess(session: Session) {
  const roles = session.user.roles ?? [];
  const groups = session.user.groups ?? [];

  return {
    hasAdmin: hasAdminDashboardAccess(roles, groups),
    hasManager: hasManagerDashboardAccess(roles),
    hasEmployee: true,
  };
}
