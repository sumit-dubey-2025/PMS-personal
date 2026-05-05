// ─── Shared types for cycles feature ──────────────────────────────────────────

export type CycleStatus = 'draft' | 'active' | 'completed' | 'archived';
export type WizardStep  = 1 | 2 | 3 | 4;

export interface Cycle {
  id:            string;
  name:          string;
  type:          string;
  status:        CycleStatus;
  windowSummary: string;
  participants?: number;
  dateRange?:    string;
  department?:   string;
  auditStatus?:  string;
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
export const inputCls = 'w-full px-4 py-3 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium outline-none transition-all';
export const labelCls = 'block text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5';

// ─── Mock data ─────────────────────────────────────────────────────────────────
export const ALL_CYCLES: Cycle[] = [
  { id: 'CYC-2024-A',  name: '2024 Annual Review Cycle',      type: 'ANNUAL PERFORMANCE', status: 'active',    windowSummary: 'Set-up: May 01 - May 10 • Assessment: May 15 - Jun 15' },
  { id: 'CYC-2024-Q',  name: 'Q3 Quarterly Check-in',         type: 'QUARTERLY CHECK-IN',  status: 'active',    windowSummary: 'Set-up: Sep 15 - Sep 20 • Assessment: Oct 01 - Oct 15' },
  { id: 'CYC-2024-D',  name: '2024 Annual Review Cycle',      type: 'ANNUAL PERFORMANCE', status: 'draft',     windowSummary: 'Set-up: May 01 - May 10 • Assessment: May 15 - Jun 15' },
  { id: 'CYC-2024-D2', name: 'Q2 Performance Check-in',       type: 'QUARTERLY CHECK-IN',  status: 'draft',     windowSummary: 'Set-up: Jun 20 - Jun 25 • Assessment: Jul 01 - Jul 15' },
  { id: 'CYC-2024-C1', name: '2024 Annual Review Cycle',      type: 'ANNUAL PERFORMANCE', status: 'completed', windowSummary: 'Jan 01, 2024 - Dec 31, 2024', participants: 850,  dateRange: 'Jan 01, 2024 - Dec 31, 2024' },
  { id: 'CYC-2024-C2', name: 'Q1 Engineering Pulse',          type: 'PULSE CHECK',         status: 'completed', windowSummary: 'Jan 01, 2024 - Mar 31, 2024', participants: 120,  dateRange: 'Jan 01, 2024 - Mar 31, 2024' },
  { id: 'CYC-2023-A',  name: '2023 Annual Performance Cycle', type: 'ANNUAL',              status: 'archived',  windowSummary: 'Jan 01, 2023 - Dec 31, 2023', participants: 1240, dateRange: 'Jan 01, 2023 - Dec 31, 2023' },
  { id: 'CYC-2023-P',  name: 'Q4 Technical Skills Check-in', type: 'PULSE',               status: 'archived',  windowSummary: 'Oct 01, 2023 - Dec 15, 2023', participants: 320,  dateRange: 'Oct 01, 2023 - Dec 15, 2023', department: 'Engineering & Product', auditStatus: 'Verified' },
];

export const TABS: { key: CycleStatus; label: string; count: number }[] = [
  { key: 'draft',      label: 'Draft',     count: 2  },
  { key: 'active',     label: 'Active',    count: 2  },
  { key: 'completed',  label: 'Completed', count: 12 },
  { key: 'archived',   label: 'Archived',  count: 45 },
];

export const PREFLIGHT = [
  { label: 'Rating Scale linked',                  ok: true,  warning: false, note: undefined as string | undefined },
  { label: 'Weight Config linked',                 ok: true,  warning: false, note: 'VALIDATION: SUM = 100' },
  { label: 'At least one Eligibility Rule linked', ok: false, warning: true,  note: 'Only global rules currently active. Segment-specific rules missing.' },
  { label: 'Self-Assessment starts in future',     ok: true,  warning: false, note: undefined },
  { label: 'No overlapping active cycle',          ok: true,  warning: false, note: undefined },
];
