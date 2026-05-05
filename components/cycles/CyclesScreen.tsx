'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Download, Archive, Info, BarChart2 } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { ALL_CYCLES, type Cycle, type CycleStatus, TABS } from '@/types/cycle';
import CycleWizard from './CycleWizard';
import PreflightModal from './PreflightModal';
import { ActiveCycleCard, DraftCycleCard, CompletedCycleCard, ArchivedCycleCard } from './CycleCard';
import { ALL_CYCLES as MOCK_CYCLES } from './mockData';

export default function CyclesScreen() {
  const router                              = useRouter();
  const [activeTab, setActiveTab]           = useState<CycleStatus>('active');
  const [showWizard, setShowWizard]         = useState(false);
  const [showPreflight, setShowPreflight]   = useState(false);
  const [preflightCycle, setPreflightCycle] = useState<Cycle | null>(null);

  const displayed = MOCK_CYCLES.filter(c => c.status === activeTab);

  if (showWizard) return <CycleWizard onClose={() => setShowWizard(false)} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-primary">Cycle Configuration</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage performance review lifecycles and appraisal frameworks</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" className="gap-1.5"><Filter size={14} /> Filter</Button>
          <Button size="sm" onClick={() => setShowWizard(true)} className="gap-1.5"><Plus size={14} /> Create Cycle</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-outline-variant/40">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}>
            {tab.label}
            <Badge variant={activeTab === tab.key ? 'active' : 'default'}>{tab.count}</Badge>
          </button>
        ))}
      </div>

      {/* Active */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {displayed.map(cycle => (
            <ActiveCycleCard key={cycle.id} cycle={cycle} onWeightsClick={id => router.push(`/admin/foundation/cycles/${id}/weights`)} />
          ))}
        </div>
      )}

      {/* Draft */}
      {activeTab === 'draft' && (
        <div className="space-y-4">
          {displayed.map(cycle => (
            <DraftCycleCard key={cycle.id} cycle={cycle} onActivate={c => { setPreflightCycle(c); setShowPreflight(true); }} />
          ))}
        </div>
      )}

      {/* Completed */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {displayed.map(cycle => <CompletedCycleCard key={cycle.id} cycle={cycle} />)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant"><Info size={13} /> Showing 2 of 12 completed cycles</div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="gap-1.5"><Download size={12} /> Download History</Button>
              <Button size="sm" className="gap-1.5"><Archive size={12} /> Archive All</Button>
            </div>
          </div>
        </div>
      )}

      {/* Archived */}
      {activeTab === 'archived' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Management › Archived Cycles</p>
              <h2 className="text-xl font-bold font-headline text-primary">History & Archives</h2>
              <p className="text-sm text-on-surface-variant mt-1">Review past performance cycles and manage regulatory compliance records.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="secondary" size="sm" className="gap-1.5"><Filter size={12} /> Filter</Button>
              <Button size="sm" className="gap-1.5"><Download size={12} /> Export All</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {displayed.map(cycle => <ArchivedCycleCard key={cycle.id} cycle={cycle} />)}
          </div>
          <Card className="p-6 flex items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <h3 className="text-base font-bold text-on-surface">Historical Comparison Tool</h3>
              <p className="text-sm text-on-surface-variant">Generate multi-year reports to identify growth trends and skill gaps across archived cycles.</p>
              <div className="flex gap-2">
                <Button size="sm">Launch Analyzer</Button>
                <Button variant="secondary" size="sm">Learn More</Button>
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              {[{ value:'4.2', label:'AVG SCORE 2023' }, { value:'98%', label:'COMPLETION RATE' }].map(stat => (
                <div key={stat.label} className="text-center bg-surface-container-low rounded-xl p-4">
                  <div className="text-2xl font-bold font-headline text-primary">{stat.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Preflight Modal */}
      {showPreflight && preflightCycle && (
        <PreflightModal cycle={preflightCycle} onClose={() => { setShowPreflight(false); setPreflightCycle(null); }} />
      )}
    </div>
  );
}
