'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { StorageConfig, StorageBackend } from '@/types/storage';
import { cn } from '@/lib/utils';
import {
  getStorageConfig,
  testStorageConnection,
  saveStorageConfig,
  initialiseStorageSchema,
  initialiseStorageSchemaForList,
  getSchemaJobStatus,
  runHealthCheck,
  getStorageSchemaStatus,
  toSchemaStatus,
  type SaveSharePointConfigBody,
  type SaveStorageConfigBody,
} from '@/lib/api/storageConfig';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type EntityDisplayStatus = 'Exists' | 'Missing' | 'InProgress';
interface EntityDisplayItem {
  entity: string;
  target: string;
  status: EntityDisplayStatus;
}
interface SchemaDisplayResponse {
  isFullyProvisioned: boolean;
  entities: EntityDisplayItem[];
}

interface FormValidationState {
  missingFields: string[];
  invalidFields: string[];
  summaryItems: string[];
  fieldErrors: Partial<
    Record<
      | 'siteUrl'
      | 'tenantId'
      | 'clientId'
      | 'clientSecret'
      | 'serviceAccountUpn'
      | 'serviceAccountPassword'
      | 'listPrefix',
      string
    >
  >;
  message: string | null;
}

type SharePointFieldName =
  | 'siteUrl'
  | 'tenantId'
  | 'clientId'
  | 'clientSecret'
  | 'serviceAccountUpn'
  | 'serviceAccountPassword'
  | 'listPrefix';

interface SpFormState {
  siteUrl: string;
  authMethod: 'AppRegistration' | 'ServiceAccount';
  tenantId: string;
  clientId: string;
  clientSecret: string;
  serviceAccountUpn: string;
  serviceAccountPassword: string;
  listPrefix: string;
}

const DEFAULT_SP_FORM: SpFormState = {
  siteUrl: '',
  authMethod: 'AppRegistration',
  tenantId: '',
  clientId: '',
  clientSecret: '',
  serviceAccountUpn: '',
  serviceAccountPassword: '',
  listPrefix: '',
};

// ─────────────────────────────────────────────────────────────
// Design tokens (ambient shadow spec from design.md)
//   color : 6% opacity of on_surface (#1a1c1e)
//   blur  : 24–32 px  |  offset : vertical only
// ─────────────────────────────────────────────────────────────
const shadowAmbient = 'shadow-[0_8px_32px_rgba(26,28,30,0.06)]';
const shadowLifted = 'shadow-[0_16px_48px_rgba(26,28,30,0.08)]';
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHAREPOINT_ONLINE_SITE_PATTERN =
  /^https:\/\/[a-z0-9-]+\.sharepoint\.com\/sites\/[A-Za-z0-9._-]+\/?$/i;
const INVALID_SHAREPOINT_LIST_NAME_CHARS = /[\\/:*?"<>|#]/;

// ─────────────────────────────────────────────────────────────
// ActiveConfigCard
// Surface hierarchy: sits on surface → card is surface_container_lowest
// ─────────────────────────────────────────────────────────────
const ActiveConfigCard = ({
  config,
  onHealthCheck,
  isTesting,
}: {
  config: StorageConfig | null;
  onHealthCheck: () => void;
  isTesting: boolean;
}) => {
  const healthy = config?.health?.status === 'Healthy';
  const healthStatus = config?.health?.status;
  const statusTone = !healthStatus
    ? 'bg-surface-container-high text-on-surface-variant'
    : healthStatus === 'Healthy'
      ? 'bg-success-container text-success'
      : healthStatus === 'NotConfigured'
        ? 'bg-surface-container-high text-on-surface-variant'
        : 'bg-error-container text-on-error-container';

  const maskHost = (value?: string) => {
    if (!value) return 'Not configured';

    try {
      const host = new URL(value).host || value;
      const parts = host.split('.');
      if (parts.length <= 2) return host;
      return ['••••', ...parts.slice(1)].join('.');
    } catch {
      const parts = value.split('.');
      if (parts.length <= 2) return value;
      return ['••••', ...parts.slice(1)].join('.');
    }
  };

  const formatLastCheckedAt = (value?: string) => {
    if (!value) return 'Not yet checked';

    const timestamp = new Date(value);
    if (Number.isNaN(timestamp.getTime())) return 'Not yet checked';

    const minutesAgo = Math.round((timestamp.getTime() - Date.now()) / 60000);
    const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      minutesAgo,
      'minute',
    );

    return `${relative} (${timestamp.toLocaleString()})`;
  };

  const hasActiveConfig = !!config?.activeBackend;

  const summaryRows = !hasActiveConfig
    ? []
    : config?.activeBackend === 'AzureSQL'
      ? [
          { label: 'Server', value: maskHost(config.azureSql?.serverFqdn) },
          { label: 'Database', value: config.azureSql?.databaseName ?? 'Not configured' },
          {
            label: 'Auth',
            value:
              config.azureSql?.authMethod === 'SqlAuthentication'
                ? 'SQL Authentication'
                : 'Managed Identity',
          },
        ]
      : [
          { label: 'Site', value: maskHost(config?.sharePoint?.siteUrl) },
          { label: 'Prefix', value: config?.sharePoint?.listPrefix ?? 'Not configured' },
          {
            label: 'Auth',
            value:
              config?.sharePoint?.authMethod === 'ServiceAccount'
                ? 'Service Account'
                : 'App Registration',
          },
        ];

  return (
    <div
      className={cn(
        'bg-surface-container-lowest flex flex-col gap-6 rounded-2xl px-8 py-6 sm:flex-row sm:items-center',
        shadowAmbient,
      )}
    >
      {/* Icon — secondary_container tint, secondary icon */}
      <div className="bg-secondary-container/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
        <span className="material-symbols-rounded text-secondary text-[22px] leading-none">
          layers
        </span>
      </div>

      {/* Metadata */}
      <div className="min-w-0 flex-1">
        {/* Editorial lock-up: label-md uppercase 0.05rem tracking */}
        <p className="font-body text-on-surface-variant/50 mb-1.5 text-[9px] font-black tracking-[0.18em] uppercase">
          Active Configuration Summary
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-headline text-on-surface text-xl font-extrabold tracking-tight">
            {!hasActiveConfig
              ? 'No Configuration'
              : config?.activeBackend === 'SharePoint'
                ? 'SharePoint Lists'
                : 'Azure SQL Database'}
          </h2>
          {/* Status badge — Soft-Tint approach (design.md §5 Status Badges) */}
          {hasActiveConfig && (
            <span
              className={cn(
                'font-body flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                statusTone,
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  healthy
                    ? 'bg-success'
                    : healthStatus === 'NotConfigured' || !healthStatus
                      ? 'bg-on-surface-variant/60'
                      : 'bg-error',
                )}
              />
              {healthStatus ?? 'Not checked'}
            </span>
          )}
        </div>

        {/* Summary chips — surface_container for nested mono code */}
        <div className="mt-2.5 flex flex-col gap-1">
          {!hasActiveConfig ? (
            <p className="font-body text-on-surface-variant/60 text-[11px] italic">
              No storage backend has been configured yet. Select a backend and save to get started.
            </p>
          ) : (
            <>
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="font-body text-on-surface-variant/40 text-[9px] font-black tracking-[0.14em] uppercase">
                    {row.label}:
                  </span>
                  <code className="bg-surface-container text-on-surface-variant max-w-xs truncate rounded-lg px-2 py-0.5 font-mono text-[11px]">
                    {row.value}
                  </code>
                </div>
              ))}
              <p className="font-body text-secondary mt-0.5 text-[10px] font-semibold">
                Last Health Check: {formatLastCheckedAt(config?.health?.lastCheckedAt)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Re-run button — Secondary style (design.md): surface_container_highest, no border */}
      {hasActiveConfig && (
        <button
          onClick={onHealthCheck}
          disabled={isTesting}
          className="bg-surface-container-highest text-on-surface font-body hover:bg-surface-container-high flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold transition-colors disabled:opacity-50"
        >
          {isTesting ? (
            <span className="border-on-surface/20 border-t-on-surface h-4 w-4 animate-spin rounded-full border-2" />
          ) : (
            <span className="material-symbols-rounded text-[18px] leading-none">refresh</span>
          )}
          Re-run Health Check
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// BackendCard — selector card with radio affordance
// Ghost border is used here: interactive controls require boundary
// (design.md Ghost Border fallback for accessibility)
// ─────────────────────────────────────────────────────────────
const BackendCard = ({
  icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: string | React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={cn(
      'relative rounded-xl p-5 text-left transition-all duration-200',
      // Ghost border at outline_variant — 20% unselected, 40% selected (within 15–25% spec for unselected)
      'border',
      selected
        ? 'bg-primary-fixed/10 border-outline-variant/40'
        : 'bg-surface-container-low border-outline-variant/[0.18] hover:bg-surface-container',
    )}
  >
    {/* Radio circle — filled dot when selected */}
    <div className="absolute top-4 right-4">
      <div
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors',
          selected ? 'border-primary' : 'border-outline-variant',
        )}
      >
        {selected && <div className="bg-primary h-2 w-2 rounded-full" />}
      </div>
    </div>

    {typeof icon === 'string' ? (
      <span className="material-symbols-rounded text-primary mb-2.5 block text-[22px] leading-none">
        {icon}
      </span>
    ) : (
      <div className="mb-2.5 flex h-[22px] items-center">{icon}</div>
    )}
    <p className="font-headline text-on-surface mb-0.5 text-[13px] font-black">{title}</p>
    <p className="font-body text-on-surface-variant/60 text-[11px] leading-relaxed">
      {description}
    </p>
  </button>
);

// ─────────────────────────────────────────────────────────────
// Field wrapper — editorial lock-up label style
// ─────────────────────────────────────────────────────────────
const Field = ({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-body text-on-surface-variant/70 flex items-center gap-1 text-[9px] font-black tracking-[0.16em] uppercase">
      {label}
      {required && <span className="text-error">*</span>}
    </label>
    {children}
    {hint && (
      <p className="font-body text-on-surface-variant/50 text-[10px] leading-snug">{hint}</p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// TextInput — design.md input spec:
//   default : surface_container_low fill + ghost border (outline_variant/20)
//   focus   : secondary border + 4px secondary_fixed_dim glow at 20%
// ─────────────────────────────────────────────────────────────
const TextInput = ({
  type = 'text',
  className,
  value,
  defaultValue,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputProps = value !== undefined ? { value: value ?? '' } : { defaultValue };

  return (
    <div className="relative">
      <input
        {...inputProps}
        {...rest}
        type={isPassword && visible ? 'text' : type}
        className={cn(
          'bg-surface-container-low w-full rounded-xl px-3.5 py-2.5',
          'font-body text-on-surface placeholder:text-on-surface-variant/30 text-[13px]',
          'border-outline-variant/20 border transition-all outline-none',
          'focus:border-secondary focus:ring-secondary-fixed-dim/20 focus:ring-2',
          isPassword && 'pr-11',
          className,
        )}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-on-surface-variant/40 hover:text-on-surface-variant absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        >
          <span className="material-symbols-rounded text-[18px] leading-none">
            {visible ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SchemaStatusSidebar
// Surface hierarchy:
//   card   → surface_container_lowest
//   header → surface_container_low (tonal shift, no border)
//   cols   → surface_container_high (nested data, design.md §2)
//   rows   → no horizontal dividers (design.md §7 Don't)
// ─────────────────────────────────────────────────────────────
const SchemaStatusSidebar = ({
  schemaStatus,
  onInitialise,
  isInitialising,
  isConfigSaved,
}: {
  schemaStatus: SchemaDisplayResponse | null;
  onInitialise: (entity: string) => void;
  isInitialising: boolean;
  isConfigSaved: boolean;
}) => {
  if (!schemaStatus) return null;
  const hasIncomplete = schemaStatus.entities.some((e) => e.status !== 'Exists');

  // Status badges — Soft-Tint approach (design.md §5)
  const StatusBadge = ({ status, entity }: { status: EntityDisplayStatus; entity: string }) => {
    if (status === 'Exists')
      return (
        <span className="font-body text-secondary flex items-center gap-1.5 text-[9px] font-black tracking-[0.14em] uppercase">
          <span className="bg-secondary h-1.5 w-1.5 shrink-0 rounded-full" />
          Exists
        </span>
      );

    if (status === 'InProgress')
      return (
        // error_container re-purposed for attention (design.md §5 Warning)
        <span className="bg-error-container/50 text-on-error-container font-body flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.14em] uppercase">
          <span className="material-symbols-rounded animate-spin text-[12px] leading-none">
            sync
          </span>
          In Progress
        </span>
      );

    // Missing — error soft-tint + Initialise button
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="font-body text-error flex items-center gap-1.5 text-[9px] font-black tracking-[0.14em] uppercase">
          <span className="bg-error h-1.5 w-1.5 shrink-0 rounded-full" />
          Missing
        </span>
        {/* Primary button — gradient from primary to primary_container (design.md §5) */}
        <button
          onClick={() => isConfigSaved && onInitialise(entity)}
          disabled={isInitialising || !isConfigSaved}
          title={
            !isConfigSaved
              ? 'Save the configuration first before initialising the schema'
              : undefined
          }
          className={cn(
            'font-body text-on-primary rounded-lg px-2.5 py-1 text-[9px] font-black tracking-[0.12em] whitespace-nowrap uppercase',
            'from-primary to-primary-container bg-gradient-to-b',
            'transition-opacity hover:opacity-90 disabled:opacity-50',
            shadowAmbient,
          )}
        >
          Initialise Schema
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ACTION REQUIRED banner — error_container for attention (design.md §5 Warning badge) */}
      {hasIncomplete && (
        <div className="bg-error-container/70 flex items-center gap-2.5 rounded-xl px-4 py-3">
          <span className="material-symbols-rounded text-on-error-container shrink-0 text-[18px] leading-none">
            warning
          </span>
          <span className="font-body text-on-error-container text-[9px] leading-snug font-black tracking-[0.14em] uppercase">
            Action Required: Schema Incomplete
          </span>
        </div>
      )}

      {/* Schema Status card — surface_container_lowest lifted on surface background */}
      <div className={cn('bg-surface-container-lowest overflow-hidden rounded-2xl', shadowAmbient)}>
        {/* Card header — surface_container_low tonal shift (no border) */}
        <div className="bg-surface-container-low flex items-center justify-between gap-2.5 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-rounded text-secondary text-[18px] leading-none">
              schema
            </span>
            <span className="font-headline text-on-surface text-[11px] font-black tracking-[0.16em] uppercase">
              Schema Status
            </span>
          </div>
          {hasIncomplete && (
            <button
              onClick={() => isConfigSaved && onInitialise('*')}
              disabled={isInitialising || !isConfigSaved}
              title={
                !isConfigSaved
                  ? 'Save the configuration first before initialising the schema'
                  : undefined
              }
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5',
                'font-body text-on-primary text-[9px] font-black tracking-[0.12em] whitespace-nowrap uppercase',
                'from-primary to-primary-container bg-gradient-to-b',
                'transition-opacity hover:opacity-90 disabled:opacity-50',
                shadowAmbient,
              )}
            >
              <span className="material-symbols-rounded text-[13px] leading-none">schema</span>
              Setup Schema
            </button>
          )}
        </div>

        {/* Column headers — surface_container_high for nested data (design.md §2 Surface Hierarchy) */}
        <div className="bg-surface-container-high flex items-center justify-between px-5 py-2">
          <span className="font-body text-on-surface-variant/50 text-[8px] font-black tracking-[0.18em] uppercase">
            Entity Name
          </span>
          <span className="font-body text-on-surface-variant/50 text-[8px] font-black tracking-[0.18em] uppercase">
            Status
          </span>
        </div>

        {/* Entity rows — NO horizontal dividers (design.md §7 Don't) */}
        <div className="flex flex-col">
          {schemaStatus.entities.map((e, i) => (
            <div
              key={i}
              className="hover:bg-surface-container-low/50 flex items-center justify-between px-5 py-3.5 transition-colors"
            >
              <span className="font-body text-on-surface text-[12px] font-semibold">
                {e.entity}
              </span>
              <StatusBadge status={e.status} entity={e.entity} />
            </div>
          ))}
          {hasIncomplete && !isConfigSaved && (
            <div className="px-5 pb-4">
              <p className="font-body text-on-surface-variant/60 text-[10px] font-semibold italic">
                Save the configuration to enable schema initialisation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Migration Support — primary_container dark card */}
      <div
        className={cn(
          'bg-primary-container relative overflow-hidden rounded-2xl p-6',
          shadowAmbient,
        )}
      >
        {/* Subtle gradient texture */}
        <div className="from-secondary-container/10 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="bg-secondary-container/20 flex h-9 w-9 items-center justify-center rounded-xl">
            <span className="material-symbols-rounded text-secondary-container text-[18px] leading-none">
              info
            </span>
          </div>
          <div>
            {/* Headline on dark: text-on-primary (white) */}
            <h5 className="font-headline text-on-primary mb-2 text-[15px] font-extrabold tracking-tight">
              Migration Support
            </h5>
            {/* Body on dark: text-on-primary-container (light lavender, readable on navy) */}
            <p className="font-body text-on-primary-container text-[11px] leading-relaxed">
              Switching from SharePoint to Azure SQL can be automated using our Migration Wizard.
              All existing data is preserved.
            </p>
          </div>
          {/* Link — secondary_container (bright cyan) on dark navy */}
          <button className="font-body text-secondary-container hover:text-on-primary flex w-fit items-center gap-1.5 text-[9px] font-black tracking-[0.15em] uppercase transition-colors">
            Learn More
            <span className="material-symbols-rounded text-[14px] leading-none">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function StorageConfigPage() {
  const [config, setConfig] = useState<StorageConfig | null>(null);
  const [activeBackend, setActiveBackend] = useState<StorageBackend>('SharePoint');
  const [spForm, setSpForm] = useState<SpFormState>(DEFAULT_SP_FORM);
  const [etag, setEtag] = useState<string | null>(null);
  const [testToken, setTestToken] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latency?: number;
    error?: string;
  } | null>(null);
  const [schemaStatus, setSchemaStatus] = useState<SchemaDisplayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialising, setIsInitialising] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchAcknowledged, setSwitchAcknowledged] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [sharePointTouched, setSharePointTouched] = useState<Record<SharePointFieldName, boolean>>({
    siteUrl: false,
    tenantId: false,
    clientId: false,
    clientSecret: false,
    serviceAccountUpn: false,
    serviceAccountPassword: false,
    listPrefix: false,
  });
  const [hasAttemptedSharePointValidation, setHasAttemptedSharePointValidation] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const env = (process.env.NEXT_PUBLIC_APP_ENV ?? 'PROD') as string;
  const isEnvMismatch = env === 'PROD' && activeBackend === 'SharePoint';
  const hasValidatedCurrentConfig = !!testResult?.success && !!testToken;
  const isSharePointServiceAccount = spForm.authMethod === 'ServiceAccount';

  const sharePointValidation = useCallback((): FormValidationState => {
    const missingFields: string[] = [];
    const invalidFields: string[] = [];
    const fieldErrors: FormValidationState['fieldErrors'] = {};

    if (!spForm.siteUrl.trim()) {
      missingFields.push('SharePoint Site URL');
      fieldErrors.siteUrl = 'SharePoint Site URL is required';
    }
    if (!spForm.listPrefix.trim()) {
      missingFields.push('List Name Prefix');
      fieldErrors.listPrefix = 'List Name Prefix is required';
    }

    if (isSharePointServiceAccount) {
      if (!spForm.serviceAccountUpn.trim()) {
        missingFields.push('Username');
        fieldErrors.serviceAccountUpn = 'Username is required';
      }
      if (
        !spForm.serviceAccountPassword.trim() &&
        config?.sharePoint?.authMethod !== 'ServiceAccount'
      ) {
        missingFields.push('Password');
        fieldErrors.serviceAccountPassword = 'Password is required';
      }
    } else {
      if (!spForm.tenantId.trim()) {
        missingFields.push('Tenant ID');
        fieldErrors.tenantId = 'Tenant ID is required';
      }
      if (!spForm.clientId.trim()) {
        missingFields.push('Client ID');
        fieldErrors.clientId = 'Client ID is required';
      }
      if (!spForm.clientSecret.trim() && !config?.sharePoint) {
        missingFields.push('Client Secret');
        fieldErrors.clientSecret = 'Client Secret is required';
      }
    }

    if (spForm.siteUrl.trim() && !SHAREPOINT_ONLINE_SITE_PATTERN.test(spForm.siteUrl.trim())) {
      const message =
        'Use the SharePoint Online format: https://contoso.sharepoint.com/sites/site-name';
      invalidFields.push(`SharePoint Site URL: ${message}`);
      fieldErrors.siteUrl = message;
    }

    if (
      !isSharePointServiceAccount &&
      spForm.tenantId.trim() &&
      !GUID_PATTERN.test(spForm.tenantId.trim())
    ) {
      const message = 'Tenant ID must be a valid GUID';
      invalidFields.push(message);
      fieldErrors.tenantId = message;
    }

    if (
      !isSharePointServiceAccount &&
      spForm.clientId.trim() &&
      !GUID_PATTERN.test(spForm.clientId.trim())
    ) {
      const message = 'Client ID must be a valid GUID';
      invalidFields.push(message);
      fieldErrors.clientId = message;
    }

    if (
      spForm.listPrefix.trim() &&
      INVALID_SHAREPOINT_LIST_NAME_CHARS.test(spForm.listPrefix.trim())
    ) {
      const message = 'List Name Prefix cannot contain \\ / : * ? " < > | or #';
      invalidFields.push(message);
      fieldErrors.listPrefix = message;
    }

    return {
      missingFields,
      invalidFields,
      summaryItems: [...missingFields.map((field) => `${field} is required`), ...invalidFields],
      fieldErrors,
      message:
        missingFields.length > 0 || invalidFields.length > 0
          ? [
              missingFields.length > 0
                ? `Complete the required fields before testing: ${missingFields.join(', ')}.`
                : null,
              ...invalidFields,
            ]
              .filter(Boolean)
              .join(' ')
          : null,
    };
  }, [config?.sharePoint, isSharePointServiceAccount, spForm]);

  const currentSharePointValidation = sharePointValidation();
  const canTestSharePointConnection =
    activeBackend === 'SharePoint' &&
    currentSharePointValidation.missingFields.length === 0 &&
    currentSharePointValidation.invalidFields.length === 0;
  const shouldShowSharePointFieldError = useCallback(
    (field: SharePointFieldName) =>
      Boolean(currentSharePointValidation.fieldErrors[field]) &&
      (sharePointTouched[field] || hasAttemptedSharePointValidation),
    [currentSharePointValidation.fieldErrors, hasAttemptedSharePointValidation, sharePointTouched],
  );
  const markSharePointFieldTouched = useCallback((field: SharePointFieldName) => {
    setSharePointTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await getStorageConfig();
        if (cancelled) return;
        if (loaded) {
          setConfig(loaded);
          setEtag(loaded.etag ?? null);
          setActiveBackend(loaded.activeBackend);
          if (loaded.sharePoint) {
            setSpForm({
              siteUrl: loaded.sharePoint.siteUrl,
              authMethod: loaded.sharePoint.authMethod as SpFormState['authMethod'],
              tenantId: loaded.sharePoint.tenantId ?? '',
              clientId: loaded.sharePoint.clientId ?? '',
              clientSecret: '', // never pre-fill the secret; backend returns "****"
              serviceAccountUpn: loaded.sharePoint.serviceAccountUpn ?? '',
              serviceAccountPassword: '', // never pre-fill the password; backend should return masked
              listPrefix: loaded.sharePoint.listPrefix,
            });
          }

          // Load schema status for the active saved configuration so the
          // sidebar is visible immediately without requiring a test connection.
          if (loaded.activeBackend) {
            try {
              const schemaCheck = await getStorageSchemaStatus();
              if (!cancelled) {
                setSchemaStatus({
                  isFullyProvisioned: schemaCheck.missingCount === 0,
                  entities: schemaCheck.schemaStatus.map((e) => ({
                    entity: e.entity,
                    target: e.storeName,
                    status: e.exists ? 'Exists' : 'Missing',
                  })),
                });
              }
            } catch {
              // Schema status is non-critical on load; sidebar simply stays hidden.
            }
          }
        }
      } catch (err) {
        if (!cancelled)
          setApiError(
            `Failed to load storage configuration. ${err instanceof Error ? err.message : String(err)}`,
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const resetConnectionValidation = useCallback(() => {
    setTestToken(null);
    setTestResult(null);
    setSchemaStatus(null);
  }, []);

  const buildSpBody = useCallback(
    (confirm = false): SaveStorageConfigBody => ({
      backend: 'sharepoint',
      confirmBackendSwitch: confirm,
      config: {
        sharePoint: {
          siteUrl: spForm.siteUrl,
          authMethod:
            spForm.authMethod === 'AppRegistration' ? 'app_registration' : 'service_account',
          tenantId: spForm.authMethod === 'AppRegistration' ? spForm.tenantId : '',
          clientId: spForm.authMethod === 'AppRegistration' ? spForm.clientId : '',
          clientSecret: spForm.authMethod === 'AppRegistration' ? spForm.clientSecret : '',
          serviceAccountUpn: spForm.authMethod === 'ServiceAccount' ? spForm.serviceAccountUpn : '',
          serviceAccountPassword:
            spForm.authMethod === 'ServiceAccount' ? spForm.serviceAccountPassword : '',
          listPrefix: spForm.listPrefix,
        } satisfies SaveSharePointConfigBody,
      },
    }),
    [spForm],
  );

  const updateSpForm = useCallback(
    (updater: (prev: SpFormState) => SpFormState) => {
      resetConnectionValidation();
      setSpForm(updater);
    },
    [resetConnectionValidation],
  );

  const handleBackendSelect = useCallback(
    (backend: StorageBackend) => {
      if (backend === activeBackend) return;
      resetConnectionValidation();
      setActiveBackend(backend);
    },
    [activeBackend, resetConnectionValidation],
  );

  // ── Test Connection ───────────────────────────────────────────────────────
  const handleTestConnection = useCallback(async () => {
    if (activeBackend !== 'SharePoint') return;
    setHasAttemptedSharePointValidation(true);
    const validation = sharePointValidation();
    if (validation.message) {
      setApiError(validation.message);
      setTestResult(null);
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    setApiError(null);
    try {
      const res = await testStorageConnection(buildSpBody());
      setTestToken(res.testToken ?? null);
      setTestResult({
        success: res.success,
        latency: res.latencyMs ?? undefined,
        error: res.error ?? undefined,
      });
      if (res.success && res.schemaStatus) {
        const mapped = toSchemaStatus(res.schemaStatus);
        setSchemaStatus({
          isFullyProvisioned: mapped.isFullyProvisioned,
          entities: mapped.entities.map((e) => ({
            entity: e.entity,
            target: e.target,
            status: e.exists ? 'Exists' : 'Missing',
          })),
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unexpected error.',
      });
    } finally {
      setIsTesting(false);
    }
  }, [activeBackend, buildSpBody, sharePointValidation]);

  // ── Health Check ──────────────────────────────────────────────────────────
  const handleHealthCheck = useCallback(async () => {
    setIsHealthChecking(true);
    setApiError(null);
    try {
      const result = await runHealthCheck();
      setConfig((prev) =>
        prev
          ? {
              ...prev,
              health: {
                status:
                  result.status === 'healthy'
                    ? 'Healthy'
                    : result.status === 'unreachable'
                      ? 'Unreachable'
                      : 'NotConfigured',
                latencyMs: result.latencyMs ?? undefined,
                lastCheckedAt: result.checkedAt ?? result.lastCheckedAt ?? new Date().toISOString(),
              },
            }
          : prev,
      );
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Health check failed.');
    } finally {
      setIsHealthChecking(false);
    }
  }, []);

  // ── Schema Initialise ─────────────────────────────────────────────────────
  const handleInitialise = useCallback(async (entity: string) => {
    setIsInitialising(true);
    setApiError(null);
    const shouldInitialiseAll = entity === '*';

    // Mark the target entity, or all missing entities, as in progress.
    setSchemaStatus((prev) =>
      prev
        ? {
            ...prev,
            entities: prev.entities.map((e) =>
              e.status === 'Missing' && (shouldInitialiseAll || e.entity === entity)
                ? { ...e, status: 'InProgress' as EntityDisplayStatus }
                : e,
            ),
          }
        : prev,
    );
    try {
      const { jobId } = shouldInitialiseAll
        ? await initialiseStorageSchema()
        : await initialiseStorageSchemaForList(entity);
      // Poll until completed or failed
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const job = await getSchemaJobStatus(jobId);
          if (job.status === 'completed' || job.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setSchemaStatus((prev) =>
              prev
                ? {
                    ...prev,
                    isFullyProvisioned: job.failed.length === 0 && job.skipped.length === 0,
                    entities: prev.entities.map((e) => {
                      if (job.created.some((c) => c.entity === e.entity))
                        return { ...e, status: 'Exists' };
                      if (job.failed.some((f) => f.entity === e.entity))
                        return { ...e, status: 'Missing' };
                      if (job.skipped.some((s) => s.entity === e.entity))
                        return { ...e, status: 'Exists' };
                      return e;
                    }),
                  }
                : prev,
            );
            setIsInitialising(false);
          }
        } catch {
          if (pollRef.current) clearInterval(pollRef.current);
          setIsInitialising(false);
        }
      }, 2000);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Schema initialisation failed.');
      // Revert optimistic update for the target entity, or all missing entities.
      setSchemaStatus((prev) =>
        prev
          ? {
              ...prev,
              entities: prev.entities.map((e) =>
                e.status === 'InProgress' && (shouldInitialiseAll || e.entity === entity)
                  ? { ...e, status: 'Missing' as EntityDisplayStatus }
                  : e,
              ),
            }
          : prev,
      );
      setIsInitialising(false);
    }
  }, []);

  // ── Save Config ───────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (confirmed = false) => {
      if (activeBackend === 'SharePoint') {
        setHasAttemptedSharePointValidation(true);
      }
      if (config?.activeBackend !== activeBackend && !confirmed && !switchAcknowledged) {
        setShowSwitchModal(true);
        return;
      }
      if (!hasValidatedCurrentConfig) {
        setApiError(
          'A successful connection test is required before saving. Click "Test Connection" first.',
        );
        return;
      }
      setShowSwitchModal(false);
      setSwitchAcknowledged(false);
      setIsSaving(true);
      setApiError(null);
      try {
        if (activeBackend === 'SharePoint') {
          const body = buildSpBody(confirmed || config?.activeBackend !== activeBackend);
          const saved = await saveStorageConfig(body, etag, testToken);
          setEtag(saved.etag);
          // Refresh config metadata and sharePoint details to reflect saved state
          setConfig((prev) => ({
            ...(prev ?? {}),
            activeBackend: 'SharePoint' as StorageBackend,
            lastSavedAt: saved.lastSavedAt ?? undefined,
            lastSavedBy: saved.lastSavedBy ?? undefined,
            sharePoint: {
              siteUrl: spForm.siteUrl,
              authMethod: spForm.authMethod,
              tenantId: spForm.authMethod === 'AppRegistration' ? spForm.tenantId : undefined,
              clientId: spForm.authMethod === 'AppRegistration' ? spForm.clientId : undefined,
              serviceAccountUpn:
                spForm.authMethod === 'ServiceAccount' ? spForm.serviceAccountUpn : undefined,
              listPrefix: spForm.listPrefix,
            },
          }));
        }
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === 'TEST_CONNECTION_REQUIRED') {
          setApiError(
            'A successful connection test is required before saving. Click "Test Connection" first.',
          );
        } else if (code === 'LIST_PREFIX_IMMUTABLE') {
          setApiError('The list name prefix cannot be changed after the initial configuration.');
        } else if (code === 'PRECONDITION_FAILED') {
          setApiError(
            'Another user has modified the configuration. Please reload to get the latest version.',
          );
        } else {
          setApiError(err instanceof Error ? err.message : 'Failed to save configuration.');
        }
      } finally {
        setIsSaving(false);
      }
    },
    [
      activeBackend,
      buildSpBody,
      config?.activeBackend,
      etag,
      hasValidatedCurrentConfig,
      switchAcknowledged,
      testToken,
    ],
  );

  // Cleanup polling on unmount
  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    [],
  );

  if (isLoading)
    return (
      <div className="bg-surface flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );

  // Environment badge — Soft-Tint (design.md §5 Status Badges)
  // WCAG 2.1 AA requires ≥4.5:1 for text this small (9px).
  // ❌ OLD: PROD used text-secondary (#4AC6E9) on bg-secondary/10 (~#e2eff5) → 1.70:1 (FAILS)
  // ❌ OLD: DEV used bg-primary-fixed/30 (~#eaf3f8) — barely distinguishable from page surface
  // ✅ FIX: both use dark on-colour text against a soft tinted background
  //   DEV  → bg-primary/[0.12]   + text-primary          = 9.55:1  ✓
  //   PROD → bg-secondary/[0.12] + text-on-secondary      = 11.16:1 ✓
  const envBadgeCls =
    env === 'PROD' ? 'bg-secondary/[0.12] text-on-secondary' : 'bg-primary/[0.12] text-primary';

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-24">
      <div className="px-10 py-10">
        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="mb-1.5 flex items-center gap-3">
            {/* headline-lg anchor (design.md §3 Typography) */}
            <h1 className="font-headline text-on-surface text-[26px] font-extrabold tracking-tight">
              Storage Configuration
            </h1>
            <span
              className={cn(
                'font-body rounded-lg px-2.5 py-1 text-[9px] font-black tracking-[0.18em] uppercase',
                envBadgeCls,
              )}
            >
              {env}
            </span>
          </div>
          {/* label-md subtitle — editorial lock-up (design.md §3) */}
          <div className="font-body text-on-surface-variant/60 flex items-center gap-1.5 text-[11px]">
            <span className="material-symbols-rounded text-[14px] leading-none">schedule</span>
            <span>
              {config?.lastSavedAt
                ? `Configuration last saved ${new Intl.RelativeTimeFormat('en', {
                    numeric: 'auto',
                  }).format(
                    Math.round((new Date(config.lastSavedAt).getTime() - Date.now()) / 60000),
                    'minute',
                  )}`
                : 'No configuration saved yet'}
            </span>
            <span className="mx-0.5 opacity-30">·</span>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Audit trail — coming soon"
              className="text-secondary flex items-center gap-1 font-semibold underline-offset-2 opacity-50 cursor-not-allowed"
            >
              View Audit Trail
              <span className="material-symbols-rounded text-[11px] leading-none">open_in_new</span>
            </button>
          </div>
        </div>

        {/* ── API Error Banner ─────────────────────────────────────── */}
        {apiError && (
          <div className="bg-error-container mb-6 flex items-center gap-3 rounded-xl px-5 py-3.5">
            <span className="material-symbols-rounded text-on-error-container shrink-0 text-[18px] leading-none">
              error
            </span>
            <p className="font-body text-on-error-container flex-1 text-[12px] font-semibold">
              {apiError}
            </p>
            <button
              onClick={() => setApiError(null)}
              className="text-on-error-container/60 hover:text-on-error-container transition-colors"
            >
              <span className="material-symbols-rounded text-[16px] leading-none">close</span>
            </button>
          </div>
        )}

        {/* ── Active Config Card ───────────────────────────────────── */}
        <div className="mb-8">
          <ActiveConfigCard
            config={config}
            onHealthCheck={handleHealthCheck}
            isTesting={isHealthChecking}
          />
        </div>

        {/* ── Main Grid: 8-col form + 4-col sidebar ───────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ╔══ Left — Form Panel (8 cols) ══════════════════════════╗ */}
          <div className="lg:col-span-8">
            <div
              className={cn(
                'bg-surface-container-lowest overflow-hidden rounded-2xl',
                shadowAmbient,
              )}
            >
              {/* Form panel header — surface_container_low tonal shift (no border) */}
              <div className="bg-surface-container-low rounded-t-2xl px-8 pt-7 pb-6">
                <h2 className="font-headline text-on-surface text-[15px] font-extrabold">
                  Storage Backend Selection
                </h2>
                <p className="font-body text-on-surface-variant/60 mt-0.5 text-[12px]">
                  Select the primary database provider for your organizational data.
                </p>
              </div>

              <div className="flex flex-col gap-7 px-8 py-7">
                {/* Backend selector cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <BackendCard
                    icon={
                      <img
                        src="/Icons/sharepoint-online.svg"
                        alt="SharePoint Online"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    }
                    title="SharePoint Lists"
                    description="Fast setup, integrated with M365 ecosystems."
                    selected={activeBackend === 'SharePoint'}
                    onSelect={() => handleBackendSelect('SharePoint')}
                  />
                  <BackendCard
                    icon={
                      <img
                        src="/Icons/azure-sql.svg"
                        alt="Azure SQL Database"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    }
                    title="Azure SQL"
                    description="Enterprise scale, high performance, relational queries."
                    selected={activeBackend === 'AzureSQL'}
                    onSelect={() => handleBackendSelect('AzureSQL')}
                  />
                </div>

                {/* Environment mismatch warning
                    Design.md §5: Warning = on_error_container on error_container (re-purposed for attention) */}
                {isEnvMismatch && (
                  <div className="bg-error-container flex items-start gap-3 rounded-xl p-4">
                    <span className="material-symbols-rounded text-on-error-container mt-0.5 shrink-0 text-[20px] leading-none">
                      warning
                    </span>
                    <p className="font-body text-on-error-container text-[12px] leading-relaxed font-semibold">
                      SharePoint Lists are not recommended for production. Azure SQL provides the
                      scale, consistency, and query performance required for production workloads.
                    </p>
                  </div>
                )}

                {/* ── SharePoint form fields ─────────────────────── */}
                {activeBackend === 'SharePoint' ? (
                  <div className="flex flex-col gap-5">
                    <Field
                      label="SharePoint Site URL"
                      required
                      hint={currentSharePointValidation.fieldErrors.siteUrl}
                    >
                      <TextInput
                        value={spForm.siteUrl}
                        onChange={(e) => updateSpForm((f) => ({ ...f, siteUrl: e.target.value }))}
                        onBlur={() => markSharePointFieldTouched('siteUrl')}
                        placeholder="https://contoso.sharepoint.com/sites/pms-dev"
                        inputMode="url"
                        autoCapitalize="none"
                        autoCorrect="off"
                        aria-invalid={shouldShowSharePointFieldError('siteUrl')}
                        className={cn(
                          shouldShowSharePointFieldError('siteUrl') &&
                            'border-error bg-error-container/35 focus:border-error focus:ring-error/20',
                        )}
                      />
                    </Field>

                    <Field label="Authentication Method">
                      <div className="mt-0.5 flex gap-6">
                        {(
                          [
                            {
                              value: 'AppRegistration' as const,
                              label: 'App Registration (Client Credentials)',
                            },
                            {
                              value: 'ServiceAccount' as const,
                              label: 'Managed Identity (Username & Password)',
                            },
                          ] as const
                        ).map((opt) => (
                          <label
                            key={opt.value}
                            className="flex cursor-pointer items-center gap-2 select-none"
                          >
                            <input
                              type="radio"
                              name="auth"
                              checked={spForm.authMethod === opt.value}
                              onChange={() =>
                                updateSpForm((f) => ({ ...f, authMethod: opt.value }))
                              }
                              className="accent-secondary h-4 w-4"
                            />
                            <span className="font-body text-on-surface-variant text-[12px] font-semibold">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </Field>

                    <div className="bg-surface-container-low flex items-start gap-3 rounded-xl px-4 py-4">
                      <div className="bg-secondary-container/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                        <span className="material-symbols-rounded text-secondary text-[18px] leading-none">
                          {isSharePointServiceAccount ? 'verified_user' : 'security'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-on-surface-variant/55 mb-1 text-[9px] font-black tracking-[0.16em] uppercase">
                          Credential Mode
                        </p>
                        <p className="font-body text-on-surface text-[12px] leading-relaxed font-semibold">
                          {isSharePointServiceAccount
                            ? 'Provide the managed identity user name and password used to access the SharePoint site.'
                            : 'Provide the Azure AD app registration details used for client-credential authentication.'}
                        </p>
                      </div>
                    </div>

                    {isSharePointServiceAccount ? (
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <Field
                          label="Username"
                          required
                          hint="Use the full sign-in name for the managed identity account."
                        >
                          <TextInput
                            value={spForm.serviceAccountUpn}
                            onChange={(e) =>
                              updateSpForm((f) => ({ ...f, serviceAccountUpn: e.target.value }))
                            }
                            onBlur={() => markSharePointFieldTouched('serviceAccountUpn')}
                            placeholder="it-admin@contoso.com"
                            autoComplete="username"
                            aria-invalid={shouldShowSharePointFieldError('serviceAccountUpn')}
                            className={cn(
                              shouldShowSharePointFieldError('serviceAccountUpn') &&
                                'border-error bg-error-container/35 focus:border-error focus:ring-error/20',
                            )}
                          />
                        </Field>
                        <Field
                          label="Password"
                          required
                          hint={
                            currentSharePointValidation.fieldErrors.serviceAccountPassword &&
                            shouldShowSharePointFieldError('serviceAccountPassword')
                              ? currentSharePointValidation.fieldErrors.serviceAccountPassword
                              : config?.sharePoint?.authMethod === 'ServiceAccount'
                                ? 'Leave blank to keep the existing password.'
                                : 'Use the current password for the managed identity account.'
                          }
                        >
                          <TextInput
                            type="password"
                            value={spForm.serviceAccountPassword}
                            onChange={(e) =>
                              updateSpForm((f) => ({
                                ...f,
                                serviceAccountPassword: e.target.value,
                              }))
                            }
                            onBlur={() => markSharePointFieldTouched('serviceAccountPassword')}
                            placeholder={
                              config?.sharePoint?.authMethod === 'ServiceAccount'
                                ? '(unchanged)'
                                : '••••••••••••••••••••'
                            }
                            autoComplete="current-password"
                            aria-invalid={shouldShowSharePointFieldError('serviceAccountPassword')}
                            className={cn(
                              shouldShowSharePointFieldError('serviceAccountPassword') &&
                                'border-error bg-error-container/35 focus:border-error focus:ring-error/20',
                            )}
                          />
                        </Field>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <Field
                            label="Tenant ID"
                            required
                            hint={currentSharePointValidation.fieldErrors.tenantId}
                          >
                            <TextInput
                              value={spForm.tenantId}
                              onChange={(e) =>
                                updateSpForm((f) => ({ ...f, tenantId: e.target.value }))
                              }
                              onBlur={() => markSharePointFieldTouched('tenantId')}
                              placeholder="00000000-0000-0000-0000-000000000000"
                              autoCapitalize="none"
                              autoCorrect="off"
                              aria-invalid={shouldShowSharePointFieldError('tenantId')}
                              className={cn(
                                shouldShowSharePointFieldError('tenantId') &&
                                  'border-error bg-error-container/35 focus:border-error focus:ring-error/20',
                              )}
                            />
                          </Field>
                          <Field
                            label="Client ID"
                            required
                            hint={currentSharePointValidation.fieldErrors.clientId}
                          >
                            <TextInput
                              value={spForm.clientId}
                              onChange={(e) =>
                                updateSpForm((f) => ({ ...f, clientId: e.target.value }))
                              }
                              onBlur={() => markSharePointFieldTouched('clientId')}
                              placeholder="00000000-0000-0000-0000-000000000000"
                              autoCapitalize="none"
                              autoCorrect="off"
                              aria-invalid={shouldShowSharePointFieldError('clientId')}
                              className={cn(
                                shouldShowSharePointFieldError('clientId') &&
                                  'border-error bg-error-container/35 focus:border-error focus:ring-error/20',
                              )}
                            />
                          </Field>
                        </div>

                        <Field
                          label="Client Secret"
                          required
                          hint={
                            currentSharePointValidation.fieldErrors.clientSecret &&
                            shouldShowSharePointFieldError('clientSecret')
                              ? currentSharePointValidation.fieldErrors.clientSecret
                              : config?.sharePoint
                                ? 'Leave blank to keep the existing secret.'
                                : undefined
                          }
                        >
                          <TextInput
                            type="password"
                            value={spForm.clientSecret}
                            onChange={(e) =>
                              updateSpForm((f) => ({ ...f, clientSecret: e.target.value }))
                            }
                            onBlur={() => markSharePointFieldTouched('clientSecret')}
                            placeholder={
                              config?.sharePoint ? '(unchanged)' : '••••••••••••••••••••'
                            }
                            aria-invalid={shouldShowSharePointFieldError('clientSecret')}
                            className={cn(
                              shouldShowSharePointFieldError('clientSecret') &&
                                'border-error bg-error-container/35 focus:border-error focus:ring-error/20',
                            )}
                          />
                        </Field>
                      </>
                    )}

                    <Field
                      label="List Name Prefix (Max 20 Chars)"
                      required
                      hint={
                        currentSharePointValidation.fieldErrors.listPrefix ??
                        'Cannot be changed after first save to prevent data orphaning.'
                      }
                    >
                      <TextInput
                        value={spForm.listPrefix}
                        onChange={(e) =>
                          updateSpForm((f) => ({ ...f, listPrefix: e.target.value }))
                        }
                        onBlur={() => markSharePointFieldTouched('listPrefix')}
                        maxLength={20}
                        readOnly={!!config?.sharePoint?.listPrefix}
                        autoCapitalize="none"
                        autoCorrect="off"
                        aria-invalid={shouldShowSharePointFieldError('listPrefix')}
                        className={cn(
                          'font-mono font-bold',
                          config?.sharePoint?.listPrefix && 'cursor-not-allowed opacity-60',
                          shouldShowSharePointFieldError('listPrefix') &&
                            'border-error bg-error-container/35 focus:border-error focus:ring-error/20',
                        )}
                      />
                    </Field>
                  </div>
                ) : (
                  /* ── Azure SQL form fields ──────────────────────── */
                  <div className="flex flex-col gap-5">
                    <Field label="Server FQDN" required>
                      <TextInput
                        defaultValue={config?.azureSql?.serverFqdn}
                        placeholder="pms-prod-sql.database.windows.net"
                      />
                    </Field>
                    <Field label="Database Name" required>
                      <TextInput defaultValue={config?.azureSql?.databaseName} />
                    </Field>

                    <Field label="Authentication Method">
                      <div className="mt-0.5 flex gap-6">
                        {[
                          { id: 'sql-mi', label: 'Azure Managed Identity', default: true },
                          { id: 'sql-pwd', label: 'SQL Authentication' },
                        ].map((opt) => (
                          <label
                            key={opt.id}
                            className="flex cursor-pointer items-center gap-2 select-none"
                          >
                            <input
                              type="radio"
                              name="sql-auth"
                              defaultChecked={opt.default}
                              className="accent-secondary h-4 w-4"
                            />
                            <span className="font-body text-on-surface-variant text-[12px] font-semibold">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </Field>

                    {/* Advanced settings — surface_container_high for nested block (design.md §2) */}
                    <details className="group">
                      <summary className="font-body text-secondary hover:text-primary flex cursor-pointer list-none items-center gap-2 text-[10px] font-black tracking-[0.15em] uppercase transition-colors select-none">
                        <span className="material-symbols-rounded text-[16px] leading-none transition-transform duration-200 group-open:rotate-180">
                          expand_more
                        </span>
                        Advanced Connection Settings
                      </summary>
                      <div className="bg-surface-container-high mt-4 grid grid-cols-2 gap-5 rounded-xl p-5">
                        <Field label="Pool Size" hint="Default: 20">
                          <TextInput type="number" defaultValue={20} min={5} max={100} />
                        </Field>
                        <Field label="Command Timeout (s)" hint="Default: 30">
                          <TextInput type="number" defaultValue={30} min={10} max={300} />
                        </Field>
                      </div>
                    </details>
                  </div>
                )}

                {/* ── Connectivity Validation ─────────────────────────
                    Dashed ghost border — outline_variant/20 (accessibility boundary) */}
                {!canTestSharePointConnection && activeBackend === 'SharePoint' && (
                  <div className="bg-warning-container flex items-start gap-3 rounded-xl px-4 py-3.5">
                    <span className="material-symbols-rounded text-warning mt-0.5 shrink-0 text-[18px] leading-none">
                      warning
                    </span>
                    <div>
                      <p className="font-body text-on-surface mb-1 text-[9px] font-black tracking-[0.14em] uppercase">
                        Required Before Testing
                      </p>
                      <div className="flex flex-col gap-1">
                        {currentSharePointValidation.summaryItems.map((item) => (
                          <p
                            key={item}
                            className="font-body text-on-surface-variant text-[11px] leading-relaxed font-medium"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="border-outline-variant/25 flex items-center gap-4 rounded-2xl border border-dashed p-5">
                  <div className="bg-surface-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <span className="material-symbols-rounded text-secondary text-[18px] leading-none">
                      wifi_tethering
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-on-surface text-[12px] font-bold">
                      Connectivity Validation
                    </p>
                    <p className="font-body text-on-surface-variant/50 text-[10px]">
                      Ensure API permissions and credentials are correct.
                    </p>
                  </div>
                  {/* Primary CTA — gradient from primary to primary_container (design.md §5 Buttons) */}
                  <Button
                    onClick={handleTestConnection}
                    isLoading={isTesting}
                    size="sm"
                    disabled={activeBackend === 'SharePoint' && !canTestSharePointConnection}
                    className="from-primary to-primary-container text-on-primary shrink-0 bg-gradient-to-b text-[12px] font-bold"
                  >
                    Test Connection
                  </Button>
                </div>

                {/* Test result — Soft-Tint badge (design.md §5)
                    Accessibility (WCAG 2.1 AA):
                      Success: bg success-container (#D4EFDF), title text-on-surface 13:1, body text-on-surface-variant 7.2:1, icon text-success 3.87:1 (non-text)
                      Error:   bg error-container (#FDEDEC), text-on-error-container 4.81:1 — opacity-80 removed (would drop to 3.53:1)
                */}
                {testResult && (
                  <div
                    className={cn(
                      'flex items-start gap-3 rounded-xl p-4',
                      testResult.success ? 'bg-success-container' : 'bg-error-container',
                    )}
                  >
                    <span
                      className={cn(
                        'material-symbols-rounded mt-0.5 shrink-0 text-[20px] leading-none',
                        testResult.success ? 'text-success' : 'text-on-error-container',
                      )}
                    >
                      {testResult.success ? 'check_circle' : 'cancel'}
                    </span>
                    <div>
                      <p
                        className={cn(
                          'font-body mb-1 text-[9px] font-black tracking-[0.15em] uppercase',
                          testResult.success ? 'text-on-surface' : 'text-on-error-container',
                        )}
                      >
                        {testResult.success ? 'Connection Successful' : 'Validation Failed'}
                      </p>
                      <p
                        className={cn(
                          'font-body text-[11px] font-medium',
                          testResult.success
                            ? 'text-on-surface-variant'
                            : 'text-on-error-container',
                        )}
                      >
                        {testResult.success
                          ? `Backend reachability confirmed. Latency: ${testResult.latency}ms.`
                          : `Error: ${testResult.error ?? 'Connection timed out. Check firewall rules.'}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* ╚══ End Left ═══════════════════════════════════════════╝ */}

          {/* ╔══ Right — Sidebar (4 cols) ════════════════════════════╗ */}
          <div className="lg:col-span-4">
            <SchemaStatusSidebar
              schemaStatus={schemaStatus}
              onInitialise={handleInitialise}
              isInitialising={isInitialising}
              isConfigSaved={config?.activeBackend === activeBackend}
            />
          </div>
          {/* ╚══ End Right ══════════════════════════════════════════╝ */}
        </div>
      </div>

      {/* ── Sticky Footer ────────────────────────────────────────────
          Glassmorphism: surface_container_lowest/80 + 20px backdrop blur (design.md §2 Glass & Gradient) */}
      <div className="bg-surface-container-lowest/80 border-outline-variant/15 fixed right-0 bottom-0 left-0 z-30 flex items-center justify-between border-t px-10 py-4 backdrop-blur-[20px]">
        {/* Ghost/Tertiary action — text only (design.md §5 Buttons Tertiary) */}
        <button
          onClick={() => window.location.reload()}
          className="font-body text-on-surface-variant hover:text-on-surface text-[12px] font-semibold transition-colors"
        >
          Discard Changes
        </button>
        {/* Primary CTA — gradient (design.md §5 Buttons Primary) */}
        <Button
          onClick={() => handleSave()}
          isLoading={isSaving}
          disabled={!hasValidatedCurrentConfig}
          className="from-primary to-primary-container text-on-primary h-10 bg-gradient-to-b px-6 text-[12px] font-bold"
        >
          <span className="material-symbols-rounded mr-2 text-[16px] leading-none">save</span>
          Save Configuration
        </Button>
      </div>

      {/* ── Backend Switch Modal ──────────────────────────────────────
          Glassmorphism: surface_container_lowest/80 + 20px blur (design.md §2 Glass & Gradient) */}
      {showSwitchModal && (
        <div className="bg-primary/20 fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-[20px]">
          <div
            className={cn(
              'bg-surface-container-lowest/80 w-full max-w-md rounded-2xl p-8 backdrop-blur-[20px]',
              shadowLifted,
            )}
          >
            <div className="mb-4 flex items-center gap-3">
              {/* Warning icon — error_container soft-tint */}
              <div className="bg-error-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <span className="material-symbols-rounded text-on-error-container text-[20px] leading-none">
                  report_problem
                </span>
              </div>
              <h3 className="font-headline text-on-surface text-[17px] font-extrabold">
                Critical: Backend Migration
              </h3>
            </div>

            <p className="font-body text-on-surface-variant mb-6 text-[12px] leading-relaxed">
              You are switching from{' '}
              <span className="text-primary font-bold">{config?.activeBackend}</span> to{' '}
              <span className="text-primary font-bold">{activeBackend}</span>. All data operations
              will redirect immediately. Existing data will{' '}
              <span className="text-error decoration-error font-bold underline">not</span> be
              migrated automatically.
            </p>

            {/* Acknowledgement — surface_container nested block */}
            <label className="bg-surface-container hover:bg-surface-container-high mb-6 flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors">
              <input
                type="checkbox"
                checked={switchAcknowledged}
                onChange={(e) => setSwitchAcknowledged(e.target.checked)}
                className="accent-secondary mt-0.5 h-4 w-4"
              />
              <span className="font-body text-on-surface-variant text-[11px] leading-snug font-semibold">
                I understand that data will not be migrated and acknowledge the system downtime
                risk.
              </span>
            </label>

            <div className="flex gap-3">
              {/* Secondary — surface_container_highest, no border (design.md) */}
              <button
                onClick={() => {
                  setShowSwitchModal(false);
                  setSwitchAcknowledged(false);
                }}
                className="bg-surface-container-highest text-on-surface font-body hover:bg-surface-container-high flex-1 rounded-xl py-2.5 text-[12px] font-bold transition-colors"
              >
                Cancel
              </button>
              {/* Destructive primary — error gradient */}
              <button
                disabled={!switchAcknowledged}
                onClick={() => handleSave(true)}
                className="from-error to-on-error-container text-on-error font-body flex-1 rounded-xl bg-gradient-to-b py-2.5 text-[12px] font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
