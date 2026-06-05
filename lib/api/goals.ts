import type {
  CreateGoalRequest,
  FieldError,
  Goal,
  GoalListResponse,
  PatchGoalRequest,
  PatchGoalResponse,
  RoleExpectationListResponse,
} from '@/types/goal';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5104/api';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1';

const DEV_USER_EMAIL =
  process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_DEV_USER_EMAIL ?? 'dev@localhost')
    : null;

// ─── Internal fetch helper ────────────────────────────────────────────────────

/**
 * Normalize the `errors` property from an API problem-details response into a
 * typed `FieldError[]`.  The API always emits an array of `{field, code, message}`
 * objects; this guard prevents the form from receiving raw `unknown` data.
 */
function normalizeFieldErrors(errors: unknown): FieldError[] {
  if (!Array.isArray(errors)) return [];
  return errors.filter(
    (e): e is FieldError =>
      typeof e === 'object' &&
      e !== null &&
      typeof (e as FieldError).field === 'string' &&
      typeof (e as FieldError).code === 'string' &&
      typeof (e as FieldError).message === 'string',
  );
}

async function apiFetch(
  path: string,
  options?: RequestInit & { ifMatch?: string },
): Promise<Response> {
  const { ifMatch, ...rest } = options ?? {};
  const url = `${API_BASE}/${API_VERSION}${path}`;

  return fetch(url, {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(rest.body != null ? { 'Content-Type': 'application/json' } : {}),
      ...(DEV_USER_EMAIL ? { 'X-Dev-User-Email': DEV_USER_EMAIL } : {}),
      ...(ifMatch ? { 'If-Match': ifMatch } : {}),
      ...(rest?.headers ?? {}),
    },
    ...rest,
  });
}

// ─── Public API functions ─────────────────────────────────────────────────────

export interface ListGoalsQuery {
  cycleCode?: string;
  ownerScope?: string;
  workflowStatus?: string;
  goalCategory?: string;
  limit?: number;
  cursor?: string;
}

/**
 * GET /api/{version}/goals
 */
export async function listGoals(query: ListGoalsQuery = {}): Promise<GoalListResponse> {
  const params = new URLSearchParams();

  if (query.cycleCode) params.set('cycleCode', query.cycleCode);
  if (query.ownerScope) params.set('ownerScope', query.ownerScope);
  if (query.workflowStatus) params.set('workflowStatus', query.workflowStatus);
  if (query.goalCategory) params.set('goalCategory', query.goalCategory);
  if (query.limit) params.set('limit', String(query.limit));
  if (query.cursor) params.set('cursor', query.cursor);

  const qs = params.toString();
  const res = await apiFetch(`/goals${qs ? `?${qs}` : ''}`);

  if (!res.ok) {
    const problem = (await res.json().catch(() => ({}))) as { title?: string; detail?: string };
    throw Object.assign(
      new Error(problem.detail ?? problem.title ?? `Failed to list goals (${res.status})`),
      { status: res.status },
    );
  }

  return res.json() as Promise<GoalListResponse>;
}

/**
 * GET /api/{version}/goals/{goalCode}
 */
export async function getGoal(goalCode: string): Promise<Goal> {
  const res = await apiFetch(`/goals/${encodeURIComponent(goalCode)}`);

  if (res.status === 404) {
    throw Object.assign(new Error(`Goal not found: ${goalCode}`), { status: 404 });
  }

  if (!res.ok) {
    const problem = (await res.json().catch(() => ({}))) as { title?: string; detail?: string };
    throw Object.assign(
      new Error(problem.detail ?? problem.title ?? `Failed to get goal (${res.status})`),
      { status: res.status },
    );
  }

  return res.json() as Promise<Goal>;
}

/**
 * POST /api/{version}/goals
 * Creates a new draft goal and returns it.
 */
export async function createGoal(data: CreateGoalRequest): Promise<Goal> {
  const res = await apiFetch('/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const problem = (await res.json().catch(() => ({}))) as {
      title?: string;
      detail?: string;
      errors?: unknown;
    };
    throw Object.assign(
      new Error(problem.detail ?? problem.title ?? `Create goal failed (${res.status})`),
      { status: res.status, errors: normalizeFieldErrors(problem.errors) },
    );
  }

  return res.json() as Promise<Goal>;
}

/**
 * PATCH /api/{version}/goals/{goalCode}
 * Partially updates a draft goal.  Pass `etag` for optimistic concurrency.
 */
export async function patchGoal(
  goalCode: string,
  data: PatchGoalRequest,
  etag?: string | null,
): Promise<PatchGoalResponse> {
  const res = await apiFetch(`/goals/${encodeURIComponent(goalCode)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ifMatch: etag ?? undefined,
  });

  if (!res.ok) {
    const problem = (await res.json().catch(() => ({}))) as {
      title?: string;
      detail?: string;
      errors?: unknown;
    };
    throw Object.assign(
      new Error(problem.detail ?? problem.title ?? `Patch goal failed (${res.status})`),
      { status: res.status, errors: normalizeFieldErrors(problem.errors) },
    );
  }

  return res.json() as Promise<PatchGoalResponse>;
}

// ─── Role expectations ────────────────────────────────────────────────────────

export interface ListRoleExpectationsQuery {
  cycleCode?: string;
  goalCategory?: string;
  status?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}

/**
 * GET /api/{version}/role-expectations
 */
export async function listRoleExpectations(
  query: ListRoleExpectationsQuery,
): Promise<RoleExpectationListResponse> {
  const params = new URLSearchParams();

  if (query.cycleCode) params.set('cycleCode', query.cycleCode);
  if (query.goalCategory) params.set('goalCategory', query.goalCategory);
  if (query.status) params.set('status', query.status);
  if (query.search) params.set('search', query.search);
  if (query.limit) params.set('limit', String(query.limit));
  if (query.cursor) params.set('cursor', query.cursor);

  const res = await apiFetch(`/role-expectations?${params.toString()}`);

  if (!res.ok) {
    const problem = (await res.json().catch(() => ({}))) as { title?: string; detail?: string };
    throw Object.assign(
      new Error(
        problem.detail ?? problem.title ?? `Failed to list role expectations (${res.status})`,
      ),
      { status: res.status },
    );
  }

  return res.json() as Promise<RoleExpectationListResponse>;
}
