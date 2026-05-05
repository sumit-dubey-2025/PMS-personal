'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus, CheckCircle, Info, Calendar, Users, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { Button, Input, Select, Card, FieldLabel } from '@/components/ui';
import { type WizardStep } from '@/types/cycle';

interface Props { onClose: () => void; }

const STEPS = [
  { n: 1, label: 'Basics' },
  { n: 2, label: 'Calendar' },
  { n: 3, label: 'Rating & Weights' },
  { n: 4, label: 'Review' },
];

export default function CycleWizard({ onClose }: Props) {
  const router = useRouter();
  const [step,    setStep]    = useState<WizardStep>(1);
  const [name,    setName]    = useState('');
  const [code,    setCode]    = useState('CYC-2024-ANN');
  const [type,    setType]    = useState('Annual');
  const [desc,    setDesc]    = useState('');
  const [saStart, setSaStart] = useState('2024-11-01');
  const [saEnd,   setSaEnd]   = useState('2024-11-15');
  const [mrStart, setMrStart] = useState('2024-11-16');
  const [mrEnd,   setMrEnd]   = useState('2024-11-30');
  const [calib,   setCalib]   = useState('2024-12-05');
  const [release, setRelease] = useState('2024-12-15');
  const [scale,   setScale]   = useState('');
  const [weight,  setWeight]  = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
          <ChevronRight size={16} className="rotate-180" /> Back to Cycles
        </Button>
        <span className="text-on-surface-variant">·</span>
        <span className="text-sm font-semibold text-on-surface">Cycle Creation Wizard</span>
      </div>

      {/* Horizontal stepper */}
      <Card className="flex items-center p-1">
        {STEPS.map((s, i) => {
          const done    = s.n < step;
          const current = s.n === step;
          return (
            <div key={s.n} className="flex items-center flex-1">
              <button type="button" onClick={() => done && setStep(s.n as WizardStep)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 transition-all ${
                  current ? 'bg-primary-dark text-white shadow-sm'
                  : done   ? 'text-secondary-dark hover:bg-secondary-container cursor-pointer'
                           : 'text-on-surface-variant cursor-default'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  current ? 'bg-white/20 text-white'
                  : done   ? 'bg-secondary-dark text-white'
                           : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {done ? <CheckCircle size={10} /> : s.n}
                </div>
                <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-outline-variant mx-1 shrink-0" />}
            </div>
          );
        })}
      </Card>

      <Card className="p-8">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-headline text-primary mb-1">Create Performance Cycle</h2>
              <p className="text-sm text-on-surface-variant">Define the structural parameters for your organisation's next review period.</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2"><Info size={15} className="text-secondary" /><span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Cycle Identity</span></div>
              <div className="grid grid-cols-2 gap-4">
                <div><FieldLabel required>Cycle Name</FieldLabel><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., 2024 Annual Review" /><p className="mt-1.5 text-[10px] text-on-surface-variant italic">Provide a clear, recognisable name.</p></div>
                <div><FieldLabel>Cycle Code</FieldLabel><Input value={code} onChange={e => setCode(e.target.value)} className="font-mono text-secondary" /><p className="mt-1.5 text-[10px] text-on-surface-variant italic">Internal identifier for data exports.</p></div>
              </div>
              <div><FieldLabel required>Cycle Type</FieldLabel><Select value={type} onChange={e => setType(e.target.value)}>{['Annual','Mid-Year','Pulse','Probation','Ad-hoc'].map(t => <option key={t}>{t}</option>)}</Select></div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Briefly describe the purpose..." className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all resize-none leading-relaxed" />
                <div className="mt-1 text-[10px] text-on-surface-variant text-right">{desc.length} / 2000</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold font-headline text-primary mb-1">Define Cycle Timeline</h2><p className="text-sm text-on-surface-variant">Configure the specific windows for assessment phases.</p></div>
            <div className="space-y-4">
              {[
                { title:'SELF-ASSESSMENT WINDOW', startV:saStart, endV:saEnd, setS:setSaStart, setE:setSaEnd, hint:'Employees can submit their goals and achievements during this period.' },
                { title:'MANAGER REVIEW WINDOW', startV:mrStart, endV:mrEnd, setS:setMrStart, setE:setMrEnd, hint:'Window automatically follows Self-Assessment completion.' },
              ].map(w => (
                <div key={w.title} className="bg-surface-container-low rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2"><Users size={14} className="text-secondary" /><span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{w.title}</span></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[['START DATE', w.startV, w.setS], ['END DATE', w.endV, w.setE]].map(([l,v,set]) => (
                      <div key={l as string}><FieldLabel>{l as string}</FieldLabel><Input type="date" defaultValue={v as string} onChange={e => (set as (v:string)=>void)(e.target.value)} onClick={e => (e.currentTarget as HTMLInputElement).showPicker()}/></div>
                    ))}
                  </div>
                  <p className="text-[11px] text-on-surface-variant italic">{w.hint}</p>
                </div>
              ))}
              {[
                { title:'CALIBRATION DATE', label:'SESSION DATE', v:calib, set:setCalib, hint:'Must be at least 3 business days after Manager Review closes.' },
                { title:'RESULTS RELEASE DATE', label:'PUBLICATION DATE', v:release, set:setRelease, hint:'Reports available on this date at 09:00 AM.' },
              ].map(w => (
                <div key={w.title} className="bg-surface-container-low rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2"><Calendar size={14} className="text-secondary" /><span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{w.title}</span></div>
                  <div><FieldLabel>{w.label}</FieldLabel><Input type="date" defaultValue={w.v} onChange={e => w.set(e.target.value)} onClick={e => (e.currentTarget as HTMLInputElement).showPicker()}/></div>
                  <p className="text-[11px] text-on-surface-variant italic">{w.hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold font-headline text-primary mb-1">Define Rating & Weighting Framework</h2><p className="text-sm text-on-surface-variant">Link the assessment logic to this cycle.</p></div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label:'RATING SCALE', val:scale, set:setScale, opts:['Standard 5-Point Scale','Pulse 3-Band Scale','Leadership Framework'], href:'/admin/foundation/cycles/CYC-2024-A/scales', createLabel:'Create New Rating Scale' },
                { label:'WEIGHTING CONFIGURATION', val:weight, set:setWeight, opts:['Standard Performance Model 2024','Lightweight Check-in Config'], href:'/admin/foundation/cycles/CYC-2024-A/weights', createLabel:'Create New Weight Config' },
              ].map(f => (
                <div key={f.label} className="bg-surface-container-low rounded-xl p-5 space-y-3">
                  <FieldLabel required>{f.label}</FieldLabel>
                  <Select value={f.val} onChange={e => f.set(e.target.value)}><option value="">Select...</option>{f.opts.map(o => <option key={o}>{o}</option>)}</Select>
                  <Button variant="ghost" size="sm" onClick={() => router.push(f.href)} className="gap-1.5 text-secondary hover:text-secondary-dark px-0"><Plus size={12} /> {f.createLabel}</Button>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 p-4 bg-secondary-container/30 rounded-xl border border-secondary/20">
              <Info size={16} className="text-secondary shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-on-surface-variant">
                <p className="font-bold text-on-surface">About Rating & Weights</p>
                <p>The <strong>Rating Scale</strong> dictates the numerical range. The <strong>Weighting Configuration</strong> applies relative importance to sections.</p>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-1.5"><Info size={11} className="text-secondary" /> Changes affect all participants.</div>
                  <div className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-secondary" /> Scales cannot be edited after cycle goes live.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-5">
            <div><h2 className="text-2xl font-bold font-headline text-primary mb-1">Cycle Review Summary</h2><p className="text-sm text-on-surface-variant">Please review all configuration details before final submission.</p></div>
            <div className="bg-surface-container-low rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2"><Info size={14} className="text-on-surface-variant" /><h3 className="text-sm font-bold text-on-surface">Cycle Identity</h3></div>
              <div className="grid grid-cols-3 gap-3">
                {[{ label:'CYCLE NAME', value:name||'2024 Annual Review Cycle' }, { label:'CYCLE CODE', value:code }, { label:'TYPE', value:type }].map(item => (
                  <div key={item.label} className="bg-surface-container-high rounded-lg p-3"><FieldLabel className="mb-1">{item.label}</FieldLabel><div className="text-sm font-bold text-on-surface">{item.value}</div></div>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2"><Calendar size={14} className="text-on-surface-variant" /><h3 className="text-sm font-bold text-on-surface">Cycle Timeline</h3></div>
              <div className="grid grid-cols-2 gap-3">
                {[{ label:'SELF-ASSESSMENT', value:'Nov 01 - Nov 15' }, { label:'MANAGER REVIEW', value:'Nov 16 - Nov 30' }, { label:'CALIBRATION', value:'Dec 05, 2024' }, { label:'RESULTS RELEASE', value:'Dec 15, 2024' }].map(item => (
                  <div key={item.label} className="bg-surface-container-high rounded-lg p-3"><FieldLabel className="mb-1">{item.label}</FieldLabel><div className="text-sm font-semibold text-on-surface">{item.value}</div></div>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-secondary-container/30 rounded-xl border border-secondary/20">
              <Info size={16} className="text-secondary shrink-0 mt-0.5" />
              <div><div className="text-sm font-bold text-on-surface mb-0.5">Ready for Deployment</div><div className="text-xs text-on-surface-variant">This cycle configuration is valid. You can save it as a draft now.</div></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/30">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">{step > 1 && <><Clock size={12} /> Autosaved just now</>}</div>
          <div className="flex items-center gap-3">
            {step === 1 ? <Button variant="secondary" onClick={onClose}>Cancel</Button> : <Button variant="secondary" onClick={() => setStep(s => (s-1) as WizardStep)}>← Back</Button>}
            {step === 2 && <Button variant="ghost">Save as Draft</Button>}
            {step < 4
              ? <Button onClick={() => setStep(s => (s+1) as WizardStep)} className="gap-2">Next <ArrowRight size={15} /></Button>
              : <div className="flex gap-2"><Button variant="secondary">Schedule Later</Button><Button onClick={onClose} className="gap-2">Save as Draft <ArrowRight size={15} /></Button></div>
            }
          </div>
        </div>
      </Card>
    </div>
  );
}
