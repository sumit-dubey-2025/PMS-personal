// ─── Role Framework API ────────────────────────────────────────────────────────
// TODO: Replace mock data with real fetch() calls when backend endpoints are ready.

import type {
  RoleFamily,
  JobLevel,
  Competency,
  MatrixData,
  MatrixColumn,
  CreateRoleFamilyRequest,
  PatchRoleFamilyRequest,
  CloneRoleFamilyRequest,
  CreateJobLevelRequest,
  PatchJobLevelRequest,
  SaveMatrixRequest,
} from '@/types/jobLevel';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ROLE_FAMILIES: RoleFamily[] = [
  {
    id: 'rf-1',
    name: 'Engineering',
    code: 'RF-ENG-001',
    isActive: true,
    description: 'Software development, systems architecture, infrastructure, and technical leadership across all product domains.',
    minLevelCode: 'L1',
    maxLevelCode: 'L7',
    icon: 'code',
  },
  {
    id: 'rf-2',
    name: 'Sales',
    code: 'RF-SAL-002',
    isActive: true,
    description: 'Revenue generation, account management, partnership development and enterprise sales.',
    minLevelCode: 'L1',
    maxLevelCode: 'L4',
    icon: 'trending_up',
  },
  {
    id: 'rf-3',
    name: 'Operations',
    code: 'RF-OPS-003',
    isActive: true,
    description: 'Logistics management, supply chain optimization, facility management, and operational excellence.',
    minLevelCode: 'L1',
    maxLevelCode: 'L5',
    icon: 'precision_manufacturing',
  },
];

const MOCK_JOB_LEVELS: JobLevel[] = [
  { id: 'jl-1', name: 'Analyst',          code: 'JC-L1', order: 1, band: 'L1', track: 'Core Track',       salaryMin: 45000,  salaryMax: 65000  },
  { id: 'jl-2', name: 'Associate',         code: 'JC-L2', order: 2, band: 'L2', track: 'Core Track',       salaryMin: 60000,  salaryMax: 85000  },
  { id: 'jl-3', name: 'Consultant',        code: 'JC-L3', order: 3, band: 'L3', track: 'Core Track',       salaryMin: 95000,  salaryMax: 125000 },
  { id: 'jl-4', name: 'Senior Consultant', code: 'JC-L4', order: 4, band: 'L4', track: 'Specialist Track', salaryMin: 120000, salaryMax: 160000 },
  { id: 'jl-5', name: 'Manager',           code: 'JC-L5', order: 5, band: 'L5', track: 'Leadership Track', salaryMin: 145000, salaryMax: 185000 },
  { id: 'jl-6', name: 'Director',          code: 'JC-L6', order: 6, band: 'L6', track: 'Executive Track',  salaryMin: 180000, salaryMax: 240000 },
  { id: 'jl-7', name: 'Vice President',    code: 'JC-L7', order: 7, band: 'L7', track: 'Executive Track',  salaryMin: 230000, salaryMax: 320000 },
];

const MOCK_COMPETENCIES: Competency[] = [
  { id: 'c-1', name: 'System Architecture',     code: 'C-TECH-01',    category: 'Technical',  status: 'Active'     },
  { id: 'c-2', name: 'Strategic Communication', code: 'C-LEAD-05',    category: 'Leadership', status: 'Active'     },
  { id: 'c-3', name: 'Data Analysis',           code: 'C-TECH-03',    category: 'Technical',  status: 'Active'     },
  { id: 'c-4', name: 'Stakeholder Management',  code: 'C-LEAD-02',    category: 'Leadership', status: 'Active'     },
  { id: 'c-5', name: 'Legacy Data Modeling',    code: 'C-TECH-09-OLD',category: 'Technical',  status: 'Deprecated' },
];

const MOCK_MATRIX: MatrixData = {
  'c-1_rf-1_jl-3': { proficiency: 3, weight: 25 },
  'c-1_rf-1_jl-4': { proficiency: 4, weight: 30 },
  'c-2_rf-1_jl-3': { proficiency: 2, weight: 15 },
  'c-2_rf-1_jl-4': { proficiency: 3, weight: 20 },
  'c-2_rf-2_jl-4': { proficiency: 5, weight: 40 },
};

const MOCK_MATRIX_COLUMNS: MatrixColumn[] = [
  { roleFamilyId: 'rf-1', roleFamilyName: 'Engineering', jobLevelId: 'jl-3', jobLevelName: 'Senior Engineer',  levelBand: 'L3' },
  { roleFamilyId: 'rf-1', roleFamilyName: 'Engineering', jobLevelId: 'jl-4', jobLevelName: 'Staff Engineer',   levelBand: 'L4' },
  { roleFamilyId: 'rf-2', roleFamilyName: 'Sales',       jobLevelId: 'jl-4', jobLevelName: 'Account Director', levelBand: 'L4' },
];

function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((res) => setTimeout(() => res(data), ms));
}

// ─── Role Families ─────────────────────────────────────────────────────────────

let roleFamilies = [...MOCK_ROLE_FAMILIES];

export async function listRoleFamilies(): Promise<RoleFamily[]> {
  return delay([...roleFamilies]);
}

export async function createRoleFamily(data: CreateRoleFamilyRequest): Promise<RoleFamily> {
  const newFamily: RoleFamily = { id: `rf-${Date.now()}`, ...data };
  roleFamilies = [...roleFamilies, newFamily];
  return delay(newFamily);
}

export async function patchRoleFamily(id: string, data: PatchRoleFamilyRequest): Promise<RoleFamily> {
  roleFamilies = roleFamilies.map((rf) => (rf.id === id ? { ...rf, ...data } : rf));
  return delay(roleFamilies.find((rf) => rf.id === id)!);
}

export async function cloneRoleFamily(id: string, data: CloneRoleFamilyRequest): Promise<RoleFamily> {
  const source = roleFamilies.find((rf) => rf.id === id);
  if (!source) throw new Error('Role family not found');
  const cloned: RoleFamily = {
    ...source,
    id: `rf-${Date.now()}`,
    name: data.newName,
    code: data.newCode,
    isActive: true,
  };
  roleFamilies = [...roleFamilies, cloned];
  return delay(cloned);
}

export async function deleteRoleFamily(id: string): Promise<void> {
  roleFamilies = roleFamilies.filter((rf) => rf.id !== id);
  return delay(undefined);
}

export async function archiveRoleFamily(id: string): Promise<RoleFamily> {
  roleFamilies = roleFamilies.map((rf) =>
    rf.id === id ? { ...rf, isActive: false } : rf,
  );
  return delay(roleFamilies.find((rf) => rf.id === id)!);
}

// ─── Job Levels ────────────────────────────────────────────────────────────────

let jobLevels = [...MOCK_JOB_LEVELS];

export async function listJobLevels(): Promise<JobLevel[]> {
  return delay([...jobLevels]);
}

export async function createJobLevel(data: CreateJobLevelRequest): Promise<JobLevel> {
  const newLevel: JobLevel = { id: `jl-${Date.now()}`, ...data };
  jobLevels = [...jobLevels, newLevel];
  return delay(newLevel);
}

export async function patchJobLevel(id: string, data: PatchJobLevelRequest): Promise<JobLevel> {
  jobLevels = jobLevels.map((jl) => (jl.id === id ? { ...jl, ...data } : jl));
  return delay(jobLevels.find((jl) => jl.id === id)!);
}

export async function reorderJobLevels(orderedIds: string[]): Promise<void> {
  jobLevels = jobLevels.map((jl) => ({
    ...jl,
    order: orderedIds.indexOf(jl.id) + 1,
  }));
  return delay(undefined);
}

export async function archiveJobLevel(id: string): Promise<void> {
  jobLevels = jobLevels.filter((jl) => jl.id !== id);
  return delay(undefined);
}

// ─── Competencies ──────────────────────────────────────────────────────────────

export async function listCompetencies(): Promise<Competency[]> {
  return delay([...MOCK_COMPETENCIES]);
}

// ─── Competency Matrix ─────────────────────────────────────────────────────────

let matrixData: MatrixData = { ...MOCK_MATRIX };
let matrixColumns: MatrixColumn[] = [...MOCK_MATRIX_COLUMNS];

export async function getMatrix(): Promise<{ matrix: MatrixData; columns: MatrixColumn[] }> {
  return delay({ matrix: { ...matrixData }, columns: [...matrixColumns] });
}

export async function saveMatrix(data: SaveMatrixRequest): Promise<void> {
  matrixData = { ...data.matrix };
  return delay(undefined);
}

export async function updateMatrixColumns(columns: MatrixColumn[]): Promise<void> {
  matrixColumns = [...columns];
  return delay(undefined);
}

// ─── Designations ──────────────────────────────────────────────────────────────

import type { Designation, CreateDesignationRequest, PatchDesignationRequest } from '@/types/jobLevel';

const MOCK_DESIGNATIONS: Designation[] = [
  { id: 'des-1',  title: 'Executive / C-Suite',    uid: 'UID-00101', associatedLevelId: 'jl-7', department: 'Leadership',          employeeCount: 4  },
  { id: 'des-2',  title: 'Vice President',          uid: 'UID-00102', associatedLevelId: 'jl-6', department: 'Leadership',          employeeCount: 6  },
  { id: 'des-3',  title: 'Director of Engineering', uid: 'UID-00103', associatedLevelId: 'jl-6', department: 'Technology',          employeeCount: 3  },
  { id: 'des-4',  title: 'Senior Product Designer', uid: 'UID-94021', associatedLevelId: 'jl-3', department: 'Product & Design',    employeeCount: 24 },
  { id: 'des-5',  title: 'Head of Engineering',     uid: 'UID-11203', associatedLevelId: 'jl-5', department: 'Technology',          employeeCount: 3  },
  { id: 'des-6',  title: 'Software Engineer II',    uid: 'UID-00561', associatedLevelId: 'jl-2', department: 'Engineering',         employeeCount: 82 },
  { id: 'des-7',  title: 'HR Business Partner',     uid: 'UID-88122', associatedLevelId: 'jl-3', department: 'Human Resources',     employeeCount: 12 },
  { id: 'des-8',  title: 'Senior Manager',          uid: 'UID-00201', associatedLevelId: 'jl-5', department: 'Operations',          employeeCount: 5  },
  { id: 'des-9',  title: 'Finance Analyst',         uid: 'UID-00301', associatedLevelId: 'jl-1', department: 'Finance',             employeeCount: 18 },
  { id: 'des-10', title: 'Marketing Lead',          uid: 'UID-00401', associatedLevelId: 'jl-4', department: 'Marketing',           employeeCount: 9  },
  { id: 'des-11', title: 'Legal Counsel',           uid: 'UID-00501', associatedLevelId: 'jl-5', department: 'Legal',               employeeCount: 2  },
  { id: 'des-12', title: 'Data Scientist',          uid: 'UID-00601', associatedLevelId: 'jl-3', department: 'Data & Analytics',    employeeCount: 11 },
];

let designations = [...MOCK_DESIGNATIONS];

export async function listDesignations(): Promise<Designation[]> {
  return delay([...designations]);
}

export async function createDesignation(data: CreateDesignationRequest): Promise<Designation> {
  const uid = `UID-${String(Math.floor(10000 + Math.random() * 90000))}`;
  const newDes: Designation = { id: `des-${Date.now()}`, uid, employeeCount: 0, ...data };
  designations = [...designations, newDes];
  return delay(newDes);
}

export async function patchDesignation(id: string, data: PatchDesignationRequest): Promise<Designation> {
  designations = designations.map((d) => (d.id === id ? { ...d, ...data } : d));
  return delay(designations.find((d) => d.id === id)!);
}

export async function deleteDesignation(id: string): Promise<void> {
  designations = designations.filter((d) => d.id !== id);
  return delay(undefined);
}

export async function deleteJobLevel(id: string): Promise<void> {
  jobLevels = jobLevels.filter((jl) => jl.id !== id);
  return delay(undefined);
}
