'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Download, Archive, Info, BarChart2 } from 'lucide-react';

import { TABS, type Cycle, type CycleStatus } from '@/types/cycle';
import { ALL_CYCLES } from './components/mockData';
import CycleWizard from './components/CycleWizard';
import PreflightModal from './components/PreflightModal';
import { ActiveCycleCard, DraftCycleCard, CompletedCycleCard, ArchivedCycleCard } from './components/CycleCard';

export default function CyclesClient() {
  const router                                  = useRouter();
  const [activeTab,      setActiveTab]          = useState<CycleStatus>('active');
  const [showWizard,     setShowWizard]         = useState(false);
  const [showPreflight,  setShowPreflight]      = useState(false);
  const [preflightCycle, setPreflightCycle]     = useState<Cycle | null>(null);

  const displayed = ALL_CYCLES.filter(c => c.status === activeTab);

  // Show wizard fullscreen
  if (showWizard) return <CycleWizard onClose={() => setShowWizard(false)} />;

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-[var(--primary)]">Cycle Configuration</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">Manage performance review lifecycles and appraisal frameworks</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--on-surface)] bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] rounded-lg border border-[var(--outline-variant)]/50 transition-colors">
            <Filter size={15} /> Filter
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] rounded-lg shadow-[0_4px_12px_rgba(0,25,66,0.3)] transition-colors"
          >
            <Plus size={15} /> Create Cycle
          </button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-[var(--outline-variant)]/40">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              activeTab === tab.key
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── ACTIVE TAB ──────────────────────────────────────────────── */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {displayed.map(cycle => (
            <ActiveCycleCard
              key={cycle.id}
              cycle={cycle}
              onWeightsClick={id => router.push(`/admin/foundation/cycles/${id}/weights`)}
            />
          ))}
        </div>
      )}

      {/* ── DRAFT TAB ───────────────────────────────────────────────── */}
      {activeTab === 'draft' && (
        <div className="space-y-4">
          {displayed.map(cycle => (
            <DraftCycleCard
              key={cycle.id}
              cycle={cycle}
              onActivate={c => { setPreflightCycle(c); setShowPreflight(true); }}
            />
          ))}
        </div>
      )}

      {/* ── COMPLETED TAB ───────────────────────────────────────────── */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {displayed.map(cycle => (
              <CompletedCycleCard key={cycle.id} cycle={cycle} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
              <Info size={13} /> Showing 2 of 12 completed cycles
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">
                <Download size={12} /> Download History
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-[var(--primary-dark)] rounded-lg hover:bg-[var(--primary)] transition-colors">
                <Archive size={12} /> Archive All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ARCHIVED TAB ────────────────────────────────────────────── */}
      {activeTab === 'archived' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-1">Management › Archived Cycles</p>
              <h2 className="text-xl font-bold font-headline text-[var(--primary)]">History & Archives</h2>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">Review past performance cycles and manage regulatory compliance records.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">
                <Filter size={12} /> Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-[var(--primary-dark)] rounded-lg hover:bg-[var(--primary)] transition-colors">
                <Download size={12} /> Export All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {displayed.map(cycle => (
              <ArchivedCycleCard key={cycle.id} cycle={cycle} />
            ))}
          </div>
          {/* Historical Comparison Tool */}
          <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-6 flex items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <h3 className="text-base font-bold text-[var(--on-surface)]">Historical Comparison Tool</h3>
              <p className="text-sm text-[var(--on-surface-variant)]">Generate multi-year reports to identify growth trends and skill gaps across all archived performance cycles from 2020 to 2023.</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-xs font-bold text-white bg-[var(--primary-dark)] rounded-lg hover:bg-[var(--primary)] transition-colors">Launch Analyzer</button>
                <button className="px-4 py-2 text-xs font-semibold border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">Learn More</button>
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              {[{ value: '4.2', label: 'AVG SCORE 2023' }, { value: '98%', label: 'COMPLETION RATE' }].map(stat => (
                <div key={stat.label} className="text-center bg-[var(--surface-container-low)] rounded-xl p-4">
                  <div className="text-2xl font-bold font-headline text-[var(--primary)]">{stat.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Pre-Flight Modal ─────────────────────────────────────────── */}
      {showPreflight && preflightCycle && (
        <PreflightModal
          cycle={preflightCycle}
          onClose={() => { setShowPreflight(false); setPreflightCycle(null); }}
        />
      )}
    </div>
  );
}
