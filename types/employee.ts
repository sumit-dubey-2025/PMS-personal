// ---------------------------------------------------------------------------
// Employee domain types — aligned to PulsePerform.Api EmployeeResponse
// ---------------------------------------------------------------------------

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';
export type EmploymentType = 'Full Time' | 'Part Time' | 'Contractor' | 'Intern';
//export type EmploymentType = 'Full_Time' | 'Part_Time' | 'Contractor'; 
//export type EmployeeStatus = 'Active' | 'Inactive' | 'On_Leave';

// ─── Nested value objects ─────────────────────────────────────────────────────

export interface DepartmentInfo {
  id: string;
  name: string | null;
  path: string | null;
}

export interface ManagerInfo {
  id: string;
  name: string | null;
}

export interface RoleFamilyInfo {
  id: string;
  name: string | null;
}

export interface JobLevelInfo {
  id: string;
  code: string | null;
  label: string | null;
}

export interface SecondaryManager {
  id: string;
  name: string | null;
  type: string | null;
  contributionWeight: number | null;
  startDate: string | null;
  endDate: string | null;
}

export interface ChangeHistoryEntry {
  timestamp: string;
  actorId: string | null;
  actorName: string | null;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
}
export interface EmployeeDepartment {
  id: string;
  name: string;
  path: string;
}
export interface EmployeeManager {
  id: string;
  name: string;
}
export interface EmployeeRoleFamily {
  id: string;
  name: string;
}
export interface EmployeeJobLevel {
  id: string;
  code: string;
  label: string;
}
export interface EmployeeListResponse {
  data: Employee[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
  };
}

// ─── Core entity ──────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  employeeCode: string | null;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  designation: string | null;
  department:  EmployeeDepartment | DepartmentInfo;
  primaryManager:EmployeeManager| ManagerInfo | null;
  roleFamily:EmployeeRoleFamily| RoleFamilyInfo | null;
  jobLevel: EmployeeJobLevel | JobLevelInfo | null;
  gradeBand: string | null;
  joinDate: string | null;
  employmentType: EmploymentType |string | null;
  status: EmployeeStatus | string | null;
  secondaryManagers: SecondaryManager[] | null;
  changeHistory: ChangeHistoryEntry[] | null;
  createdAt: string | null;
  updatedAt: string | null;
  profilePhotoUrl: string | null;
}

// ─── API list query params ────────────────────────────────────────────────────

export interface EmployeeListQuery {
  search?: string;
  status?: string;
  department?: string;
  managerId?: string;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── API pagination meta ──────────────────────────────────────────────────────

export interface EmployeePaginationMeta {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number | null;
}

export interface EmployeeListPage {
  data: Employee[];
  pagination: EmployeePaginationMeta;
}

// ─── Request bodies ───────────────────────────────────────────────────────────

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  departmentId: string;
  joinDate: string;
  employeeCode?: string;
  designation?: string;
  primaryManagerId?: string;
  roleFamilyId?: string;
  jobLevelId?: string;
  gradeBand?: string;
  employmentType?: string;
  status?: string;
  profilePhotoUrl ?: string;
}

export interface PatchEmployeeRequest {
  name?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  employeeCode?: string;
  designation?: string;
  departmentId: string;
  primaryManagerId?: string;
  roleFamilyId?: string;
  jobLevelId?: string;
  gradeBand?: string;
  joinDate?: string;
  employmentType?: string;
  status?: string;
  profilePhotoUrl ?: string;
}

