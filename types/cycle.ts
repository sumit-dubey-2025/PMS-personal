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

export const TABS: { key: CycleStatus; label: string; count: number }[] = [
  { key: 'draft',     label: 'Draft',     count: 2  },
  { key: 'active',    label: 'Active',    count: 2  },
  { key: 'completed', label: 'Completed', count: 12 },
  { key: 'archived',  label: 'Archived',  count: 45 },
];
