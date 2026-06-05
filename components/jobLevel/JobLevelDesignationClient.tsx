'use client';

import { useState } from 'react';
import { useJobLevels, useDesignations } from '@/hooks/useJobLevel';
import JobLevelsTab   from './JobLevelsTab';
import DesignationTab from './DesignationTab';

type Tab = 'job-levels' | 'designation';

export default function JobLevelDesignationClient() {
  const [activeTab, setActiveTab] = useState<Tab>('job-levels');

  const { data: jobLevels    = [], isLoading: isLoadingLevels }       = useJobLevels();
  const { data: designations = [], isLoading: isLoadingDesignations } = useDesignations();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'job-levels',  label: 'Job Level'   },
    { key: 'designation', label: 'Designation' },
  ];

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--on-surface)]">Job Levels &amp; Designations</h1>
        <p className="mt-1 text-sm text-[var(--on-surface-muted)]">
          Define and manage the seniority ladder and standard designations for the organisation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-[var(--outline-variant)]/40">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={[
              'px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'job-levels' && (
          <JobLevelsTab jobLevels={jobLevels} isLoading={isLoadingLevels} />
        )}
        {activeTab === 'designation' && (
          <DesignationTab
            designations={designations}
            jobLevels={jobLevels}
            isLoading={isLoadingDesignations}
          />
        )}
      </div>
    </div>
  );
}
