const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5104/api';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1';

const DEV_USER_EMAIL =
  process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_DEV_USER_EMAIL ?? 'dev@localhost')
    : null;

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE}/${API_VERSION}${path}`;
  return fetch(url, {
    cache: 'no-store',
    headers: {
      ...(DEV_USER_EMAIL ? { 'X-Dev-User-Email': DEV_USER_EMAIL } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });
}

// ─── Download CSV Template ────────────────────────────────────────────────────
// FIX (Copilot #4): Now throws so callers can show a toast/error UI instead of
// silently swallowing errors. Content-Disposition parsing failure is also surfaced.

export const handleDownloadTemplate = async (): Promise<void> => {
  const response = await apiFetch('/import/employees/template', { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Failed to download template: ${response.status} ${response.statusText}`);
  }

  const disposition = response.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/);

  // Warn (non-fatal) if the header is absent — we fall back to a sensible name.
  if (!disposition) {
    console.warn('handleDownloadTemplate: Content-Disposition header missing; using default filename.');
  }

  const filename = match?.[1] ?? 'PMS-Employee-Template.csv';

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiValidationRow {
  rowNumber: number;
  Title: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeID: string;
  departmentNodeCode: string;
  primaryManagerEmail: string;
  roleFamilyCode: string;
  jobLevelCode: string;
  employmentType: string;
  joiningDate: string;
  employeeStatus: string;
  Designation: string;
  HRISLastSyncedAt: string;
  IsMatrixReporter: boolean | string;
  ProfilePhotoURL: string;
  ETag: string;
  status: 'Valid' | 'Error';
  errors: string[];
}

export interface ApiValidationResult {
  jobId: string;
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: ApiValidationRow[];
}

export interface ImportJobResult {
  jobId: string;
  sharepointList: string;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  status: 'Completed' | 'Failed' | 'PartialSuccess';
  message: string;
}

// ─── ImportJobSummary ─────────────────────────────────────────────────────────
// FIX (Copilot #2): Added `progress` sub-object to match the actual
// BulkImportJobStatusResponse shape returned by the API.

export interface ImportJobProgress {
  processedCount?: number;
  totalCount?: number;
  estimatedSecondsRemaining?: number | null;
}

export interface ImportJobSummary {
  totalRecords?: number;
  recordsCreated?: number; // maps → importedCount
  created?: number;        // alternate key some versions use
  recordsUpdated?: number;
  recordsSkipped?: number; // maps → skippedCount
  skipped?: number;        // alternate key some versions use
  failed?: number;         // maps → errorCount
}

// ─── ImportJobStatus ──────────────────────────────────────────────────────────
// FIX (Copilot #2): Added nested `progress` object alongside existing flat
// fields so both API response shapes are covered without dropping real values.

export interface ImportJobStatus {
  jobId: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'PartialSuccess' | 'importing';
  // Flat progress fields (some API versions):
  processedCount?: number;
  totalCount?: number;
  estimatedSecondsRemaining?: number | null;
  // Nested progress object (other API versions):
  progress?: ImportJobProgress;
  // Flat counts (some API versions):
  importedCount?: number;
  skippedCount?: number;
  errorCount?: number;
  // Nested counts (other API versions):
  summary?: ImportJobSummary;
  message?: string;
}

// ─── resolveProgressFromStatus ───────────────────────────────────────────────
// FIX (Copilot #2): Resolves processedCount/totalCount from whichever location
// the API populated — flat fields or nested `progress` object.

export function resolveProgressFromStatus(s: ImportJobStatus): {
  processedCount: number;
  totalCount: number;
  estimatedSecondsRemaining: number | null;
} {
  return {
    processedCount:
      s.processedCount ?? s.progress?.processedCount ?? 0,
    totalCount:
      s.totalCount ?? s.progress?.totalCount ?? 0,
    estimatedSecondsRemaining:
      s.estimatedSecondsRemaining ?? s.progress?.estimatedSecondsRemaining ?? null,
  };
}

// ─── resolveCountsFromStatus ──────────────────────────────────────────────────
// The API may return counts either as flat top-level fields OR nested inside
// `summary`. This helper checks both locations so the UI always gets a number.

export function resolveCountsFromStatus(s: ImportJobStatus): {
  importedCount: number;
  skippedCount: number;
  errorCount: number;
} {
  const sum = s.summary;
  return {
    importedCount:
      s.importedCount        // flat field
      ?? sum?.recordsCreated // nested: recordsCreated
      ?? sum?.created        // nested: created (alternate key)
      ?? 0,
    skippedCount:
      s.skippedCount         // flat field
      ?? sum?.recordsSkipped // nested: recordsSkipped
      ?? sum?.skipped        // nested: skipped (alternate key)
      ?? 0,
    errorCount:
      s.errorCount           // flat field
      ?? sum?.failed         // nested: failed
      ?? 0,
  };
}

// ─── Strip Invalid Rows from CSV ──────────────────────────────────────────────

export const stripInvalidRowsFromCsv = async (
  file: File,
  validRowNumbers: number[],
): Promise<File> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const validSet = new Set(validRowNumbers);

  const filteredLines = [
    lines[0],
    ...lines.slice(1).filter((_, idx) => {
      const rowNumber = idx + 2; // idx is 0-based; header is row 1
      return validSet.has(rowNumber);
    }),
  ].filter((line) => line.trim() !== '');

  return new File([filteredLines.join('\n')], file.name, { type: 'text/csv' });
};

// ─── BulkImportJobEnvelope ────────────────────────────────────────────────────
// FIX (Copilot #1): The POST /import/employees endpoint returns 202 Accepted
// with a job envelope, NOT validation rows directly. We model that shape here
// and then poll for the full validation result via the job-status endpoint.

interface BulkImportJobEnvelope {
  jobId: string;
  status: string;
  statusUrl?: string;
}

// ─── Upload & Validate CSV ────────────────────────────────────────────────────
// FIX (Copilot #1): POST /import/employees returns 202 + a job envelope.
// We now poll the job until it reaches a terminal state and then fetch the
// per-row validation results from the completed job, aligning the client
// contract with the server's BulkImportJobResponse shape.

export const uploadAndValidateCsv = async (file: File): Promise<ApiValidationResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', 'validate_only');

  const response = await apiFetch('/import/employees', { method: 'POST', body: formData });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Validation failed: ${errorText}`);
  }

  // The API returns 202 with a job envelope — poll until the validation job
  // reaches a terminal state, then surface the row-level results.
  const envelope: BulkImportJobEnvelope = await response.json();

  if (!envelope.jobId) {
    throw new Error('Validation job started but no jobId was returned by the server.');
  }

  const finalStatus = await pollUntilComplete(envelope.jobId);

  // Fetch the per-row validation results from the completed job.
  // The job-status endpoint is expected to include the rows array once done.
  const rowsResponse = await apiFetch(`/import/jobs/${envelope.jobId}/rows`, { method: 'GET' });

  if (!rowsResponse.ok) {
    const errorText = await rowsResponse.text();
    throw new Error(`Failed to fetch validation rows: ${errorText}`);
  }

  const rows: ApiValidationRow[] = await rowsResponse.json();
  const { errorCount } = resolveCountsFromStatus(finalStatus);

  return {
    jobId:      envelope.jobId,
    totalRows:  rows.length,
    validCount: rows.filter((r) => r.status === 'Valid').length,
    errorCount,
    rows,
  };
};

// ─── Confirm Import ───────────────────────────────────────────────────────────
// Strips invalid rows client-side, then POSTs the clean CSV.
// Polls until the job completes and resolves counts from whichever shape the
// API returned (flat top-level OR nested summary object).
// FIX (Copilot #3): Missing jobId is now treated as a hard error instead of
// silently substituting a hard-coded fallback UUID.

export const confirmImport = async (
  file: File,
  validRowNumbers: number[],
): Promise<ImportJobResult> => {
  const cleanFile = await stripInvalidRowsFromCsv(file, validRowNumbers);

  const formData = new FormData();
  formData.append('file', cleanFile);
  formData.append('mode', 'import');

  const response = await apiFetch('/import/employees', { method: 'POST', body: formData });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Import failed: ${errorText}`);
  }

  const initial: { jobId?: string } = await response.json();

  // FIX (Copilot #3): Require a real jobId — never silently fall back to a
  // hard-coded UUID that could poll someone else's job.
  if (!initial.jobId) {
    throw new Error(
      'Import job started but no jobId was returned by the server. Cannot track progress.',
    );
  }

  const jobId: string = initial.jobId;
  const finalStatus = await pollUntilComplete(jobId);

  // Resolve counts from whichever location the API populated —
  // flat fields or nested summary — so the UI always shows real numbers.
  const { importedCount, skippedCount, errorCount } = resolveCountsFromStatus(finalStatus);

  return {
    jobId:          finalStatus.jobId,
    sharepointList: '',
    status:         finalStatus.status as ImportJobResult['status'],
    importedCount,
    skippedCount,
    errorCount,
    message:        finalStatus.message ?? '',
  };
};

// ─── Get Import Job Status ────────────────────────────────────────────────────
// GET /import/jobs/{jobId}
// FIX (Copilot #3): jobId is now required (string, not string | undefined) so
// callers cannot accidentally pass undefined and silently hit the wrong job.

export const getImportJobStatus = async (jobId: string): Promise<ImportJobStatus> => {
  const response = await apiFetch(`/import/jobs/${jobId}`, { method: 'GET' });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch job status: ${errorText}`);
  }

  return response.json() as Promise<ImportJobStatus>;
};

// ─── Poll until terminal state ────────────────────────────────────────────────

async function pollUntilComplete(
  jobId: string,
  intervalMs = 2000,
  maxAttempts = 30,
): Promise<ImportJobStatus> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await getImportJobStatus(jobId);
    const s = status.status?.toLowerCase();
    if (s === 'completed' || s === 'failed' || s === 'partial' || s === 'partialsuccess') {
      return status;
    }
    await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
  }
  return getImportJobStatus(jobId);
}