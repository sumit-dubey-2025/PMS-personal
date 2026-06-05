import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeListPage,
  EmployeeListQuery,
  PatchEmployeeRequest,
} from '@/types/employee';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5104/api';

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1';

// Dev auth bypass — header is stripped in production builds by Next.js.
const DEV_USER_EMAIL =
  process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_DEV_USER_EMAIL ?? 'dev@localhost')
    : null;

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE}/${API_VERSION}${path}`;

  return fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(DEV_USER_EMAIL ? { 'X-Dev-User-Email': DEV_USER_EMAIL } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });
}
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Public API functions ─────────────────────────────────────────────────────



export async function listEmployees(query: EmployeeListQuery = {}): Promise<EmployeeListPage> {
  const params = new URLSearchParams();

  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);
  if (query.department) params.set('department', query.department);
  if (query.managerId) params.set('managerId', query.managerId);
  if (query.limit) params.set('limit', String(query.limit));
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);

  const qs = params.toString(); 
  const res = await apiFetch(`/employees${qs ? `?${qs}` : ''}`);


  if (!res.ok) {
    throw new Error(`Failed to list employees (${res.status})`);
  }

  return res.json() as Promise<EmployeeListPage>;
}

/**
 * GET /api/{version}/employees/{id}
 * Returns a single employee by ID.
 */
export async function getEmployee(id: string): Promise<Employee> {
  const res = await apiFetch(`/employees/${encodeURIComponent(id)}`);

  if (res.status === 404) {
    throw new Error(`Employee not found: ${id}`);
  }
  if (!res.ok) {
    throw new Error(`Failed to get employee (${res.status})`);
  }

  return res.json() as Promise<Employee>;
}

/**
 * POST /api/{version}/employees
 * Creates a new employee record. Returns the created employee.
 */
export async function createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
  const res = await apiFetch('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    // throw Object.assign(
    //   new Error((problem as { title?: string }).title ?? `Create failed (${res.status})`),
    //   { status: res.status, errors: (problem as { errors?: unknown }).errors },
    // );
    const p = problem as { title?: string; detail?: string; errors?: unknown };
    const message = p.detail ?? p.title ?? `Create failed (${res.status})`;
    throw Object.assign(new Error(message), {
      status: res.status,
      title: p.title,
      detail: p.detail,
      errors: p.errors,
    });
  }

  return res.json() as Promise<Employee>;
}

/**
 * PATCH /api/{version}/employees/{id}
 * Partially updates an employee — only provided fields are changed.
 */
export async function patchEmployeeFromRepository(id: string, data: PatchEmployeeRequest): Promise<Employee> {
  const res = await apiFetch(`/employees/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (res.status === 404) {
    throw new Error(`Employee not found: ${id}`);
  }
  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    // throw Object.assign(
    //   new Error((problem as { title?: string }).title ?? `Patch failed (${res.status})`),
    //   { status: res.status, errors: (problem as { errors?: unknown }).errors },
    // );
    const p = problem as { title?: string; detail?: string; errors?: unknown };
    const message = p.detail ?? p.title ?? `Patch failed (${res.status})`;
    throw Object.assign(new Error(message), {
      status: res.status,
      title: p.title,
      detail: p.detail,
      errors: p.errors,
    });
  }

  return res.json() as Promise<Employee>;
}

export async function listOrgNodes(): Promise<{ id: string; nodeCode: string; name: string; type: string; status: string }[]> {
  const res = await apiFetch('/org/nodes?flat=true&limit=100');

  if (!res.ok) {
    throw new Error(`Failed to load departments (${res.status})`);
  }

  const data = await res.json() as { data: { id: string; nodeCode: string; name: string; type: string; status: string }[] };
  return data.data.filter(n => n.status === 'Active');
}

/**
 * POST /api/{version}/employees/{id}/photo
 * Uploads a profile photo for an employee.
 */
export async function uploadEmployeePhoto(id: string, file: File): Promise<void> {


  const url = `${API_BASE}/${API_VERSION}/employees/${encodeURIComponent(id)}/photo`;

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      // ⚠️ Do NOT include Content-Type here — browser sets it automatically
      // with the correct multipart boundary
      ...(DEV_USER_EMAIL ? { 'X-Dev-User-Email': DEV_USER_EMAIL } : {}),
    },
  });

  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    const p = problem as { title?: string; detail?: string };
    const message = p.detail ?? p.title ?? `Photo upload failed (${res.status})`;
    throw new Error(message);
  }
}
function mapEmployee(emp: any): Employee {
  return {
    id: emp?.id ?? '',
    employeeCode: emp?.employeeCode ?? '',
    name: emp?.name ?? '',
    firstName: emp?.firstName ?? '',
    lastName: emp?.lastName ?? '',
    email: emp?.email ?? '',
    designation: emp?.designation ?? '',
    secondaryManagers: Array.isArray(emp?.secondaryManagers)
      ? emp.secondaryManagers.map((m: any) => ({
          id: m.id ?? '',
          name: m.name ?? '',
          type: m.type ?? '',
          contributionWeight: m.contributionWeight ?? null,
          startDate: m.startDate ?? '',
          endDate: m.endDate ?? '',
        }))
      : null, 
      changeHistory: Array.isArray(emp?.changeHistory)
      ? emp.changeHistory.map((h: any) => ({
          timestamp: h.timestamp ?? '',
          actorId: h.actorId ?? '',
          actorName: h.actorName ?? '',
          field: h.field ?? '',
          oldValue: h.oldValue ?? '',
          newValue: h.newValue ?? '',
        }))
      : null,
      profilePhotoUrl: emp?.profilePhotoUrl ?? null, 
    department: {
      id: emp?.department?.id ?? '',
      name: emp?.department?.name ?? 'No Department',
      path: emp?.department?.path ?? '',
    },

    primaryManager: emp?.primaryManager
      ? {
          id: emp.primaryManager.id ?? '',
          name: emp.primaryManager.name ?? '',
        }
      : null,

    roleFamily: emp?.roleFamily
      ? {
          id: emp.roleFamily.id ?? '',
          name: emp.roleFamily.name ?? '',
        }
      : null,

    jobLevel: emp?.jobLevel
      ? {
          id: emp.jobLevel.id ?? '',
          code: emp.jobLevel.code ?? '',
          label: emp.jobLevel.label ?? '',
        }
      : null,

    gradeBand: emp?.gradeBand ?? null,

    joinDate: emp?.joinDate ?? '',
    employmentType: emp?.employmentType ?? 'full_time',
    status: emp?.status ?? 'active',

    createdAt: emp?.createdAt ?? '',
    updatedAt: emp?.updatedAt ?? '',
  };
}
export async function searchEmployees(query: string): Promise<Employee[]> {
  try {
    const res = await apiFetch(`/employees?search=${encodeURIComponent(query)}`);
    const json = await safeJson(res);

    if (!res.ok) {
      throw new Error(json?.message ?? `Failed to fetch employees (${res.status})`);
    }

    const data = json?.data ?? [];

    // ✅ map + filter invalid
    return data.map(mapEmployee).filter((e:Employee) => e.name);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}
export async function getCurrentEmployee(): Promise<Employee | null> {
  try {
    const res = await apiFetch('/employees/me');
    const json = await safeJson(res);

    if (!res.ok) {
      throw new Error(json?.message ?? `Failed to fetch current employee (${res.status})`);
    }

    return json ? mapEmployee(json) : null;
  } catch (error) {
    console.error('Error fetching current employee:', error);
    return null;
  }
}
export async function getEmployeeCount(): Promise<number> {
  try {
    const res = await apiFetch('/employees/count?status=Active');
    const json = await safeJson(res);

    if (!res.ok) {
      throw new Error(json?.message ?? `Failed to fetch count (${res.status})`);
    }

    return json?.count ?? 0;
  } catch (error) {
    console.error('Error fetching employee count:', error);
    return 0;
  }
}
export async function updateEmployee(
  id: string,
  payload: Partial<Employee>
): Promise<Employee> {
  const res = await apiFetch(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  const json = await safeJson(res);

  if (!res.ok) {
    throw new Error(json?.message ?? `Failed to update employee (${res.status})`);
  }

  return mapEmployee(json);
}
export async function patchEmployee(
  id: string,
  payload: Partial<Employee>
): Promise<Employee> {
  const res = await apiFetch(`/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  const json = await safeJson(res);

  if (!res.ok) {
    throw new Error(json?.message ?? `Failed to patch employee (${res.status})`);
  }

  return mapEmployee(json);
}
// 🔍 Find Employee by Email
export async function findEmployeeByEmail(email: string): Promise<Employee | null> {
  try {
    const res = await apiFetch(`/employees?email=${encodeURIComponent(email)}`);
    const json = await safeJson(res);

    if (!res.ok) {
      throw new Error(json?.message ?? `Failed to fetch employee (${res.status})`);
    }

    const employees = json?.data ?? [];

    return employees.length > 0 ? mapEmployee(employees[0]) : null;
  } catch (error) {
    console.error('Error finding employee by email:', error);
    return null;
  }
}
export async function findEmployeeByName(name: string): Promise<Employee | null> {
  if (!name?.trim()) return null;

  const res = await apiFetch(
    `/employees?search=${encodeURIComponent(name)}&limit=50`
  );

  if (!res.ok) {
    console.error("Failed to fetch employees:", res.status);
    return null;
  }

  const data = await res.json();

  const employees: Employee[] = Array.isArray(data)
    ? data
    : data?.value || data?.data || [];

  return (
    employees.find(
      (e) =>
        e.name?.toLowerCase().trim() === name.toLowerCase().trim()
    ) ?? null
  );
}
// Build Headcount Map from Employees API (NO backend change)
export async function getHeadcountByNode(): Promise<Record<string, number>> {
  try {
    const res = await apiFetch('/employees'); // max allowed
    const json = await safeJson(res);

    if (!res.ok) {
      throw new Error(json?.message ?? `Failed to fetch employees (${res.status})`);
    }

    const employees = json?.data ?? [];
    console.log('Fetched employees for headcount:', employees);

    const map: Record<string, number> = {};

    for (const emp of employees) {
      const nodeCode = emp?.department?.nodeCode || emp?.department?.id;

      if (!nodeCode) continue;

      map[nodeCode] = (map[nodeCode] || 0) + 1;
    }

    return map;
  } catch (error) {
    console.error('Error building headcount:', error);
    return {};
  }
}