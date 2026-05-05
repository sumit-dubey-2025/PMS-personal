'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Lock, Eye, Copy, Edit2, Trash2, CheckCircle, AlertTriangle, Save } from 'lucide-react';

interface Weights { sa: number; ma: number; cs: number; ga: number; }

const CONFIGS = [
  { id:'1', name:'Leadership Core Standard',  code:'WTC-LD-2024',   status:'active', locked:true,  sa:25, ma:35, cs:15, ga:25, modDate:'Oct 12, 2023', modBy:'Sarah Jenkins' },
  { id:'2', name:'Sales Executive Tier 1',     code:'WTC-SL-MOD1',   status:'draft',  locked:false, sa:10, ma:20, cs:70, ga:0,  modDate:'Yesterday',     modBy:'Mike Ross' },
  { id:'3', name:'Graduate Program FY24',      code:'WTC-GR-002',    status:'active', locked:true,  sa:0,  ma:0,  cs:0,  ga:100,modDate:'Aug 01, 2023', modBy:'Sarah Jenkins' },
  { id:'4', name:'Technical Specialist II',    code:'WTC-TECH-SPEC', status:'draft',  locked:false, sa:40, ma:60, cs:0,  ga:0,  modDate:'Oct 28, 2023', modBy:'Admin System' },
];

const COMPONENTS: { key: keyof Weights; label: string; desc: string }[] = [
  { key:'sa', label:'Self-Assessment',    desc:'Individual reflection on personal performance and development goals.' },
  { key:'ma', label:'Manager Assessment', desc:'Direct supervisor evaluation of deliverables and professional conduct.' },
  { key:'cs', label:'Competency Score',   desc:'Measured alignment with organisational value framework and role-specific skills.' },
  { key:'ga', label:'Goal Achievement',   desc:'Quantitative tracking of OKRs and specific business targets.' },
];

const LEVELS = ['MANAGER','L6','L5','L4','L3'];
const inputCls = 'w-full px-4 py-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/40 rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent text-sm font-medium outline-none transition-all';
const labelCls = 'block text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5';

export default function WeightingClient({ cycleCode }: { cycleCode: string }) {
  const [view,             setView]             = useState<'directory'|'editor'>('directory');
  const [editConfig,       setEditConfig]       = useState<typeof CONFIGS[0]|null>(null);
  const [weights,          setWeights]          = useState<Weights>({ sa:25, ma:35, cs:15, ga:25 });
  const [overridesEnabled, setOverridesEnabled] = useState(true);

  const total   = weights.sa + weights.ma + weights.cs + weights.ga;
  const isValid = total === 100;

  function setWeight(key: keyof Weights, value: number) {
    setWeights(prev => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
  }

  function openEditor(config: typeof CONFIGS[0]) {
    setEditConfig(config);
    setWeights({ sa:config.sa, ma:config.ma, cs:config.cs, ga:config.ga });
    setView('editor');
  }

  // ── DIRECTORY VIEW ─────────────────────────────────────────────────────────
  if (view === 'directory') return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
        <Link href="/admin/foundation/cycles" className="hover:text-[var(--primary)] transition-colors">Cycles</Link>
        <ChevronRight size={12} />
        <span className="text-[var(--primary)]">Weighting Configuration</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-[var(--primary)]">Weighting Configuration</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">Define and manage performance component weight distributions.</p>
        </div>
        <button onClick={() => { setEditConfig(null); setWeights({ sa:25, ma:35, cs:15, ga:25 }); setView('editor'); }} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] rounded-lg shadow-[0_4px_12px_rgba(0,25,66,0.3)] transition-colors shrink-0">
          <Plus size={15} /> Add New Config
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[{ label:'Total Models', value:'24', color:'var(--primary)' }, { label:'Active Cycles', value:'08', color:'var(--secondary)' }, { label:'Locked Models', value:'12', color:'#DC2626' }].map(s => (
          <div key={s.label} className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-1">{s.label}</div>
            <div className="text-3xl font-bold font-headline" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]">
              {['Config Name','Status','Components Summary','Last Modified','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONFIGS.map((config, i) => (
              <tr key={config.id} onClick={() => openEditor(config)} className="border-b border-[var(--outline-variant)]/20 last:border-0 hover:bg-[var(--surface-container-low)] cursor-pointer transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--on-surface)]">{config.name}</span>
                    {config.locked && <Lock size={12} className="text-[var(--on-surface-variant)]" />}
                  </div>
                  <span className="text-[10px] font-bold text-[var(--on-surface-variant)] mt-0.5 block">{config.code}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${config.status === 'active' ? 'bg-emerald-500' : 'bg-[var(--on-surface-variant)]'}`} />
                    <span className="text-xs font-semibold capitalize text-[var(--on-surface)]">{config.status}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {[config.sa > 0 && `SA: ${config.sa}%`, config.ma > 0 && `MA: ${config.ma}%`, config.cs > 0 && `CS: ${config.cs}%`, config.ga > 0 && `GA: ${config.ga}%`].filter(Boolean).map(label => (
                      <span key={label as string} className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">{label}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs font-medium text-[var(--on-surface)]">{config.modDate}</div>
                  <div className="text-[10px] text-[var(--on-surface-variant)]">by {config.modBy}</div>
                </td>
                <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {config.locked ? (
                      <><button className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors text-[var(--on-surface-variant)]"><Eye size={14} /></button>
                        <button className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors text-[var(--on-surface-variant)]"><Copy size={14} /></button></>
                    ) : (
                      <><button onClick={() => openEditor(config)} className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors text-[var(--on-surface-variant)]"><Edit2 size={14} /></button>
                        <button className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors text-[var(--on-surface-variant)]"><Copy size={14} /></button>
                        <button className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors text-[var(--on-surface-variant)]"><Trash2 size={14} /></button></>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-[var(--outline-variant)]/20 text-xs text-[var(--on-surface-variant)]">Showing 4 of 24 models</div>
      </div>
    </div>
  );

  // ── EDITOR VIEW ────────────────────────────────────────────────────────────
  const configName = editConfig?.name ?? 'New Weighting Configuration';
  const configCode = editConfig?.code ?? 'WC-NEW';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
        <Link href="/admin/foundation/cycles" className="hover:text-[var(--primary)] transition-colors">Cycles</Link>
        <ChevronRight size={12} />
        <button onClick={() => setView('directory')} className="hover:text-[var(--primary)] transition-colors">Weighting</button>
        <ChevronRight size={12} />
        <span className="text-[var(--primary)]">{configName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-[var(--primary)]">{configName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-bold text-[var(--on-surface-variant)]">{configCode}</span>
            <span className="text-[10px] text-[var(--on-surface-variant)]">· Last updated 2 days ago</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setView('directory')} className="px-4 py-2.5 text-sm font-semibold text-[var(--on-surface)] bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] rounded-lg border border-[var(--outline-variant)]/50 transition-colors">Reset</button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] rounded-lg shadow-[0_4px_12px_rgba(0,25,66,0.3)] transition-colors">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Left */}
        <div className="space-y-5">
          {/* Core Component Weighting */}
          <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--on-surface)]">Core Component Weighting</h3>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: isValid ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)', color: isValid ? '#16a34a' : '#dc2626' }}>
                {isValid ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                Total: {total}%
              </div>
            </div>
            {COMPONENTS.map(comp => (
              <div key={comp.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--on-surface)]">{comp.label}</span>
                  <div className="flex items-center gap-1.5">
                    <input type="number" value={weights[comp.key]} onChange={e => setWeight(comp.key, Number(e.target.value))} min={0} max={100}
                      className="w-16 px-2 py-1.5 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/40 rounded-lg text-sm font-bold text-center text-[var(--on-surface)] outline-none focus:ring-2 focus:ring-[var(--secondary)]" />
                    <span className="text-sm font-bold text-[var(--on-surface-variant)]">%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-[var(--surface-container-high)] rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width:`${weights[comp.key]}%`, backgroundColor:'var(--secondary)' }} />
                  <input type="range" min={0} max={100} value={weights[comp.key]} onChange={e => setWeight(comp.key, Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                </div>
                <p className="text-xs text-[var(--on-surface-variant)]">{comp.desc}</p>
              </div>
            ))}
          </div>

          {/* Grade Band Overrides */}
          <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--on-surface)]">Grade Band Overrides</h3>
                <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">Customise weighting rules for specific seniority levels.</p>
              </div>
              <button type="button" onClick={() => setOverridesEnabled(v => !v)} className="relative w-12 h-6 rounded-full transition-colors shrink-0" style={{ backgroundColor: overridesEnabled ? 'var(--secondary)' : 'var(--outline-variant)' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: overridesEnabled ? '26px' : '4px' }} />
              </button>
            </div>
            {overridesEnabled && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {['','SA','MA','CS','GA'].map(h => (
                        <th key={h} className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LEVELS.map(level => (
                      <tr key={level} className="border-t border-[var(--outline-variant)]/20">
                        <td className="px-2 py-2 text-xs font-bold text-[var(--on-surface-variant)]">{level}</td>
                        {(['sa','ma','cs','ga'] as const).map(k => (
                          <td key={k} className="px-1 py-1">
                            <input type="number" defaultValue={weights[k]} min={0} max={100}
                              className="w-full px-2 py-1.5 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/40 rounded text-xs font-medium text-center text-[var(--on-surface)] outline-none focus:ring-2 focus:ring-[var(--secondary)]" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Formula Engine */}
          <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--on-surface)]">Formula Engine</h3>
            <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-2">Active Computation</div>
              <div className="text-sm font-bold text-[var(--on-surface)] leading-relaxed">
                Composite Score =<br />
                <span className="text-[var(--secondary)]">(SA × {weights.sa}%) + (MA × {weights.ma}%) + (CS × {weights.cs}%) + (GA × {weights.ga}%)</span>
              </div>
            </div>
            {['Dynamic balancing enabled','Override hierarchy enforced'].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]" />
                {item}
              </div>
            ))}
          </div>

          {/* Config Integrity */}
          <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--on-surface)]">Configuration Integrity</h3>
            <div className="flex items-start gap-2">
              {isValid ? <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />}
              <div>
                <div className="text-sm font-bold" style={{ color: isValid ? '#16a34a' : '#dc2626' }}>{isValid ? 'Sum Check Passed' : 'Sum Check Failed'}</div>
                <div className="text-xs text-[var(--on-surface-variant)]">Weights total {total}.00%</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[var(--on-surface)]">Rounding Notice</div>
                <div className="text-xs text-[var(--on-surface-variant)]">Scores will round to 2 decimals</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--outline-variant)]/30">
        <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)]">
          <Lock size={12} /> All changes are logged in the Admin Audit Trail
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('directory')} className="px-4 py-2.5 text-sm font-semibold text-[var(--on-surface)] bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] rounded-lg border border-[var(--outline-variant)]/50 transition-colors">Cancel</button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] rounded-lg shadow-[0_4px_12px_rgba(0,25,66,0.3)] transition-colors">
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
