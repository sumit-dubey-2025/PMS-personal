'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { handleDownloadTemplate, uploadAndValidateCsv, confirmImport, getImportJobStatus, resolveProgressFromStatus } from '@/lib/api/bulkimport';
import type { ApiValidationResult, ImportJobResult, ImportJobStatus, ApiValidationRow } from '@/lib/api/bulkimport';

import {
  IconEmployees,
  IconChevronRight,
  IconCircle,
  IconBuilding,
  IconFileText,
  IconShieldCheck,
  IconHistory,
  IconInfo,
  IconDownload,
  IconArrowLeft,
  IconArrowRight,
  IconUpload,
  IconTrash,
  IconLightbulb,
  IconAlertOctagon,
  IconSearch,
  IconX,
  IconUploadIcon,
  IconAlertTriangle,
  IconCheckCircle,
  IconHourglass,
  IconCheck,
} from '@/components/Icons';

const STEPS = [
  'Select Entity',
  'Download Template',
  'Upload CSV',
  'Validation Results',
  'Confirm & Import',
];

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ValidationRow {
  rowNumber: number;
  Email: string;
  FirstName: string;
  LastName: string;
  EmployeeID: string;
  DepartmentNodeCode: string;
  PrimaryManagerEmail: string;
  RoleFamilyCode: string;
  JobLevelCode: string;
  EmploymentType: string;
  JoiningDate: string;
  EmployeeStatus: string;
  status: 'Valid' | 'Error';
  errors: string[];
}

interface ValidationResult {
  jobId?: string;
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: ValidationRow[];
}

// ─── CSV Validation Logic (client-side fallback) ──────────────────────────────
const REQUIRED_HEADERS = [
  'Email', 'FirstName', 'EmployeeID', 'LastName', 'DepartmentNodeCode',
  'PrimaryManagerEmail', 'RoleFamilyCode', 'JobLevelCode',
  'EmploymentType', 'JoiningDate', 'EmployeeStatus',
];
const VALID_EMPLOYMENT_TYPES = ['Permanent', 'Contract', 'Intern', 'Part-time'];
const VALID_EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave', 'Probation', 'Exited'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseAndValidateCsv(text: string): ValidationResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) {
    return { totalRows: 0, validCount: 0, errorCount: 0, rows: [] };
  }
  const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: ValidationRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const get = (col: string) => cols[rawHeaders.indexOf(col)] ?? '';
    const email               = get('Email');
    const firstName           = get('FirstName');
    const lastName            = get('LastName');
    const employeeID          = get('EmployeeID');
    const departmentNodeCode  = get('DepartmentNodeCode');
    const primaryManagerEmail = get('PrimaryManagerEmail');
    const roleFamilyCode      = get('RoleFamilyCode');
    const jobLevelCode        = get('JobLevelCode');
    const employmentType      = get('EmploymentType');
    const joiningDate         = get('JoiningDate');
    const employeeStatus      = get('EmployeeStatus');
    const errors: string[]    = [];

    if (!email)                         errors.push('Missing required field: Email');
    else if (!EMAIL_REGEX.test(email))  errors.push('Invalid email format: Email');
    if (!firstName)                     errors.push('Missing required field: FirstName');
    else if (firstName.length > 100)    errors.push('FirstName exceeds 100 characters');
    if (!lastName)                      errors.push('Missing required field: LastName');
    else if (lastName.length > 100)     errors.push('LastName exceeds 100 characters');
    if (employeeID && employeeID.length > 50) errors.push('EmployeeID exceeds 50 characters');
    if (!departmentNodeCode)            errors.push('Missing required field: DepartmentNodeCode');
    if (!primaryManagerEmail)                         errors.push('Missing required field: PrimaryManagerEmail');
    else if (!EMAIL_REGEX.test(primaryManagerEmail))  errors.push('Invalid email format: PrimaryManagerEmail');
    if (!roleFamilyCode) errors.push('Missing required field: RoleFamilyCode');
    if (!jobLevelCode)   errors.push('Missing required field: JobLevelCode');
    if (roleFamilyCode && jobLevelCode && roleFamilyCode === jobLevelCode && roleFamilyCode.startsWith('X')) {
      errors.push('Invalid RoleFamilyCode/JobLevelCode combination');
    }
    if (!employmentType) {
      errors.push('Missing required field: EmploymentType');
    } else if (!VALID_EMPLOYMENT_TYPES.includes(employmentType)) {
      errors.push(`Invalid EmploymentType: "${employmentType}" (must be Permanent/Contract/Intern/Part-time)`);
    }
    if (!joiningDate)                       errors.push('Missing required field: JoiningDate');
    else if (!DATE_REGEX.test(joiningDate)) errors.push('Invalid JoiningDate format (expected YYYY-MM-DD)');
    if (!employeeStatus) {
      errors.push('Missing required field: EmployeeStatus');
    } else if (!VALID_EMPLOYEE_STATUSES.includes(employeeStatus)) {
      errors.push(`Invalid EmployeeStatus: "${employeeStatus}"`);
    }

    rows.push({
      rowNumber: i + 1,
      Email: email, FirstName: firstName, LastName: lastName,
      EmployeeID: employeeID, DepartmentNodeCode: departmentNodeCode,
      PrimaryManagerEmail: primaryManagerEmail, RoleFamilyCode: roleFamilyCode,
      JobLevelCode: jobLevelCode, EmploymentType: employmentType,
      JoiningDate: joiningDate, EmployeeStatus: employeeStatus,
      status: errors.length === 0 ? 'Valid' : 'Error',
      errors,
    });
  }
  const validCount = rows.filter((r) => r.status === 'Valid').length;
  const errorCount = rows.filter((r) => r.status === 'Error').length;
  return { totalRows: rows.length, validCount, errorCount, rows };
}

// ─── Download error report ────────────────────────────────────────────────────
function downloadErrorReport(rows: ValidationRow[]) {
  const errorRows = rows.filter((r) => r.status === 'Error');
  const headers = [
    'Row#', 'Email', 'FirstName', 'LastName', 'EmployeeID',
    'DepartmentNodeCode', 'PrimaryManagerEmail', 'RoleFamilyCode',
    'JobLevelCode', 'EmploymentType', 'JoiningDate', 'EmployeeStatus',
    'ValidationStatus', 'ErrorDetails',
  ];
  const escape = (val: string | number | boolean | null | undefined) =>
    `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csvLines = [
    headers.join(','),
    ...errorRows.map((r) =>
      [
        r.rowNumber, escape(r.Email), escape(r.FirstName), escape(r.LastName),
        escape(r.EmployeeID), escape(r.DepartmentNodeCode), escape(r.PrimaryManagerEmail),
        escape(r.RoleFamilyCode), escape(r.JobLevelCode), escape(r.EmploymentType),
        escape(r.JoiningDate), escape(r.EmployeeStatus),
        'Error', escape(r.errors.join('; ')),
      ].join(',')
    ),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'error_report.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── TypeScript Interfaces ─────────────────────────────────────────────────────
interface CsvDropzoneProps { onFileAccepted: (file: File) => void; }
interface UploadedFilePreviewProps { file: File; onRemove: () => void; }

// ─── Drag-and-drop / file-input component ─────────────────────────────────────
function CsvDropzone({ onFileAccepted }: CsvDropzoneProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!file) return 'No file selected.';
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv')
      return 'Only CSV files are accepted.';
    if (file.size > 5 * 1024 * 1024) return 'File exceeds the 5 MB limit.';
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) { setError(err); return; }
      setError('');
      onFileAccepted(file);
    },
    [onFileAccepted],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile],
  );
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file - drag and drop or click to browse"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[12px] py-[48px] transition-colors select-none ring-1 ring-inset
          ${isDragging
            ? 'bg-surface-low ring-primary/20'
            : 'bg-surface-lowest ring-on-surface/10 hover:bg-surface-low hover:ring-primary/15'}`}
      >
        <div className="mb-[24px] flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[12px] bg-secondary/15 text-primary">
          <IconUpload className="h-[32px] w-[32px]" />
        </div>
        <h3 className="mb-[8px] text-[18px] font-bold text-on-surface">
          {isDragging ? 'Drop your CSV here' : 'Drag and drop your CSV file here'}
        </h3>
        <p className="mb-[24px] text-[13px] text-on-surface-variant">or click to browse your local files</p>
        <p className="text-[11px] font-bold tracking-wider text-on-surface-muted uppercase">CSV ONLY - MAX 5MB</p>
      </div>
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={onInputChange} aria-hidden="true" />
      {error && <p className="mt-[8px] text-[12px] font-semibold text-error">{error}</p>}
    </div>
  );
}

// ─── Uploaded file preview ─────────────────────────────────────────────────────
function UploadedFilePreview({ file, onRemove }: UploadedFilePreviewProps) {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  return (
    <div className="flex items-center justify-between rounded-[8px] border-l-[4px] border-[#00607A] bg-[#F8F9FB] p-[16px] shadow-sm">
      <div className="flex items-center gap-[16px]">
        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[#FFFFFF] text-[#0090B5] shadow-[0_2px_8px_-2px_rgba(33,33,33,0.06)]">
          <IconFileText className="h-[20px] w-[20px]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-bold text-[#212121]">{file.name}</span>
          <div className="mt-[4px] flex items-center gap-[8px]">
            <span className="rounded-[4px] bg-[#E2F7FD] px-[6px] py-[2px] text-[10px] font-bold tracking-wider text-[#00607A]">READY TO UPLOAD</span>
            <span className="text-[11px] font-semibold text-[#8E8E93]">- {sizeMB} MB</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove file"
        className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[#D12B2B] transition-colors hover:bg-[#FCE8E8]"
      >
        <IconTrash className="h-[16px] w-[16px]" />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BulkImportWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedEntity, setSelectedEntity] = useState('employees');
  const [proceedWithValidOnly, setProceedWithValidOnly] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Valid' | 'Error'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Import / Step-5 state
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportJobResult | null>(null);
  const [importProgress, setImportProgress] = useState<ImportJobStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // Validate & Upload (Step 3 to 4)
  const handleValidateAndUpload = async () => {
    if (!uploadedFile) return;

    setIsValidating(true);
    setValidationResult(null);
    setImportResult(null);
    setImportProgress(null);
    setImportError(null);

    try {
      const apiResult: ApiValidationResult = await uploadAndValidateCsv(uploadedFile);
      const rows: ValidationRow[] = apiResult.rows.map((r: ApiValidationRow) => ({
        rowNumber:           r.rowNumber,
        Email:               r.email,
        FirstName:           r.firstName,
        LastName:            r.lastName,
        EmployeeID:          r.employeeID,
        DepartmentNodeCode:  r.departmentNodeCode,
        PrimaryManagerEmail: r.primaryManagerEmail,
        RoleFamilyCode:      r.roleFamilyCode,
        JobLevelCode:        r.jobLevelCode,
        EmploymentType:      r.employmentType,
        JoiningDate:         r.joiningDate,
        EmployeeStatus:      r.employeeStatus,
        status:              r.status,
        errors:              r.errors,
      }));
      setValidationResult({
        jobId:      apiResult.jobId,
        totalRows:  apiResult.totalRows,
        validCount: apiResult.validCount,
        errorCount: apiResult.errorCount,
        rows,
      });
    } catch (apiErr: unknown) {
      console.warn(
        'API validation failed, falling back to client-side validation:',
        apiErr instanceof Error ? apiErr.message : apiErr,
      );
      const text = await uploadedFile.text();
      const result = parseAndValidateCsv(text);
      setValidationResult(result);
    }

    setIsValidating(false);
    setCurrentStep(4);
    setShowToast(true);
    setSearchQuery('');
    setFilterStatus('All');
    setCurrentPage(1);
  };

  // Confirm Import - Push to SharePoint PMSEmployees (Step 5)
  // Uses the jobId returned directly by confirmImport (guaranteed non-null by the API layer).
  //
  // FIX: pollRef was declared but never assigned, leaving importProgress permanently
  // null and the progress bar stuck at 0%. pollRef.current is now set to a real
  // setInterval after confirmImport resolves. Each 2-second tick calls
  // getImportJobStatus, drives setImportProgress (which feeds the bar and the
  // "Real-time update from server" row), and stops once the job reaches a terminal
  // state (Completed | Failed | processedCount >= totalCount).
  const handleConfirmImport = async () => {
    if (!validationResult || !uploadedFile) return;

    setIsImporting(true);
    setImportError(null);
    setImportResult(null);
    setImportProgress(null);
    setCurrentStep(5);

    // Clear any stale poll from a previous attempt before starting a new one
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    try {
      const validRowNumbers = validationResult.rows
        .filter((r) => r.status === 'Valid')
        .map((r) => r.rowNumber);

      const result = await confirmImport(uploadedFile, validRowNumbers);

      // confirmImport resolves once the job is accepted server-side.
      // Use the jobId returned by confirmImport — it is guaranteed to be a real
      // server-assigned ID (confirmImport throws if the server omits it).
      const jobId = result.jobId;

      // Start polling for live progress every 2 s
      pollRef.current = setInterval(async () => {
        try {
          const status = await getImportJobStatus(jobId);
          setImportProgress(status);

          // Use resolveProgressFromStatus so optional processedCount/totalCount
          // fields are safely defaulted to 0 regardless of API response shape.
          const { processedCount, totalCount } = resolveProgressFromStatus(status);
          const s = status.status.toLowerCase();
          const done =
            s === 'completed'     ||
            s === 'failed'        ||
            s === 'partialsuccess'||
            processedCount >= totalCount;

          if (done) {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setImportResult(result);
            setIsImporting(false);
          }
        } catch {
          // Non-fatal: keep polling; UI shows last known progress
        }
      }, 2_000);

    } catch (err) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setImportError(err instanceof Error ? err.message : 'Import failed. Please try again.');
      setIsImporting(false);
    }
  };

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleResetWizard = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setValidationResult(null);
    setImportResult(null);
    setImportError(null);
  };

  // Filtered + paginated rows
  const displayRows = (validationResult?.rows ?? []).filter((r) => {
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || r.Email.toLowerCase().includes(q) || r.FirstName.toLowerCase().includes(q) || r.LastName.toLowerCase().includes(q) || String(r.rowNumber).includes(q);
    return matchStatus && matchSearch;
  });
  const totalPages = Math.ceil(displayRows.length / PAGE_SIZE);
  const pagedRows = displayRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Resolve optional processedCount/totalCount from whichever shape the API returned.
  // resolveProgressFromStatus handles both flat fields and the nested `progress` object.
  const resolvedProgress = importProgress ? resolveProgressFromStatus(importProgress) : null;

  // Derived progress percentage for the Step-5 bar
  const progressPct = resolvedProgress
    ? Math.round((resolvedProgress.processedCount / Math.max(resolvedProgress.totalCount, 1)) * 100)
    : isImporting ? 0 : 100;

  return (
    <div className="bg-surface font-body text-on-surface flex min-h-screen flex-1 px-10 py-10 pb-24">
      <div className="flex w-full max-w-[960px] flex-col gap-[32px]">
        {/* Page Header */}
        <div className="-mb-2">
          <div className="mb-1.5 flex items-center gap-3">
            <h1 className="font-headline text-on-surface text-[26px] font-extrabold tracking-tight">
              Bulk Import Wizard
            </h1>
          </div>
          <div className="font-body text-on-surface-variant/60 flex items-center gap-1.5 text-[11px]">
            <span className="material-symbols-rounded text-[14px] leading-none">info</span>
            <span>Efficiently manage your organizational data through high-volume updates.</span>
          </div>
        </div>

        {/* Stepper Card */}
        <section className="rounded-[12px] bg-[#F3F3F6] px-[24px] py-[32px]">
          <nav aria-label="Progress">
            <ol role="list" className="relative flex w-full items-center justify-between">
              <div className="absolute top-[16px] right-[10%] left-[10%] z-0 h-[2px] bg-[#EBEBEE]" />
              {STEPS.map((step, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;
                return (
                  <li key={step} className="relative z-10 flex w-24 flex-1 flex-col items-center">
                    <div className="bg-[#F3F3F6] px-[12px]">
                      <span className={`flex h-[32px] w-[32px] items-center justify-center rounded-full shadow-sm transition-colors ${isCompleted || isCurrent ? 'bg-[#002D6A] text-[#FFFFFF]' : 'bg-[#EBEBEE] text-[#4A4A4A]'}`}>
                        <span className="font-body text-[14px] font-bold">{stepNum}</span>
                      </span>
                    </div>
                    <span className={`font-body mt-[12px] w-full text-center text-[12px] font-semibold whitespace-nowrap ${isCompleted || isCurrent ? 'text-[#212121]' : 'text-[#4A4A4A]'}`}>
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
        </section>

        {/* Step Content Wrapper */}
        <div className="flex flex-col gap-[16px]">
          <section className="flex flex-col gap-[40px] rounded-[12px] border border-[#EBEBEE] bg-[#FFFFFF] p-[40px] shadow-[0_8px_32px_-4px_rgba(33,33,33,0.06)]">

            {/* Step 1: Select Entity */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-[32px]">
                <div>
                  <h2 className="font-display text-[24px] font-bold tracking-tight text-[#212121]">Step 1: Choose Import Target</h2>
                  <p className="font-body mt-[4px] text-[14px] text-[#4A4A4A]">Select the type of data entity you wish to import or update in bulk.</p>
                </div>
                <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
                  <label className={`relative cursor-pointer rounded-xl border p-5 text-left transition-all duration-200 ${selectedEntity === 'employees' ? 'border-outline-variant/40 bg-primary-fixed/10' : 'border-outline-variant/[0.18] bg-surface-container-low hover:bg-surface-container'}`}>
                    <input type="radio" name="entity" value="employees" className="peer sr-only" checked={selectedEntity === 'employees'} onChange={(e) => setSelectedEntity(e.target.value)} />
                    <div className="absolute top-4 right-4">
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${selectedEntity === 'employees' ? 'border-primary' : 'border-outline-variant'}`}>
                        {selectedEntity === 'employees' && <div className="bg-primary h-2 w-2 rounded-full" />}
                      </div>
                    </div>
                    <div className="flex h-[120px] w-full flex-col justify-between">
                      <div className="flex w-full items-start justify-between">
                        <div className="bg-opacity-20 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[8px] bg-[#4AC6E9] text-[#0090B5]">
                          <IconEmployees className="h-[20px] w-[20px]" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body block text-[16px] font-bold text-[#212121]">Employees</span>
                        <span className="font-body mt-[4px] block text-[13px] text-[#4A4A4A]">Personnel records, roles, and personal details.</span>
                      </div>
                    </div>
                  </label>
                  <label className={`relative cursor-pointer rounded-xl border p-5 text-left transition-all duration-200 ${selectedEntity === 'departments' ? 'border-outline-variant/40 bg-primary-fixed/10' : 'border-outline-variant/[0.18] bg-surface-container-low hover:bg-surface-container'}`}>
                    <input type="radio" name="entity" value="departments" className="peer sr-only" checked={selectedEntity === 'departments'} onChange={(e) => setSelectedEntity(e.target.value)} />
                    <div className="absolute top-4 right-4">
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${selectedEntity === 'departments' ? 'border-primary' : 'border-outline-variant'}`}>
                        {selectedEntity === 'departments' && <div className="bg-primary h-2 w-2 rounded-full" />}
                      </div>
                    </div>
                    <div className="flex h-[120px] w-full flex-col justify-between">
                      <div className="flex w-full items-start justify-between">
                        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[8px] bg-[#EBEBEE] text-[#4A4A4A]">
                          <IconBuilding className="h-[20px] w-[20px]" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body block text-[16px] font-bold text-[#212121]">Departments</span>
                        <span className="font-body mt-[4px] block text-[13px] text-[#4A4A4A]">Org units, hierarchy, and cost centers.</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Download Template */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-[32px]">
                <div>
                  <h2 className="font-display text-[24px] font-bold tracking-tight text-[#212121]">Step 2: Download CSV Template</h2>
                  <p className="font-body mt-[4px] text-[14px] text-[#4A4A4A]">Download the pre-formatted CSV template below to prepare your organizational data for a bulk update.</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-[8px] py-[48px]">
                  <div className="bg-opacity-20 mb-[24px] flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[12px] bg-[#4AC6E9] text-[#0090B5]">
                    <IconFileText className="h-[32px] w-[32px]" />
                  </div>
                  <h3 className="font-display mb-[8px] text-[20px] font-bold text-[#212121]">Standard Organizational Template</h3>
                  <p className="font-body mb-[24px] text-[13px] text-[#4A4A4A]">CSV </p>
                  <button onClick={handleDownloadTemplate} className="flex items-center gap-[8px] rounded-[8px] bg-[#00607A] px-[24px] py-[10px] text-[14px] font-bold text-[#FFFFFF] shadow-sm transition-all hover:bg-[#0090B5]">
                    <IconDownload className="h-[16px] w-[16px]" />
                    <span>Download Template</span>
                  </button>
                </div>
                <div className="flex flex-col">
                  <div className="mb-[16px] flex items-center gap-[12px]">
                    <div className="h-[24px] w-[4px] bg-[#0090B5]"></div>
                    <h4 className="font-display text-[18px] font-bold text-[#212121]">Template Column Reference</h4>
                  </div>
                  <div className="w-full overflow-hidden rounded-[8px] border border-[#EBEBEE]">
                    <table className="w-full text-left text-[13px]">
                      <thead className="font-body bg-[#F3F3F6] text-[#4A4A4A]">
                        <tr>
                          {['Column Header', 'Description', 'Required', 'Format/Notes'].map((h) => (
                            <th key={h} className="px-[16px] py-[12px] text-[11px] font-bold tracking-wider uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-body divide-y divide-[#EBEBEE] bg-[#FFFFFF] text-[#212121]">
                        {[
                          ['Email',               'Unique email address',           'Required', '-'],
                          ['FirstName',           'Employee first name',            'Required', 'Max 100 chars'],
                          ['LastName',            'Employee last name',             'Required', 'Max 100 chars'],
                          ['EmployeeID',          'Internal payroll ID',            'Optional', 'Max 50 chars'],
                          ['DepartmentNodeCode',  'Organizational unit code',       'Required', 'Must match Org Node'],
                          ['PrimaryManagerEmail', "Reporting manager's email",      'Required', 'Entra ID sync'],
                          ['RoleFamilyCode',      'Code from Role Library',         'Required', 'Ref library'],
                          ['JobLevelCode',        'Code from Job Level Library',    'Required', 'Ref library'],
                          ['EmploymentType',      'Category of contract',           'Required', 'Permanent/Contract/Intern/Part-time'],
                          ['JoiningDate',         'Initial start date',             'Required', 'YYYY-MM-DD'],
                          ['EmployeeStatus',      'Current state of employment',    'Required', 'Active/Inactive/On Leave/Probation/Exited'],
                        ].map((row, i) => (
                          <tr key={i} className="transition-colors hover:bg-[#F8F9FB]">
                            <td className="px-[16px] py-[12px] font-mono text-[13px] font-medium text-[#0090B5]">{row[0]}</td>
                            <td className="px-[16px] py-[12px] text-[#4A4A4A]">{row[1]}</td>
                            <td className="px-[16px] py-[12px]">
                              {row[2] === 'Required'
                                ? <span className="font-bold text-[#212121]">Required</span>
                                : <span className="text-[#8E8E93]">Optional</span>}
                            </td>
                            <td className="px-[16px] py-[12px] text-[#4A4A4A] italic">{row[3]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Upload CSV */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-[32px]">
                <div>
                  <h2 className="text-[24px] font-bold tracking-tight text-[#212121]">Step 3: Upload CSV File</h2>
                  <p className="mt-[4px] text-[14px] text-[#4A4A4A]">Please provide the file containing your organisation's data. Only CSV format is supported at this stage.</p>
                </div>
                {!uploadedFile && <CsvDropzone onFileAccepted={setUploadedFile} />}
                {uploadedFile && <UploadedFilePreview file={uploadedFile} onRemove={() => setUploadedFile(null)} />}
              </div>
            )}

            {/* Step 4: Validation Results */}
            {currentStep === 4 && validationResult && (
              <div className="relative flex flex-col gap-[32px]">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[1fr_320px]">
                  <div className="flex items-center justify-between rounded-[12px] border border-[#EBEBEE] bg-white p-[24px] shadow-sm">
                    <div className="flex max-w-[60%] items-start gap-[16px]">
                      <div className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full shadow-sm text-white ${validationResult.errorCount > 0 ? 'bg-[#D12B2B]' : 'bg-[#16A34A]'}`}>
                        {validationResult.errorCount > 0
                          ? <span className="text-[16px] font-bold">!</span>
                          : <IconCheck className="h-[16px] w-[16px]" />}
                      </div>
                      <div>
                        <h3 className="mb-[4px] text-[18px] font-bold text-[#212121]">
                          {validationResult.errorCount > 0 ? 'Data Conflicts Detected' : 'All Rows Valid'}
                        </h3>
                        <p className="text-[13px] leading-relaxed text-[#4A4A4A]">
                          {validationResult.errorCount > 0
                            ? `We've identified errors in ${validationResult.errorCount} rows. Fix by re-uploading or proceed with valid rows only.`
                            : `All ${validationResult.totalRows} rows passed validation. Ready to import.`}
                        </p>
                        {validationResult.jobId ? (
                          <p className="mt-[6px] text-[11px] font-semibold text-[#00607A]">
                            Server validated - Job ID: {validationResult.jobId}
                          </p>
                        ) : (
                          <p className="mt-[6px] text-[11px] font-semibold text-[#8E8E93]">
                            Client validated - Will use known Job ID for import
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-[40px] border-l border-[#EBEBEE] pl-[40px]">
                      <div className="flex flex-col items-center">
                        <span className="text-[28px] font-black tracking-tight text-[#00607A]">{validationResult.validCount.toLocaleString()}</span>
                        <span className="text-[10px] font-bold tracking-wider text-[#4A4A4A] uppercase">VALID ROWS</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className={`text-[28px] font-black tracking-tight ${validationResult.errorCount > 0 ? 'text-[#D12B2B]' : 'text-[#16A34A]'}`}>{validationResult.errorCount}</span>
                        <span className="text-[10px] font-bold tracking-wider text-[#4A4A4A] uppercase">ERRORS</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps Card */}
                  <div className="flex flex-col justify-center gap-[12px] rounded-[12px] bg-[#002D6A] p-[24px] shadow-sm">
                    <span className="text-[10px] font-bold tracking-wider text-white/80 uppercase">NEXT STEPS</span>
                    {validationResult.errorCount > 0 && (
                      <button onClick={() => downloadErrorReport(validationResult.rows)} className="flex w-full items-center justify-center gap-[8px] rounded-[8px] bg-white px-[16px] py-[10px] text-[13px] font-bold text-[#002D6A] transition hover:bg-[#F8F9FB]">
                        <IconDownload className="h-[16px] w-[16px]" /> Download Error Report
                      </button>
                    )}
                    <button onClick={handleNext} className="flex w-full items-center justify-center gap-[8px] rounded-[8px] border border-white/30 px-[16px] py-[10px] text-[13px] font-bold text-white transition hover:bg-white/10">
                      <IconCheck className="h-[16px] w-[16px]" /> Confirm Import
                    </button>
                  </div>
                </div>

                {/* Detailed Results Table */}
                <div className="flex flex-col overflow-hidden rounded-[12px] border border-[#EBEBEE] bg-white shadow-sm">
                  <div className="bg-[#F8F9FB] p-[24px]">
                    <div className="mb-[16px] flex flex-wrap items-center justify-between gap-[12px]">
                      <h4 className="text-[16px] font-bold text-[#212121]">Detailed Results</h4>
                      <div className="flex items-center gap-[12px]">
                        <div className="flex rounded-[6px] border border-[#EBEBEE] bg-white overflow-hidden">
                          {(['All', 'Valid', 'Error'] as const).map((f) => (
                            <button key={f} onClick={() => { setFilterStatus(f); setCurrentPage(1); }} className={`px-[12px] py-[6px] text-[12px] font-semibold transition-colors ${filterStatus === f ? 'bg-[#002D6A] text-white' : 'text-[#4A4A4A] hover:bg-[#F3F3F6]'}`}>
                              {f}
                            </button>
                          ))}
                        </div>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[12px] text-[#8E8E93]">
                            <IconSearch className="h-[14px] w-[14px]" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search rows..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="h-[36px] w-[220px] rounded-[6px] border border-[#EBEBEE] bg-white pr-[12px] pl-[36px] text-[13px] text-[#212121] outline-none placeholder:text-[#8E8E93] focus:border-[#0090B5]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative w-full overflow-x-auto rounded-[8px] border border-[#EBEBEE] bg-white">
                      <table className="w-full text-left text-[13px]">
                        <thead className="border-b border-[#EBEBEE] text-[#4A4A4A]">
                          <tr>
                            {['ROW #', 'EMAIL', 'FIRST NAME', 'LAST NAME', 'VALIDATION STATUS', 'ERROR DETAILS'].map((h) => (
                              <th key={h} className="px-[16px] py-[14px] text-[11px] font-bold tracking-wider uppercase whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-[#212121]">
                          {pagedRows.length === 0 && (
                            <tr><td colSpan={6} className="py-[32px] text-center text-[13px] text-[#8E8E93]">No rows match your filter.</td></tr>
                          )}
                          {pagedRows.map((row) => (
                            <tr key={row.rowNumber} className="border-b border-[#EBEBEE] hover:bg-[#F8F9FB]">
                              <td className="px-[16px] py-[14px] font-medium">{row.rowNumber}</td>
                              <td className="px-[16px] py-[14px] text-[#4A4A4A]">{row.Email || '-'}</td>
                              <td className="px-[16px] py-[14px] text-[#4A4A4A] whitespace-nowrap">{row.FirstName || '-'}</td>
                              <td className="px-[16px] py-[14px] text-[#4A4A4A] whitespace-nowrap">{row.LastName || '-'}</td>
                              <td className="px-[16px] py-[14px]">
                                {row.status === 'Valid'
                                  ? <span className="inline-flex rounded-[4px] bg-[#EBEBEE] px-[6px] py-[2px] text-[11px] font-bold text-[#4A4A4A]">Valid</span>
                                  : <span className="inline-flex rounded-[4px] bg-[#FCE8E8] px-[6px] py-[2px] text-[11px] font-bold text-[#D12B2B]">Error</span>}
                              </td>
                              <td className="px-[16px] py-[14px] font-medium text-[#D12B2B] max-w-[280px]">
                                {row.errors.length > 0 ? row.errors.join('; ') : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-[16px] flex items-center justify-between text-[12px] text-[#4A4A4A]">
                      <span>Showing {displayRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, displayRows.length)} of {displayRows.length.toLocaleString()} rows</span>
                      <div className="flex items-center gap-[8px]">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="rounded-[6px] border border-[#EBEBEE] px-[10px] py-[4px] font-semibold disabled:opacity-40 hover:bg-[#F3F3F6]">Prev</button>
                        <span className="font-semibold">{currentPage} / {totalPages || 1}</span>
                        <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-[6px] border border-[#EBEBEE] px-[10px] py-[4px] font-semibold disabled:opacity-40 hover:bg-[#F3F3F6]">Next</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toast */}
                {showToast && validationResult.errorCount > 0 && (
                  <div className="absolute right-0 bottom-[-16px] flex w-[320px] items-start gap-[12px] rounded-[8px] bg-[#212121] p-[16px] text-white shadow-lg">
                    <div className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#0090B5]">
                      <IconCircle className="h-[12px] w-[12px]" />
                    </div>
                    <div className="flex flex-1 flex-col gap-[2px]">
                      <span className="text-[13px] font-bold">Validation Check Complete</span>
                      <span className="text-[12px] text-white/70">Please address the critical errors or toggle "Proceed with valid rows only" before confirming.</span>
                    </div>
                    <button onClick={() => setShowToast(false)} className="shrink-0 text-white/60 hover:text-white">
                      <IconX className="h-[14px] w-[14px]" />
                    </button>
                  </div>
                )}

                {/* Bottom bar */}
                <div className="flex items-center justify-between border-t border-[#EBEBEE] pt-[24px]">
                  <div className="flex items-center gap-[12px]">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={proceedWithValidOnly}
                      onClick={() => setProceedWithValidOnly((v) => !v)}
                      className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${proceedWithValidOnly ? 'bg-[#002D6A]' : 'bg-[#EBEBEE]'}`}
                    >
                      <span className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow ring-0 transition duration-200 ${proceedWithValidOnly ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-[#212121]">Proceed with valid rows only</span>
                      <span className="text-[12px] text-[#4A4A4A]">Ignore {validationResult.errorCount} error rows and import the remaining {validationResult.validCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <button onClick={handleBack} className="inline-flex items-center gap-[6px] rounded-[8px] px-[16px] py-[10px] text-[13px] font-bold text-[#212121] hover:bg-[#EBEBEE]">
                      <IconArrowLeft className="h-[14px] w-[14px]" /> Back
                    </button>
                    <button
                      onClick={() => { setUploadedFile(null); setValidationResult(null); setCurrentStep(3); }}
                      className="inline-flex items-center gap-[8px] rounded-[8px] border border-[#0090B5] px-[20px] py-[10px] text-[13px] font-bold text-[#0090B5] hover:bg-[#F3F3F6]"
                    >
                      <IconUploadIcon className="h-[16px] w-[16px]" /> Fix and Re-upload
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      disabled={validationResult.errorCount > 0 && !proceedWithValidOnly}
                      className={`inline-flex items-center gap-[8px] rounded-[8px] px-[24px] py-[10px] text-[13px] font-bold text-white transition-colors ${validationResult.errorCount === 0 || proceedWithValidOnly ? 'bg-[#002D6A] hover:bg-[#001942]' : 'cursor-not-allowed bg-[#8E8E93]'}`}
                    >
                      Confirm Import <IconCheck className="h-[16px] w-[16px]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirm & Import */}
            {currentStep === 5 && (
              <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[1fr_320px]">
                {/* Left Column */}
                <div className="flex flex-col gap-[24px]">
                  <div className="relative flex flex-col items-start overflow-hidden rounded-[12px] border border-[#EBEBEE] bg-[#FFFFFF] p-[32px] shadow-sm">
                    <IconCheck className="absolute -top-4 -right-4 h-[180px] w-[180px] text-[#F3F3F6]" />
                    <div className="relative z-10 w-full">

                      {/* Error state */}
                      {importError && (
                        <div className="mb-[24px] flex items-start gap-[12px] rounded-[8px] border border-[#D12B2B] bg-[#FCE8E8]/60 p-[16px]">
                          <IconAlertTriangle className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[#D12B2B]" />
                          <div>
                            <p className="text-[13px] font-bold text-[#D12B2B]">Import Failed</p>
                            <p className="text-[12px] text-[#D12B2B]/80">{importError}</p>
                          </div>
                        </div>
                      )}

                      {/* Not yet started */}
                      {!isImporting && !importResult && !importError && (
                        <>
                          <div className="mb-[16px] inline-flex items-center gap-[6px] rounded-full bg-[#E2F7FD] px-[12px] py-[4px] text-[#00607A]">
                            <IconInfo className="h-[12px] w-[12px]" />
                            <span className="font-body text-[10px] font-bold tracking-wider uppercase">FINAL VERIFICATION</span>
                          </div>
                          <h2 className="font-display mb-[12px] text-[28px] font-bold text-[#001942]">Ready to Finalize Import</h2>
                          <p className="font-body mb-[24px] max-w-[440px] text-[14px] leading-relaxed text-[#4A4A4A]">
                            You are about to import{' '}
                            <strong className="text-[#212121]">{(validationResult?.validCount ?? 0).toLocaleString()} employee records</strong>{' '}
                            into the <strong className="text-[#212121]">PMSEmployees</strong> SharePoint list.
                            Please review the skip summary before proceeding.
                          </p>
                          {validationResult && validationResult.errorCount > 0 && (
                            <div className="mb-[32px] flex items-start gap-[12px] rounded-[4px] border-l-[4px] border-[#D12B2B] bg-[#FCE8E8]/40 p-[16px]">
                              <IconAlertTriangle className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[#D12B2B]" />
                              <div className="flex flex-col gap-[4px]">
                                <span className="font-display text-[13px] font-bold text-[#D12B2B]">Skipping {validationResult.errorCount} rows with errors.</span>
                                <span className="font-body text-[12px] text-[#D12B2B]/80">These records contain validation errors and will not be imported.</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-[16px]">
                            <button
                              onClick={handleConfirmImport}
                              className="flex items-center justify-center gap-[8px] rounded-[8px] bg-[#001942] px-[24px] py-[12px] text-[14px] font-bold text-[#FFFFFF] transition-colors hover:bg-[#002D6A]"
                            >
                              <span>Confirm Import</span>
                              <IconArrowRight className="h-[16px] w-[16px]" />
                            </button>
                            <button
                              onClick={handleResetWizard}
                              className="flex items-center justify-center rounded-[8px] bg-[#EBEBEE] px-[24px] py-[12px] text-[14px] font-bold text-[#212121] transition-colors hover:bg-[#D4D4D8]"
                            >
                              Cancel Wizard
                            </button>
                          </div>
                        </>
                      )}

                      {/* Importing in progress */}
                      {isImporting && (
                        <>
                          <div className="mb-[16px] inline-flex items-center gap-[6px] rounded-full bg-[#E2F7FD] px-[12px] py-[4px] text-[#00607A]">
                            <div className="h-[8px] w-[8px] animate-pulse rounded-full bg-[#4AC6E9]" />
                            <span className="font-body text-[10px] font-bold tracking-wider uppercase">IMPORTING TO SHAREPOINT</span>
                          </div>
                          <h2 className="font-display mb-[4px] text-[24px] font-bold text-[#001942]">Uploading to PMSEmployees list...</h2>
                          <p className="font-body mb-[24px] text-[13px] text-[#4A4A4A]">Please do not close this window. Your data is being written to SharePoint.</p>
                          <div className="mb-[8px] flex items-center justify-between">
                            <span className="font-body text-[11px] text-[#4A4A4A]">Progress</span>
                            <span className="font-display text-[20px] font-black text-[#001942]">{progressPct}%</span>
                          </div>
                          {importProgress && resolvedProgress && (
                            <div className="mb-[4px] flex items-center justify-between">
                              <span className="font-body text-[11px] text-[#4A4A4A]">Real-time update from server</span>
                              <span className="font-body text-[10px] font-bold tracking-wider text-[#00607A] uppercase">
                                {resolvedProgress.processedCount.toLocaleString()} / {resolvedProgress.totalCount.toLocaleString()} PROCESSED
                              </span>
                            </div>
                          )}
                          <div className="mb-[16px] h-[8px] w-full overflow-hidden rounded-full bg-[#EBEBEE]">
                            <div className="h-full bg-[#00607A] transition-all duration-300" style={{ width: `${progressPct}%` }} />
                          </div>
                          <div className="flex items-center justify-between border-t border-[#EBEBEE] pt-[12px]">
                            <div className="flex items-center gap-[6px] text-[#4A4A4A]">
                              <IconHourglass className="h-[12px] w-[12px]" />
                              <span className="font-body text-[11px] italic">Processing... please do not close this window.</span>
                            </div>
                            {resolvedProgress?.estimatedSecondsRemaining != null && (
                              <span className="font-body text-[11px] text-[#4A4A4A] italic">
                                Est. remaining: {resolvedProgress.estimatedSecondsRemaining}s
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {/* Import Complete */}
                      {importResult && !isImporting && (
                        <>
                          <div className={`mb-[16px] inline-flex items-center gap-[6px] rounded-full px-[12px] py-[4px] ${importResult.status === 'Completed' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FCE8E8] text-[#D12B2B]'}`}>
                            <IconCheckCircle className="h-[12px] w-[12px]" fill="currentColor" color="white" />
                            <span className="font-body text-[10px] font-bold tracking-wider uppercase">
                              {importResult.status === 'Completed' ? 'IMPORT COMPLETE' : 'PARTIAL SUCCESS'}
                            </span>
                          </div>
                          <h2 className="font-display mb-[12px] text-[24px] font-bold text-[#001942]">
                            {importResult.status === 'Completed' ? 'Successfully imported to SharePoint' : 'Import finished with warnings'}
                          </h2>
                          <p className="font-body mb-[24px] text-[13px] text-[#4A4A4A]">
                            {importResult.message || 'Data has been pushed to the PMSEmployees list.'}
                          </p>
                          <div className="mb-[24px] flex items-center divide-x divide-[#FFFFFF] overflow-hidden rounded-[8px]">
                            <div className="flex flex-1 flex-col items-center bg-[#F8F9FB] py-[12px]">
                              <span className="font-display text-[20px] font-black text-[#212121]">{(importResult?.importedCount ?? 0).toLocaleString()}</span>
                              <span className="font-body text-[8px] font-bold tracking-wider text-[#4A4A4A] uppercase">IMPORTED</span>
                            </div>
                            <div className="flex flex-1 flex-col items-center bg-[#F8F9FB] py-[12px]">
                              <span className="font-display text-[20px] font-black text-[#00607A]">{(importResult?.skippedCount ?? 0).toLocaleString()}</span>
                              <span className="font-body text-[8px] font-bold tracking-wider text-[#4A4A4A] uppercase">SKIPPED</span>
                            </div>
                            <div className="flex flex-1 flex-col items-center bg-[#F8F9FB] py-[12px]">
                              <span className={`font-display text-[20px] font-black ${(importResult?.errorCount ?? 0) > 0 ? 'text-[#D12B2B]' : 'text-[#16A34A]'}`}>
                                {(importResult?.errorCount ?? 0).toLocaleString()}
                              </span>
                              <span className="font-body text-[8px] font-bold tracking-wider text-[#4A4A4A] uppercase">ERRORS</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Card - only shown while importing */}
                  {isImporting && (
                    <div className="flex flex-col rounded-[12px] border border-[#EBEBEE] bg-[#FFFFFF] p-[24px] shadow-[0_8px_32px_-4px_rgba(33,33,33,0.06)]">
                      <div className="mb-[12px] flex items-center gap-[8px]">
                        <div className="h-[10px] w-[10px] animate-pulse rounded-full bg-[#4AC6E9]" />
                        <span className="font-display text-[16px] font-bold text-[#212121]">Importing Records...</span>
                      </div>
                      <p className="font-body text-[12px] text-[#4A4A4A]">
                        Writing to <strong>PMSEmployees</strong> SharePoint list via{' '}
                        <span className="font-mono text-[#0090B5]">POST /import/jobs/{'{jobId}'}/confirm</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-[24px]">
                  {/* Result Summary Card */}
                  <div className="flex flex-col rounded-[12px] border border-[#EBEBEE] bg-[#FFFFFF] p-[24px] shadow-sm">
                    <div className="mb-[24px] flex items-start gap-[12px]">
                      <div className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full ${importResult ? 'bg-[#16A34A]' : isImporting ? 'bg-[#4AC6E9]' : 'bg-[#EBEBEE]'} text-[#4A4A4A]`}>
                        <IconCheckCircle className="h-[16px] w-[16px]" fill="currentColor" color="white" />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <span className="font-display text-[16px] font-bold text-[#212121]">
                          {importResult ? 'Bulk Import Complete' : isImporting ? 'Import Running...' : 'Awaiting Confirmation'}
                        </span>
                        <span className="font-body text-[11px] text-[#4A4A4A]">
                          Target list: <strong>PMSEmployees</strong> - Job: {validationResult?.jobId ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                    {importResult && (
                      <button
                        onClick={handleResetWizard}
                        className="flex w-full items-center justify-center gap-[8px] rounded-[8px] bg-[#00607A] px-[16px] py-[10px] text-[13px] font-bold text-[#FFFFFF] transition-colors hover:bg-[#0090B5]"
                      >
                        <span>Start New Import</span>
                        <IconArrowRight className="h-[14px] w-[14px]" />
                      </button>
                    )}
                  </div>

                  {/* Helpful Tips Card */}
                  <div className="flex flex-col rounded-[12px] bg-[#F3F3F6] p-[24px]">
                    <span className="font-display mb-[16px] text-[14px] font-bold text-[#212121]">Helpful Tips</span>
                    <div className="flex flex-col gap-[16px]">
                      <div className="flex items-start gap-[12px]">
                        <IconInfo className="mt-[2px] h-[14px] w-[14px] shrink-0 text-[#00607A]" />
                        <span className="font-body text-[12px] leading-relaxed text-[#4A4A4A]">New employees will receive their welcome emails at 08:00 AM UTC tomorrow.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Controls */}
            {currentStep === 1 && (
              <div className="flex items-center justify-end gap-[24px] pt-[24px]">
                <button type="button" className="font-body text-[14px] font-bold text-[#212121] hover:text-[#002D6A]">Cancel</button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 1 && !selectedEntity}
                  className="group inline-flex items-center justify-center gap-[8px] rounded-[8px] bg-[#001942] px-[24px] py-[10px] text-[14px] font-bold text-[#FFFFFF] shadow-sm transition-all hover:bg-[#002D6A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>Next</span>
                  <IconChevronRight className="h-[16px] w-[16px] transition-transform group-hover:translate-x-[4px]" />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="mx-[-40px] mt-[16px] mb-[-40px] flex items-center justify-between rounded-b-[12px] border-t border-[#EBEBEE] bg-[#F8F9FB] px-[40px] py-[24px]">
                <button type="button" onClick={handleBack} className="group inline-flex items-center justify-center gap-[8px] rounded-[8px] bg-transparent px-[24px] py-[10px] text-[14px] font-bold text-[#212121] transition-all hover:bg-[#EBEBEE]">
                  <IconArrowLeft className="h-[16px] w-[16px] transition-transform group-hover:-translate-x-[4px]" />
                  <span>Back</span>
                </button>
                <button type="button" onClick={handleNext} className="group inline-flex items-center justify-center gap-[8px] rounded-[8px] bg-[#001942] px-[24px] py-[10px] text-[14px] font-bold text-[#FFFFFF] shadow-sm transition-all hover:bg-[#002D6A]">
                  <span>Next</span>
                  <IconArrowRight className="h-[16px] w-[16px] transition-transform group-hover:translate-x-[4px]" />
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="mx-[-40px] mt-[16px] mb-[-40px] flex items-center justify-between rounded-b-[12px] border-t border-[#EBEBEE] bg-[#F8F9FB] px-[40px] py-[24px]">
                <button type="button" onClick={handleBack} className="group inline-flex items-center justify-center gap-[8px] rounded-[8px] bg-transparent px-[24px] py-[10px] text-[14px] font-bold text-[#212121] transition-all hover:bg-[#EBEBEE]">
                  <IconArrowLeft className="h-[16px] w-[16px] transition-transform group-hover:-translate-x-[4px]" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleValidateAndUpload}
                  disabled={!uploadedFile || isValidating}
                  className={`inline-flex items-center gap-[8px] rounded-[8px] px-[24px] py-[10px] text-[13px] font-bold text-white transition-colors ${uploadedFile && !isValidating ? 'bg-[#002D6A] hover:bg-[#001942]' : 'cursor-not-allowed bg-[#8E8E93]'}`}
                >
                  {isValidating ? (
                    <><IconUpload className="h-[16px] w-[16px] animate-spin" /> Validating...</>
                  ) : (
                    <><IconShieldCheck className="h-[16px] w-[16px]" /> Validate and Upload</>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* Pro Tip Box */}
          <div className={`flex items-center gap-[12px] rounded-[8px] border border-[#EBEBEE] p-[16px] ${currentStep === 3 ? 'bg-[#E2F7FD]/40' : currentStep === 4 ? 'border-[#FCE8E8] bg-[#FCE8E8]/40' : 'bg-[#F8F9FB]'}`}>
            {currentStep === 3 ? (
              <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#4AC6E9] text-[#FFFFFF]">
                <IconLightbulb className="h-[16px] w-[16px]" fill="currentColor" />
              </div>
            ) : currentStep === 4 ? (
              <div className="flex shrink-0 text-[#D12B2B]">
                <IconAlertOctagon className="h-[20px] w-[20px]" fill="currentColor" color="white" />
              </div>
            ) : (
              <div className="flex shrink-0 text-[#0090B5]">
                <IconInfo className="h-[20px] w-[20px]" fill="currentColor" color="white" />
              </div>
            )}
            <p className="font-body text-[13px] text-[#4A4A4A]">
              {currentStep === 1 && <><strong className="font-bold text-[#002D6A]">Pro Tip:</strong> Ensure your entity choice matches the column headers in your CSV file. If you have not prepared your file yet, you will be able to download a pre-formatted template in the next step.</>}
              {currentStep === 2 && <><strong className="font-bold text-[#002D6A]">Need help with mapping?</strong> Our system uses smart mapping to match headers, but using the official template minimizes validation errors in the next step.</>}
              {currentStep === 3 && <><strong className="font-bold text-[#002D6A]">Pro Tip: Header Matching.</strong> To ensure a seamless validation process, make sure your CSV column headers exactly match the template provided in Step 2.</>}
              {currentStep === 4 && <><strong className="font-bold text-[#D12B2B]">Warning: Strict Validation.</strong> If you choose to proceed with only the valid rows, you will not be able to import the skipped error rows later without a new file import.</>}
              {currentStep === 5 && <><strong className="font-bold text-[#002D6A]">SharePoint Target:</strong> All valid rows are being pushed to the <strong>PMSEmployees</strong> list. You can track progress above in real-time.</>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
