'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Lock, Eye, Copy, Edit2, Trash2, CheckCircle, AlertTriangle, Save, X, Download } from 'lucide-react';
import { Button, Card, FieldLabel, Input } from '@/components/ui';
import { Tooltip } from '@/components/ui/Tooltip';

interface Weights { sa: number; ma: number; cs: number; ga: number; }

const ALL_CONFIGS = [
  { id:'1', name:'Leadership Core Standard',  code:'WTC-LD-2024',    status:'active', locked:true,  sa:25, ma:35, cs:15, ga:25, modDate:'Oct 12, 2023', modBy:'Sarah Jenkins' },
  { id:'2', name:'Sales Executive Tier 1',    code:'WTC-SL-MOD1',    status:'draft',  locked:false, sa:10, ma:20, cs:70, ga:0,  modDate:'Yesterday',    modBy:'Mike Ross' },
  { id:'3', name:'Graduate Program FY24',     code:'WTC-GR-002',     status:'active', locked:true,  sa:0,  ma:0,  cs:0,  ga:100,modDate:'Aug 01, 2023', modBy:'Sarah Jenkins' },
  { id:'4', name:'Technical Specialist II',   code:'WTC-TECH-SPEC',  status:'draft',  locked:false, sa:40, ma:60, cs:0,  ga:0,  modDate:'Oct 28, 2023', modBy:'Admin System' },
  { id:'5', name:'Executive Leadership FY24', code:'WTC-EXEC-2024',  status:'active', locked:true,  sa:20, ma:40, cs:20, ga:20, modDate:'Sep 15, 2023', modBy:'Sarah Jenkins' },
  { id:'6', name:'Mid-Market Sales',          code:'WTC-MM-SALES',   status:'draft',  locked:false, sa:15, ma:25, cs:30, ga:30, modDate:'Nov 01, 2023', modBy:'Mike Ross' },
];

const COMPONENTS: { key: keyof Weights; label: string; desc: string }[] = [
  { key:'sa', label:'Self-Assessment',    desc:'Individual reflection on personal performance and development goals.' },
  { key:'ma', label:'Manager Assessment', desc:'Direct supervisor evaluation of deliverables and professional conduct.' },
  { key:'cs', label:'Competency Score',   desc:'Measured alignment with organisational value framework and role-specific skills.' },
  { key:'ga', label:'Goal Achievement',   desc:'Quantitative tracking of OKRs and specific business targets.' },
];

const LEVELS = ['MANAGER','L6','L5','L4','L3'];
const PAGE_SIZE = 4;

function ConfigSlideOver({
  config,
  onClose,
  onSave,
}: {
  config: typeof ALL_CONFIGS[0] | null;
  onClose: () => void;
  onSave: (data: { name:string; code:string; sa:number; ma:number; cs:number; ga:number }) => void;
}) {
  const isNew = config === null;
  const [name, setName] = useState(config?.name ?? '');
  const [code, setCode] = useState(config?.code ?? '');
  const [weights, setWeights] = useState<Weights>({
    sa: config?.sa ?? 25,
    ma: config?.ma ?? 35,
    cs: config?.cs ?? 15,
    ga: config?.ga ?? 25,
  });

  const total = weights.sa + weights.ma + weights.cs + weights.ga;
  const isValid = total === 100;

  function setWeight(key: keyof Weights, value: number) {
    setWeights(prev => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-[480px] z-50 flex flex-col bg-surface shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div>
            <h2 className="text-lg font-bold font-headline text-on-surface">
              {isNew ? 'Add New Configuration' : `Edit: ${config!.name}`}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isNew ? 'Define a new performance weighting model.' : `Code: ${config!.code}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
            <X size={18} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Identity fields */}
          <div className="space-y-4">
            <div>
              <FieldLabel>
                Configuration Name <Tooltip label="Configuration Name" description="A human-readable name for this weighting model." />
              </FieldLabel>
              <Input
                placeholder="e.g. Sales Executive Tier 1"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>
                Configuration Code <Tooltip label="Configuration Code" description="Unique identifier — uppercase letters, digits and hyphens only. No spaces." />
              </FieldLabel>
              <Input
                placeholder="e.g. WTC-SL-MOD1"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
              />
              <p className="mt-1 text-[10px] text-on-surface-variant">Unique identifier — uppercase, no spaces.</p>
            </div>
          </div>

          {/* Weight sliders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface">
                Core Component Weighting{' '}
                <Tooltip label="Core Component Weighting" description="All four weights must sum to exactly 100% before the config can be saved." />
              </h3>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isValid ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                {isValid ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                Total: {total}%
              </div>
            </div>

            <div className="space-y-5">
              {COMPONENTS.map(comp => (
                <div key={comp.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-on-surface">{comp.label}</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={weights[comp.key]}
                        onChange={e => setWeight(comp.key, Number(e.target.value))}
                        min={0} max={100}
                        className="w-16 px-2 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-bold text-center text-on-surface outline-none focus:ring-2 focus:ring-secondary"
                      />
                      <span className="text-sm font-bold text-on-surface-variant">%</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-secondary transition-all" style={{ width:`${weights[comp.key]}%` }} />
                    <input type="range" min={0} max={100} value={weights[comp.key]}
                      onChange={e => setWeight(comp.key, Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                  </div>
                  <p className="text-xs text-on-surface-variant">{comp.desc}</p>
                </div>
              ))}
            </div>

            {!isValid && (
              <div className="mt-4 p-3 rounded-lg bg-error/8 border border-error/20 flex items-start gap-2">
                <AlertTriangle size={14} className="text-error shrink-0 mt-0.5" />
                <p className="text-xs text-error">Weights must sum to exactly 100%. Current total: {total}%.</p>
              </div>
            )}
          </div>

          {/* Formula preview */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Formula Preview</p>
            <p className="text-sm font-bold text-on-surface leading-relaxed">
              Composite Score =<br />
              <span className="text-secondary">
                (SA×{weights.sa}%) + (MA×{weights.ma}%) + (CS×{weights.cs}%) + (GA×{weights.ga}%)
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 gap-2"
            disabled={!isValid || !name.trim() || !code.trim()}
            onClick={() => { onSave({ name, code, sa:weights.sa, ma:weights.ma, cs:weights.cs, ga:weights.ga }); onClose(); }}
          >
            <Save size={14} /> {isNew ? 'Create Config' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </>
  );
}

export default function WeightingScreen({ cycleCode }: { cycleCode: string }) {
  const [view,             setView]             = useState<'directory'|'editor'>('directory');
  const [editConfig,       setEditConfig]       = useState<typeof ALL_CONFIGS[0]|null>(null);
  const [weights,          setWeights]          = useState<Weights>({ sa:25, ma:35, cs:15, ga:25 });
  const [overridesEnabled, setOverridesEnabled] = useState(true);
  const [configs,          setConfigs]          = useState(ALL_CONFIGS);
  const [tabFilter,        setTabFilter]        = useState<'all'|'locked'|'draft'>('all');
  const [currentPage,      setCurrentPage]      = useState(1);
  const [slideOver,        setSlideOver]        = useState<{ mode:'add'|'edit'; config: typeof ALL_CONFIGS[0]|null } | null>(null);

  const total   = weights.sa + weights.ma + weights.cs + weights.ga;
  const isValid = total === 100;

  function setWeight(key: keyof Weights, value: number) {
    setWeights(prev => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
  }

  function openEditor(config: typeof ALL_CONFIGS[0]) {
    setEditConfig(config);
    setWeights({ sa:config.sa, ma:config.ma, cs:config.cs, ga:config.ga });
    setView('editor');
  }

  const filteredConfigs = configs.filter(c => {
    if (tabFilter === 'locked') return c.locked;
    if (tabFilter === 'draft')  return c.status === 'draft';
    return true;
  });

  const totalPages   = Math.max(1, Math.ceil(filteredConfigs.length / PAGE_SIZE));
  const pagedConfigs = filteredConfigs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleTabChange(tab: 'all'|'locked'|'draft') {
    setTabFilter(tab);
    setCurrentPage(1);
  }

  function handleSaveConfig(data: { name:string; code:string; sa:number; ma:number; cs:number; ga:number }) {
    if (slideOver?.mode === 'add') {
      setConfigs(prev => [...prev, {
        id: String(Date.now()), name: data.name, code: data.code,
        status: 'draft', locked: false,
        sa: data.sa, ma: data.ma, cs: data.cs, ga: data.ga,
        modDate: 'Just now', modBy: 'HR Admin',
      }]);
    } else if (slideOver?.config) {
      setConfigs(prev => prev.map(c =>
        c.id === slideOver.config!.id
          ? { ...c, name: data.name, code: data.code, sa: data.sa, ma: data.ma, cs: data.cs, ga: data.ga, modDate: 'Just now' }
          : c
      ));
    }
  }

  function handleDelete(id: string) {
    setConfigs(prev => prev.filter(c => c.id !== id));
  }

  /* ── Directory view ─────────────────────────────────────── */
  if (view === 'directory') return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        <Link href="/admin/foundation/cycles" className="hover:text-primary transition-colors">Configuration</Link>
        <ChevronRight size={12} />
        <span className="text-primary">Weighting Models</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-primary">Weighting Configuration</h1>
          <p className="text-sm text-on-surface-variant mt-1">Define and manage performance component weight distributions.</p>
        </div>
        <Button onClick={() => setSlideOver({ mode:'add', config:null })} className="gap-1.5 shrink-0">
          <Plus size={14} /> Add New Config
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Total Models',  value: String(configs.length).padStart(2,'0'),                     color:'text-primary' },
            { label:'Active Cycles', value:'08',                                                          color:'text-secondary' },
            { label:'Locked Models', value: String(configs.filter(c=>c.locked).length).padStart(2,'0'), color:'text-error' },
          ].map(s => (
            <Card key={s.label} className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{s.label}</div>
              <div className={`text-3xl font-bold font-headline ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>
        <Card className="p-5 bg-primary-dark text-white flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-bold">Quick Compliance Check</h3>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">Ensure all active weighting models total 100% across assigned components.</p>
          </div>
          <button className="mt-auto px-4 py-2 rounded-lg bg-white text-primary-dark text-xs font-bold hover:bg-white/90 transition-colors text-left w-fit">
            Run Audit
          </button>
        </Card>
      </div>

      <Card>
        {/* Tabs */}
        <div className="px-5 pt-4 pb-0 flex items-center gap-1 border-b border-outline-variant/30">
          {(['all','locked','draft'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-t-lg text-xs font-bold capitalize transition-colors -mb-px ${
                tabFilter === tab
                  ? 'bg-surface border border-b-surface border-outline-variant/30 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-surface-container-high text-[10px]">
                {tab === 'all'    ? configs.length
                  : tab === 'locked' ? configs.filter(c => c.locked).length
                  : configs.filter(c => c.status === 'draft').length}
              </span>
            </button>
          ))}
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container-low">
              {['Config Name','Status','Components Summary','Last Modified','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedConfigs.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-on-surface-variant">No configurations found for this filter.</td></tr>
            ) : pagedConfigs.map(config => (
              <tr key={config.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface">{config.name}</span>
                    {config.locked && <Lock size={12} className="text-on-surface-variant" />}
                  </div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-on-surface-variant">{config.code}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${config.status === 'active' ? 'bg-success' : 'bg-on-surface-variant'}`} />
                    <span className="text-xs font-semibold capitalize text-on-surface">{config.status}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      config.sa > 0 && `SA: ${config.sa}%`,
                      config.ma > 0 && `MA: ${config.ma}%`,
                      config.cs > 0 && `CS: ${config.cs}%`,
                      config.ga > 0 && `GA: ${config.ga}%`,
                    ].filter(Boolean).map(l => (
                      <span key={l as string} className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-on-surface-variant">{l}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs font-medium text-on-surface">{config.modDate}</div>
                  <div className="text-[10px] text-on-surface-variant">by {config.modBy}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    {config.locked ? (
                      <>
                        <Button variant="ghost" size="sm" className="p-2" title="View" onClick={() => openEditor(config)}><Eye size={14} /></Button>
                        <Button variant="ghost" size="sm" className="p-2" title="Clone"><Copy size={14} /></Button>
                        <Button variant="ghost" size="sm" className="p-2" title="Download"><Download size={14} /></Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" className="p-2 text-secondary" title="Edit" onClick={() => setSlideOver({ mode:'edit', config })}><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="sm" className="p-2" title="Clone"><Copy size={14} /></Button>
                        <Button variant="ghost" size="sm" className="p-2" title="Download"><Download size={14} /></Button>
                        <Button variant="ghost" size="sm" className="p-2 text-error" title="Delete" onClick={() => handleDelete(config.id)}><Trash2 size={14} /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-4 flex items-center justify-between border-t border-outline-variant/20">
          <span className="text-xs text-on-surface-variant">
            Showing {filteredConfigs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredConfigs.length)} of {filteredConfigs.length} models
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} className="rotate-180" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  page === currentPage ? 'bg-primary text-white' : 'border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high'
                }`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>

      {slideOver && (
        <ConfigSlideOver
          config={slideOver.config}
          onClose={() => setSlideOver(null)}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );

  /* ── Editor view ─────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        <Link href="/admin/foundation/cycles" className="hover:text-primary transition-colors">Cycles</Link>
        <ChevronRight size={12} />
        <button onClick={() => setView('directory')} className="hover:text-primary transition-colors">Weighting</button>
        <ChevronRight size={12} />
        <span className="text-primary">{editConfig?.name ?? 'New Configuration'}</span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-primary">{editConfig?.name ?? 'New Weighting Configuration'}</h1>
          <span className="text-xs font-bold text-on-surface-variant">{editConfig?.code ?? 'WC-NEW'}</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" onClick={() => setView('directory')}>Cancel</Button>
          <Button className="gap-1.5"><Save size={14} /> Save Changes</Button>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_260px] gap-6">
        <div className="space-y-5">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">Core Component Weighting</h3>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isValid ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                {isValid ? <CheckCircle size={13} /> : <AlertTriangle size={13} />} Total: {total}%
              </div>
            </div>
            {COMPONENTS.map(comp => (
              <div key={comp.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">{comp.label}</span>
                  <div className="flex items-center gap-1.5">
                    <input type="number" value={weights[comp.key]} onChange={e => setWeight(comp.key, Number(e.target.value))} min={0} max={100}
                      className="w-16 px-2 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-bold text-center text-on-surface outline-none focus:ring-2 focus:ring-secondary" />
                    <span className="text-sm font-bold text-on-surface-variant">%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-secondary transition-all" style={{ width:`${weights[comp.key]}%` }} />
                  <input type="range" min={0} max={100} value={weights[comp.key]} onChange={e => setWeight(comp.key, Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                </div>
                <p className="text-xs text-on-surface-variant">{comp.desc}</p>
              </div>
            ))}
          </Card>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Grade Band Overrides</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Customise weighting for specific seniority levels.</p>
              </div>
              <button type="button" onClick={() => setOverridesEnabled(v => !v)} className="relative w-12 h-6 rounded-full transition-colors shrink-0" style={{ backgroundColor: overridesEnabled ? 'var(--secondary)' : 'var(--outline-variant)' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: overridesEnabled ? '26px' : '4px' }} />
              </button>
            </div>
            {overridesEnabled && (
              <table className="w-full text-xs">
                <thead><tr>{['','SA','MA','CS','GA'].map(h => <th key={h} className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">{h}</th>)}</tr></thead>
                <tbody>
                  {LEVELS.map(level => (
                    <tr key={level} className="border-t border-outline-variant/20">
                      <td className="px-2 py-2 text-xs font-bold text-on-surface-variant">{level}</td>
                      {(['sa','ma','cs','ga'] as const).map(k => (
                        <td key={k} className="px-1 py-1">
                          <input type="number" defaultValue={weights[k]} min={0} max={100}
                            className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded text-xs font-medium text-center text-on-surface outline-none focus:ring-2 focus:ring-secondary" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Formula Engine</h3>
            <div className="p-4 bg-surface-container-low rounded-xl">
              <FieldLabel className="mb-2">Active Computation</FieldLabel>
              <div className="text-sm font-bold text-on-surface leading-relaxed">
                Composite Score =<br />
                <span className="text-secondary">(SA×{weights.sa}%) + (MA×{weights.ma}%) + (CS×{weights.cs}%) + (GA×{weights.ga}%)</span>
              </div>
            </div>
          </Card>
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-on-surface">Configuration Integrity</h3>
            <div className="flex items-start gap-2">
              {isValid ? <CheckCircle size={16} className="text-success shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="text-error shrink-0 mt-0.5" />}
              <div>
                <div className={`text-sm font-bold ${isValid ? 'text-success' : 'text-error'}`}>{isValid ? 'Sum Check Passed' : 'Sum Check Failed'}</div>
                <div className="text-xs text-on-surface-variant">Weights total {total}.00%</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
