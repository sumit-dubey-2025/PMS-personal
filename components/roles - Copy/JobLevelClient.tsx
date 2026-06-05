'use client';

import { useState } from 'react';
import JobLevelsTab from './JobLevelsTab';
import { useJobLevels } from '@/hooks/useRoles';

type Tab = 'job-levels' | 'designation';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'job-levels',  label: 'Job Level',   icon: 'swap_vert' },
  { key: 'designation', label: 'Designation', icon: 'list_alt'     },
];

export default function RoleFrameworkClient() {
  const [activeTab, setActiveTab] = useState<Tab>('job-levels');

  const { data: jobLevels = [], isLoading: isLoadingLevels } = useJobLevels();

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">Job Level</h1>
          <p className="mt-1 text-sm text-[var(--on-surface-muted)]">
            Define organisational job levels and designations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-[var(--outline-variant)]/40">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={[
              'flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]',
            ].join(' ')}
          >
            <span className="material-symbols-rounded text-[16px] leading-none">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'job-levels' && (
          <JobLevelsTab
            jobLevels={jobLevels}
            isLoading={isLoadingLevels}
          />
        )}

        {activeTab === 'designation' && (
          <div className="flex items-center justify-center py-20 text-[var(--on-surface-variant)]">
            <p className="text-sm">Designation — coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
