'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Lock, Eye, Copy, Edit2, Trash2, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { Button, Card, FieldLabel } from '@/components/ui';

interface Weights { sa: number; ma: number; cs: number; ga: number; }

const CONFIGS = [
  { id:'1', name:'Leadership Core Standard', code:'WTC-LD-2024',   status:'active', locked:true,  sa:25, ma:35, cs:15, ga:25, modDate:'Oct 12, 2023', modBy:'Sarah Jenkins' },
  { id:'2', name:'Sales Executive Tier 1',   code:'WTC-SL-MOD1',   status:'draft',  locked:false, sa:10, ma:20, cs:70, ga:0,  modDate:'Yesterday',    modBy:'Mike Ross' },
  { id:'3', name:'Graduate Program FY24',    code:'WTC-GR-002',    status:'active', locked:true,  sa:0,  ma:0,  cs:0,  ga:100,modDate:'Aug 01, 2023', modBy:'Sarah Jenkins' },
];

const COMPONENTS: { key: keyof Weights; label: string; desc: string }[] = [
  { key:'sa', label:'Self-Assessment',    desc:'Individual reflection on personal performance and development goals.' },
  { key:'ma', label:'Manager Assessment', desc:'Direct supervisor evaluation of deliverables and professional conduct.' },
  { key:'cs', label:'Competency Score',   desc:'Measured alignment with organisational value framework and role-specific skills.' },
  { key:'ga', label:'Goal Achievement',   desc:'Quantitative tracking of OKRs and specific business targets.' },
];

const LEVELS = ['MANAGER','L6','L5','L4','L3'];

export default function WeightingScreen({ cycleCode }: { cycleCode: string }) {
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

  if (view === 'directory') return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        <Link href="/admin/foundation/cycles" className="hover:text-primary transition-colors">Cycles</Link>
        <ChevronRight size={12} />
        <span className="text-primary">Weighting Configuration</span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-primary">Weighting Configuration</h1>
          <p className="text-sm text-on-surface-variant mt-1">Define and manage performance component weight distributions.</p>
        </div>
        <Button onClick={() => { setEditConfig(null); setWeights({ sa:25, ma:35, cs:15, ga:25 }); setView('editor'); }} className="gap-1.5 shrink-0">
          <Plus size={14} /> Add New Config
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{ label:'Total Models', value:'24', color:'text-primary' }, { label:'Active Cycles', value:'08', color:'text-secondary' }, { label:'Locked Models', value:'12', color:'text-error' }].map(s => (
          <Card key={s.label} className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{s.label}</div>
            <div className={`text-3xl font-bold font-headline ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container-low">
              {['Config Name','Status','Components','Last Modified','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONFIGS.map(config => (
              <tr key={config.id} onClick={() => openEditor(config)} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low cursor-pointer transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface">{config.name}</span>
                    {config.locked && <Lock size={12} className="text-on-surface-variant" />}
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant">{config.code}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${config.status === 'active' ? 'bg-success' : 'bg-on-surface-variant'}`} />
                    <span className="text-xs font-semibold capitalize text-on-surface">{config.status}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {[config.sa > 0 && `SA:${config.sa}%`, config.ma > 0 && `MA:${config.ma}%`, config.cs > 0 && `CS:${config.cs}%`, config.ga > 0 && `GA:${config.ga}%`].filter(Boolean).map(l => (
                      <span key={l as string} className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-on-surface-variant">{l}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs font-medium text-on-surface">{config.modDate}</div>
                  <div className="text-[10px] text-on-surface-variant">by {config.modBy}</div>
                </td>
                <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {config.locked
                      ? <><Button variant="ghost" size="sm" className="p-2"><Eye size={14} /></Button><Button variant="ghost" size="sm" className="p-2"><Copy size={14} /></Button></>
                      : <><Button variant="ghost" size="sm" className="p-2" onClick={() => openEditor(config)}><Edit2 size={14} /></Button><Button variant="ghost" size="sm" className="p-2"><Copy size={14} /></Button><Button variant="ghost" size="sm" className="p-2"><Trash2 size={14} /></Button></>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

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
