// ─── Role Framework Types ──────────────────────────────────────────────────────
// These types define the data shapes shared between UI components and hooks.
// Backend dev: update lib/api/roles.ts to fetch real data — these types stay.

export type RoleFamilyStatus = 'Active' | 'Archived';

export interface RoleFamily {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  description: string;
  /** Min job level code e.g. L1 */
  minLevelCode: string;
  /** Max job level code e.g. L7 */
  maxLevelCode: string;
  /** IDs of all assigned job levels (derived from min→max range) */
  jobLevelIds?: string[];
  /** Material Symbols icon name for display */
  icon: string;
}

export type JobLevelBand = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8';

export interface JobLevel {
  id: string;
  name: string;
  code: string;
  order: number;
  band: JobLevelBand;
  track: string;
  salaryMin: number;
  salaryMax: number;
}

export type CompetencyCategory = 'Technical' | 'Leadership' | 'Core' | 'Functional';
export type CompetencyStatus = 'Active' | 'Deprecated';

export interface Competency {
  id: string;
  name: string;
  code: string;
  category: CompetencyCategory;
  status: CompetencyStatus;
}

export interface MatrixCell {
  proficiency: number | null;
  weight: number | null;
}

export type MatrixData = Record<string, MatrixCell>;

export interface MatrixColumn {
  roleFamilyId: string;
  roleFamilyName: string;
  jobLevelId: string;
  jobLevelName: string;
  levelBand: string;
}

// ─── Request types ─────────────────────────────────────────────────────────────

export interface CreateRoleFamilyRequest {
  name: string;
  code: string;
  isActive: boolean;
  description: string;
  minLevelCode: string;
  maxLevelCode: string;
  icon: string;
}

export type PatchRoleFamilyRequest = Partial<CreateRoleFamilyRequest>;

export interface CloneRoleFamilyRequest {
  newName: string;
  newCode: string;
}

export interface CreateJobLevelRequest {
  name: string;
  code: string;
  order: number;
  band: JobLevelBand;
  track: string;
  salaryMin: number;
  salaryMax: number;
}

export type PatchJobLevelRequest = Partial<CreateJobLevelRequest>;

export interface SaveMatrixRequest {
  matrix: MatrixData;
}
