// ─── Role Family ──────────────────────────────────────────────────────────────

// Display name → SharePoint numeric ID (used on save)
export const ROLE_FAMILY_MAP: Record<string, number> = {
  'Project Manager': 1,
  'Architect':       2,
  'Developer':       3,
  'Team Lead':       4,
  'QA Lead':         5,
};

// SharePoint Family Code → Display name (used for reverse lookup)
export const ROLE_FAMILY_BY_CODE: Record<string, string> = {
  'RL-01': 'Project Manager',
  'RL-02': 'Architect',
  'RL-03': 'Developer',
  'RL-04': 'Team Lead',
  'RL-05': 'QA Lead',
};

// ─── Job Level ────────────────────────────────────────────────────────────────

// Display name → SharePoint numeric ID (used on save)
export const JOB_LEVEL_MAP: Record<string, number> = {
  'JobLevel1': 1,
  'JobLevel2': 2,
  'JobLevel3': 3,
};

// SharePoint numeric ID → Display name (used for reverse lookup)
export const JOB_LEVEL_BY_ID: Record<string, string> = {
  '1': 'JobLevel1',
  '2': 'JobLevel2',
    '3': 'JobLevel3',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export function resolveRoleFamily(code: string | null | undefined): string {
  return ROLE_FAMILY_BY_CODE[code ?? ''] ?? code ?? '—';
}

export function resolveJobLevel(id: string | null | undefined): string {
  return JOB_LEVEL_BY_ID[id ?? ''] ?? id ?? '—';
}