'use client';

// ─────────────────────────────────────────────────────────────────────────────
// CyclesScreen.tsx
// Changes added on top of original developer's code:
//   1. Search bar — filters cycles by name within the active tab
//   2. Filter panel (slide-over) — Cycle Name, Cycle Type, Start Month, End Month
//   3. Search + Filter work together, always scoped to the active tab
//   4. Archived tab: removed the extra duplicate Filter button that was inside it
//   5. All new code is clearly marked with START / END comments
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Download, Archive, Info, X, Search, ChevronDown } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { type Cycle, type CycleStatus, TABS } from '@/types/cycle';
import CycleWizard from './CycleWizard';
import PreflightModal from './PreflightModal';
import { ActiveCycleCard, DraftCycleCard, CompletedCycleCard, ArchivedCycleCard } from './CycleCard';
import { ALL_CYCLES as MOCK_CYCLES } from './mockData';

// ── FILTER TYPES START ───────────────────────────────────────────────────────
const CYCLE_TYPES = [
  'ANNUAL PERFORMANCE',
  'QUARTERLY CHECK-IN',
  'PULSE CHECK',
  'MID-YEAR REVIEW',
  'PROBATION REVIEW',
];

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

interface FilterState {
  cycleName: string;
  cycleType: string;
  startMonth: string;
  endMonth: string;
}

const EMPTY_FILTERS: FilterState = {
  cycleName:  '',
  cycleType:  '',
  startMonth: '',
  endMonth:   '',
};
// ── FILTER TYPES END ─────────────────────────────────────────────────────────

export default function CyclesScreen() {
  // ── ORIGINAL STATE (unchanged) ────────────────────────────────────────────
  const router                              = useRouter();
  const [activeTab, setActiveTab]           = useState<CycleStatus>('draft');
  const [showWizard, setShowWizard]         = useState(false);
  const [showPreflight, setShowPreflight]   = useState(false);
  const [preflightCycle, setPreflightCycle] = useState<Cycle | null>(null);
  // ── END ORIGINAL STATE ────────────────────────────────────────────────────

  // ── SEARCH & FILTER STATE START ───────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState('');
  const [showFilter,     setShowFilter]     = useState(false);
  const [filters,        setFilters]        = useState<FilterState>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<FilterState>(EMPTY_FILTERS);

  // Count how many filters are actively applied (for badge on Filter button)
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  // ── FILTERING LOGIC START ─────────────────────────────────────────────────
  // Flow: allCycles → tab filter → search filter → panel filters → display
  const displayed = MOCK_CYCLES
    // 1. Tab filter (always first gate)
    .filter(c => c.status === activeTab)
    // 2. Search bar filter (by cycle name, case-insensitive)
    .filter(c => {
      if (!searchQuery.trim()) return true;
      return c.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    // 3. Panel filter: Cycle Name field
    .filter(c => {
      if (!filters.cycleName.trim()) return true;
      return c.name.toLowerCase().includes(filters.cycleName.toLowerCase());
    })
    // 4. Panel filter: Cycle Type
    .filter(c => {
      if (!filters.cycleType) return true;
      return c.type === filters.cycleType;
    })
    // 5. Panel filter: Start Month (matches against windowSummary string)
    .filter(c => {
      if (!filters.startMonth) return true;
      const monthAbbr = filters.startMonth.slice(0, 3);
      return c.windowSummary.includes(monthAbbr);
    })
    // 6. Panel filter: End Month (matches against windowSummary string)
    .filter(c => {
      if (!filters.endMonth) return true;
      const monthAbbr = filters.endMonth.slice(0, 3);
      return c.windowSummary.includes(monthAbbr);
    });
  // ── FILTERING LOGIC END ───────────────────────────────────────────────────

  // Reset search + filters when switching tabs
  function handleTabChange(tab: CycleStatus) {
    setActiveTab(tab);
    setSearchQuery('');
    setFilters(EMPTY_FILTERS);
    setPendingFilters(EMPTY_FILTERS);
  }

  function applyFilters() {
    setFilters({ ...pendingFilters });
    setShowFilter(false);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPendingFilters(EMPTY_FILTERS);
  }
  // ── SEARCH & FILTER STATE END ─────────────────────────────────────────────

  if (showWizard) return <CycleWizard onClose={() => setShowWizard(false)} />;

  return (
    <div className="space-y-6">

      {/* ── ORIGINAL: Header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-primary">Cycle Configuration</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage performance review lifecycles and appraisal frameworks</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* ── MODIFIED: Filter button now opens slide-over panel ── */}
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 relative"
            onClick={() => { setPendingFilters({ ...filters }); setShowFilter(true); }}
          >
            <Filter size={14} /> Filter
            {/* Active filter count badge */}
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button size="sm" onClick={() => setShowWizard(true)} className="gap-1.5">
            <Plus size={14} /> Create Cycle
          </Button>
        </div>
      </div>

      {/* ── SEARCH BAR START ─────────────────────────────────────────────────
          Sits between header and tabs. Filters within the active tab only.
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab} cycles by name…`}
            className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-secondary transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
              <X size={14} />
            </button>
          )}
        </div>
        {/* Show active filters summary */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied</span>
            <button onClick={clearFilters} className="text-xs font-bold text-error hover:underline">Clear all</button>
          </div>
        )}
        {/* Results count */}
        <span className="text-xs text-on-surface-variant ml-auto">
          {displayed.length} result{displayed.length !== 1 ? 's' : ''}
        </span>
      </div>
      {/* ── SEARCH BAR END ─────────────────────────────────────────────────── */}

      {/* ── ORIGINAL: Tabs — only handler changed to reset search/filters ─── */}
      <div className="flex items-center gap-1 border-b border-outline-variant/40">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}>
            {tab.label}
            <Badge variant={activeTab === tab.key ? 'active' : 'default'}>{tab.count}</Badge>
          </button>
        ))}
      </div>

      {/* Empty state when no results */}
      {displayed.length === 0 && (
        <div className="py-16 text-center space-y-2">
          <p className="text-sm font-bold text-on-surface">No cycles found</p>
          <p className="text-xs text-on-surface-variant">Try adjusting your search or filters.</p>
          <button onClick={() => { setSearchQuery(''); clearFilters(); }} className="text-xs font-bold text-secondary hover:underline mt-1">
            Clear search & filters
          </button>
        </div>
      )}

      {/* ── ORIGINAL: Active tab ─────────────────────────────────────────── */}
      {activeTab === 'active' && displayed.length > 0 && (
        <div className="space-y-4">
          {displayed.map(cycle => (
            <ActiveCycleCard key={cycle.id} cycle={cycle} onWeightsClick={id => router.push(`/admin/foundation/cycles/${id}/weights`)} />
          ))}
        </div>
      )}

      {/* ── ORIGINAL: Draft tab ──────────────────────────────────────────── */}
      {activeTab === 'draft' && displayed.length > 0 && (
        <div className="space-y-4">
          {displayed.map(cycle => (
            <DraftCycleCard key={cycle.id} cycle={cycle} onActivate={c => { setPreflightCycle(c); setShowPreflight(true); }} />
          ))}
        </div>
      )}

      {/* ── ORIGINAL: Completed tab ──────────────────────────────────────── */}
      {activeTab === 'completed' && displayed.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {displayed.map(cycle => <CompletedCycleCard key={cycle.id} cycle={cycle} />)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Info size={13} /> Showing {displayed.length} of 12 completed cycles
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="gap-1.5"><Download size={12} /> Download History</Button>
              <Button size="sm" className="gap-1.5"><Archive size={12} /> Archive All</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ORIGINAL: Archived tab (removed the extra Filter button inside) ─ */}
      {activeTab === 'archived' && displayed.length > 0 && (
        <div className="space-y-4">
          {/* NOTE: Filter removed (now handled by unified panel above). Export All kept. */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">{displayed.length} archived cycles</span>
            <Button variant="secondary" size="sm" className="gap-1.5"><Download size={12} /> Export All</Button>
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

      {/* ── ORIGINAL: Preflight Modal ────────────────────────────────────── */}
      {showPreflight && preflightCycle && (
        <PreflightModal cycle={preflightCycle} onClose={() => { setShowPreflight(false); setPreflightCycle(null); }} />
      )}

      {/* ── FILTER PANEL (SLIDE-OVER) START ──────────────────────────────────
          Opens from right side when Filter button is clicked.
          Contains: Cycle Name, Cycle Type, Start Month, End Month.
          Apply button commits filters; Clear resets all.
      ──────────────────────────────────────────────────────────────────────── */}
      {showFilter && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowFilter(false)} />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-[360px] z-50 flex flex-col bg-surface shadow-2xl">

            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
              <div>
                <h2 className="text-base font-bold text-on-surface">Filter Cycles</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Filtering within: <span className="font-bold capitalize text-primary">{activeTab}</span> tab
                </p>
              </div>
              <button onClick={() => setShowFilter(false)} className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
                <X size={18} className="text-on-surface-variant" />
              </button>
            </div>

            {/* Panel fields */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

              {/* Cycle Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Cycle Name</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    type="text"
                    value={pendingFilters.cycleName}
                    onChange={e => setPendingFilters(p => ({ ...p, cycleName: e.target.value }))}
                    placeholder="Search by cycle name…"
                    className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Cycle Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Cycle Type</label>
                <div className="relative">
                  <select
                    value={pendingFilters.cycleType}
                    onChange={e => setPendingFilters(p => ({ ...p, cycleType: e.target.value }))}
                    className="w-full appearance-none px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">All Types</option>
                    {CYCLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* Start Month */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Start Month</label>
                <div className="relative">
                  <select
                    value={pendingFilters.startMonth}
                    onChange={e => setPendingFilters(p => ({ ...p, startMonth: e.target.value }))}
                    className="w-full appearance-none px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">Any Month</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* End Month */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">End Month</label>
                <div className="relative">
                  <select
                    value={pendingFilters.endMonth}
                    onChange={e => setPendingFilters(p => ({ ...p, endMonth: e.target.value }))}
                    className="w-full appearance-none px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">Any Month</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* Active filters preview */}
              {Object.values(pendingFilters).some(v => v !== '') && (
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Active Filters</p>
                  {pendingFilters.cycleName  && <p className="text-xs text-on-surface">Name: <span className="font-bold">{pendingFilters.cycleName}</span></p>}
                  {pendingFilters.cycleType  && <p className="text-xs text-on-surface">Type: <span className="font-bold">{pendingFilters.cycleType}</span></p>}
                  {pendingFilters.startMonth && <p className="text-xs text-on-surface">Starts: <span className="font-bold">{pendingFilters.startMonth}</span></p>}
                  {pendingFilters.endMonth   && <p className="text-xs text-on-surface">Ends: <span className="font-bold">{pendingFilters.endMonth}</span></p>}
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div className="px-6 py-4 border-t border-outline-variant/30 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setPendingFilters(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setShowFilter(false); }}
              >
                Clear All
              </Button>
              <Button className="flex-1" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </>
      )}
      {/* ── FILTER PANEL END ─────────────────────────────────────────────────── */}

    </div>
  );
}
