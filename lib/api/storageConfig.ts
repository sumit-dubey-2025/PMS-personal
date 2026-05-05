/**
 * API client for Storage Configuration endpoints.
 * Base: GET|PUT /api/{version}/admin/storage-config
 *       POST    /api/{version}/admin/storage-config/test
 *       POST    /api/{version}/admin/storage-config/schema/initialise
 *       GET     /api/{version}/admin/storage-config/schema/initialise/{jobId}
 *
 * NEXT_PUBLIC_API_BASE_URL — base URL (default: http://localhost:5104/api)
 * NEXT_PUBLIC_API_VERSION  — API version segment (default: v1)
 */

import { StorageBackend, StorageConfig, SchemaStatusResponse } from '@/types/storage';

// ─── Constants ───────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5104/api';

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1';

// ─── API-level types (snake_case matches JSON property names from the backend) ──

export interface ApiSharePointConfig {
  siteUrl: string;
  authMethod: string; // "app_registration" | "service_account"
  tenantId: string;
  clientId: string;
  clientSecret: string; // always "****" on GET
  listPrefix: string;
}

export interface ApiAzureSqlConfig {
  serverFqdn: string;
  databaseName: string;
  authMethod: string; // "managed_identity" | "sql_auth"
  sqlUsername: string | null;
  sqlPassword: string; // always "****" on GET
  connectionPoolSize: number;
  commandTimeoutSeconds: number;
}

export interface ApiStorageConfigResponse {
  id: string;
  environment: string;
  backend: string; // "sharepoint" | "azure_sql"
  status: string; // "healthy" | "unreachable" | "not_configured"
  lastHealthCheckAt: string | null;
  lastSavedAt: string | null;
  lastSavedBy: string | null;
  etag: string;
  config: {
    sharePoint: ApiSharePointConfig | null;
    azureSql: ApiAzureSqlConfig | null;
  } | null;
}

export interface ApiTestConnectionResponse {
  success: boolean;
  latencyMs: number | null;
  backend: string;
  error: string | null;
  schemaStatus: Array<{ entity: string; storeName: string; exists: boolean }> | null;
  missingCount: number | null;
  testToken: string | null;
}

export interface ApiSaveConfigResponse {
  id: string;
  environment: string;
  backend: string;
  status: string;
  lastSavedAt: string | null;
  lastSavedBy: string | null;
  etag: string;
}

export interface ApiSchemaInitResponse {
  jobId: string;
  status: string;
  startedAt: string;
  statusUrl: string;
}

export interface ApiSchemaJobStatusResponse {
  jobId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  created: Array<{ entity: string; storeName: string }>;
  skipped: Array<{ entity: string; storeName: string; reason: string }>;
  failed: Array<{ entity: string; storeName: string; error: string }>;
}

export interface ApiHealthCheckResponse {
  status: string;
  backend: string;
  lastCheckedAt: string | null;
  checkedAt: string | null;
  latencyMs: number | null;
  error: string | null;
}

// ─── Request body types ───────────────────────────────────────────────────────

export interface SaveSharePointConfigBody {
  siteUrl: string;
  authMethod: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  serviceAccountUpn?: string;
  serviceAccountPassword?: string;
  listPrefix: string;
}

export interface SaveStorageConfigBody {
  backend: string;
  confirmBackendSwitch: boolean;
  config: {
    sharePoint?: SaveSharePointConfigBody;
    azureSql?: null;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function backendToUi(backend: string): StorageBackend {
  return backend === 'sharepoint' ? 'SharePoint' : 'AzureSQL';
}

function authMethodToUi(method: string): 'AppRegistration' | 'ServiceAccount' {
  return method === 'service_account' ? 'ServiceAccount' : 'AppRegistration';
}

function azureSqlAuthMethodToUi(method: string): 'ManagedIdentity' | 'SqlAuthentication' {
  return method === 'sql_auth' ? 'SqlAuthentication' : 'ManagedIdentity';
}

function healthStatusToUi(status: string): 'Healthy' | 'Unreachable' | 'NotConfigured' {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'unreachable':
      return 'Unreachable';
    default:
      return 'NotConfigured';
  }
}

/** Map GET response → frontend StorageConfig shape */
export function toStorageConfig(r: ApiStorageConfigResponse): StorageConfig & { etag: string } {
  const sp = r.config?.sharePoint;
  const sql = r.config?.azureSql;
  return {
    activeBackend: backendToUi(r.backend),
    lastSavedAt: r.lastSavedAt ?? undefined,
    lastSavedBy: r.lastSavedBy ?? undefined,
    sharePoint: sp
      ? {
          siteUrl: sp.siteUrl,
          authMethod: authMethodToUi(sp.authMethod),
          tenantId: sp.tenantId,
          clientId: sp.clientId,
          clientSecret: sp.clientSecret,
          listPrefix: sp.listPrefix,
        }
      : undefined,
    azureSql: sql
      ? {
          serverFqdn: sql.serverFqdn,
          databaseName: sql.databaseName,
          authMethod: azureSqlAuthMethodToUi(sql.authMethod),
          sqlUsername: sql.sqlUsername ?? undefined,
          sqlPassword: sql.sqlPassword,
          connectionPoolSize: sql.connectionPoolSize,
          commandTimeoutSeconds: sql.commandTimeoutSeconds,
        }
      : undefined,
    health: {
      status: healthStatusToUi(r.status),
      lastCheckedAt: r.lastHealthCheckAt ?? new Date().toISOString(),
    },
    etag: r.etag,
  };
}

/** Map test-connection response → SchemaStatusResponse */
export function toSchemaStatus(
  schema: ApiTestConnectionResponse['schemaStatus'],
): SchemaStatusResponse {
  const entities = (schema ?? []).map((s) => ({
    entity: s.entity,
    target: s.storeName,
    exists: s.exists,
  }));
  return {
    isFullyProvisioned: entities.every((e) => e.exists),
    entities,
  };
}

/** Generic fetch wrapper — throws on non-ok (unless 404 is expected by caller). */
// ─── Dev auth bypass ─────────────────────────────────────────────────────────
// In local development the Azure Functions host is not protected by Azure AD
// Easy Auth. The backend accepts an X-Dev-User-Email header instead when
// AZURE_FUNCTIONS_ENVIRONMENT == "Development". This constant is stripped from
// production builds by Next.js (NODE_ENV will be "production").
const DEV_USER_EMAIL =
  process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_DEV_USER_EMAIL ?? 'dev@localhost')
    : null;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE}/${API_VERSION}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(DEV_USER_EMAIL ? { 'X-Dev-User-Email': DEV_USER_EMAIL } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });
  return res;
}

// ─── Public API functions ─────────────────────────────────────────────────────

/**
 * GET /api/{version}/admin/storage-config
 * Returns null when no configuration has been saved yet (404).
 */
export async function getStorageConfig(): Promise<(StorageConfig & { etag: string }) | null> {
  const res = await apiFetch('/admin/storage-config');
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load storage configuration (${res.status})`);
  }
  const data: ApiStorageConfigResponse = await res.json();
  return toStorageConfig(data);
}

/**
 * POST /api/{version}/admin/storage-config/test
 * Tests the supplied (unsaved) SharePoint configuration.
 */
export async function testStorageConnection(
  body: SaveStorageConfigBody,
): Promise<ApiTestConnectionResponse> {
  const res = await apiFetch('/admin/storage-config/test', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Connection test failed (${res.status})`);
  }
  return res.json() as Promise<ApiTestConnectionResponse>;
}

/**
 * PUT /api/{version}/admin/storage-config
 * Persists the SharePoint configuration.
 * @param ifMatch  ETag from the last GET/PUT — required if config already exists.
 * @param testToken  HMAC token returned by POST /test — required by the backend.
 */
export async function saveStorageConfig(
  body: SaveStorageConfigBody,
  ifMatch: string | null,
  testToken: string | null,
): Promise<ApiSaveConfigResponse> {
  const headers: Record<string, string> = {};
  if (ifMatch) headers['If-Match'] = ifMatch;
  if (testToken) headers['X-Storage-Test-Token'] = testToken;

  const res = await apiFetch('/admin/storage-config', {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    const code: string = (problem as { code?: string }).code ?? '';
    throw Object.assign(new Error(code || `Save failed (${res.status})`), {
      status: res.status,
      code,
    });
  }
  return res.json() as Promise<ApiSaveConfigResponse>;
}

/**
 * POST /api/{version}/admin/storage-config/schema/initialise
 * Queues schema initialisation for the active SharePoint backend.
 * Returns immediately with a jobId; callers can poll getSchemaJobStatus.
 */
export async function initialiseStorageSchema(): Promise<ApiSchemaInitResponse> {
  const res = await apiFetch('/admin/storage-config/schema/initialise', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Schema initialisation failed (${res.status})`);
  }
  return res.json() as Promise<ApiSchemaInitResponse>;
}

/**
 * POST /api/{version}/admin/storage-config/schema/initialise/lists/{listName}
 * Queues schema initialisation for a single entity/list.
 */
export async function initialiseStorageSchemaForList(
  listName: string,
): Promise<ApiSchemaInitResponse> {
  const res = await apiFetch(
    `/admin/storage-config/schema/initialise/lists/${encodeURIComponent(listName)}`,
    {
      method: 'POST',
    },
  );
  if (!res.ok) {
    throw new Error(`Schema initialisation failed (${res.status})`);
  }
  return res.json() as Promise<ApiSchemaInitResponse>;
}

/**
 * GET /api/{version}/admin/storage-config/schema/initialise/{jobId}
 * Checks the status of a schema initialisation job.
 */
export async function getSchemaJobStatus(jobId: string): Promise<ApiSchemaJobStatusResponse> {
  const res = await apiFetch(
    `/admin/storage-config/schema/initialise/${encodeURIComponent(jobId)}`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch job status (${res.status})`);
  }
  return res.json() as Promise<ApiSchemaJobStatusResponse>;
}

/**
 * POST /api/{version}/admin/storage-config/health-check
 * Triggers a live connectivity check against the persisted (saved) config.
 * No request body — the backend uses the active saved configuration.
 */
export async function runHealthCheck(): Promise<ApiHealthCheckResponse> {
  const res = await apiFetch('/admin/storage-config/health-check', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Health check failed (${res.status})`);
  }
  return res.json() as Promise<ApiHealthCheckResponse>;
}

export interface ApiSchemaStatusCheckResponse {
  schemaStatus: Array<{ entity: string; storeName: string; exists: boolean }>;
  missingCount: number;
}

/**
 * GET /api/{version}/admin/storage-config/schema/status
 * Returns the schema status for the active saved configuration.
 * No request body — the backend uses Key Vault-sourced credentials.
 */
export async function getStorageSchemaStatus(): Promise<ApiSchemaStatusCheckResponse> {
  const res = await apiFetch('/admin/storage-config/schema/status');
  if (!res.ok) {
    throw new Error(`Failed to load schema status (${res.status})`);
  }
  return res.json() as Promise<ApiSchemaStatusCheckResponse>;
}
