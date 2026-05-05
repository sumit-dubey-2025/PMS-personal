'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, Plus, CheckCircle, Info,
  Calendar, Users, ArrowRight, Clock, ShieldCheck
} from 'lucide-react';
import { type WizardStep } from '@/types/cycle';

interface Props { onClose: () => void; }

const STEPS = [
  { n: 1, label: 'Basics' },
  { n: 2, label: 'Calendar' },
  { n: 3, label: 'Rating & Weights' },
  { n: 4, label: 'Review' },
];

// Always-visible border on inputs
const inputCls = 'w-full px-4 py-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/40 rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent text-sm font-medium outline-none transition-all';
const labelCls = 'block text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5';

const chevronSVG = (
  <svg className="pointer-events-none absolute right-3 top-4 w-4 h-4 text-[var(--on-surface-variant)]" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/>
  </svg>
);

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
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">
          <ChevronRight size={16} className="rotate-180" /> Back to Cycles
        </button>
        <span className="text-[var(--on-surface-variant)]">·</span>
        <span className="text-sm font-semibold text-[var(--on-surface)]">Cycle Creation Wizard</span>
      </div>

      {/* ── Horizontal stepper ─────────────────────────────────────── */}
      <div className="flex items-center bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-1">
        {STEPS.map((s, i) => {
          const done    = s.n < step;
          const current = s.n === step;
          return (
            <div key={s.n} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => done && setStep(s.n as WizardStep)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 transition-all ${
                  current ? 'bg-[var(--primary-dark)] text-white shadow-sm'
                  : done   ? 'text-[var(--secondary-dark)] hover:bg-[var(--secondary-container)] cursor-pointer'
                           : 'text-[var(--on-surface-variant)] cursor-default'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  current ? 'bg-white/20 text-white'
                  : done   ? 'bg-[var(--secondary-dark)] text-white'
                           : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]'
                }`}>
                  {done ? <CheckCircle size={10} /> : s.n}
                </div>
                <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight size={14} className="text-[var(--outline-variant)] mx-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step Content ────────────────────────────────────────────── */}
      <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-8">

        {/* STEP 1 — Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-headline text-[var(--primary)] mb-1">Create Performance Cycle</h2>
              <p className="text-sm text-[var(--on-surface-variant)]">Define the structural parameters for your organisation's next review period.</p>
            </div>
            <div className="bg-[var(--surface-container-low)] rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Info size={15} className="text-[var(--secondary)]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Cycle Identity</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Cycle Name <span className="text-red-500">*</span></label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., 2024 Annual Review" className={inputCls} />
                  <p className="mt-1.5 text-[10px] text-[var(--on-surface-variant)] italic">Provide a clear, recognisable name.</p>
                </div>
                <div>
                  <label className={labelCls}>Cycle Code</label>
                  <input value={code} onChange={e => setCode(e.target.value)} className={`${inputCls} font-mono text-[var(--secondary)]`} />
                  <p className="mt-1.5 text-[10px] text-[var(--on-surface-variant)] italic">Internal identifier for data exports.</p>
                </div>
              </div>
              <div>
                <label className={labelCls}>Cycle Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={type} onChange={e => setType(e.target.value)} className={`${inputCls} pr-10 appearance-none`}>
                    {['Annual', 'Mid-Year', 'Pulse', 'Probation', 'Ad-hoc'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  {chevronSVG}
                </div>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Briefly describe the purpose of this review cycle..." className={`${inputCls} resize-none leading-relaxed`} />
                <div className="mt-1 text-[10px] text-[var(--on-surface-variant)] text-right">{desc.length} / 2000</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Calendar */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-headline text-[var(--primary)] mb-1">Define Cycle Timeline</h2>
              <p className="text-sm text-[var(--on-surface-variant)]">Configure the specific windows for assessment phases. Ensure sequential windows do not overlap.</p>
            </div>
            <div className="space-y-4">
              {[
                { title:'SELF-ASSESSMENT WINDOW', startV:saStart, endV:saEnd, setS:setSaStart, setE:setSaEnd, hint:'Employees can submit their goals and achievements during this period.' },
                { title:'MANAGER REVIEW WINDOW',  startV:mrStart, endV:mrEnd, setS:setMrStart, setE:setMrEnd, hint:'Window automatically follows Self-Assessment completion.' },
              ].map(w => (
                <div key={w.title} className="bg-[var(--surface-container-low)] rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2"><Users size={14} className="text-[var(--secondary)]" /><span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">{w.title}</span></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[['START DATE', w.startV, w.setS], ['END DATE', w.endV, w.setE]].map(([l, v, set]) => (
                      <div key={l as string}>
                        <label className={labelCls}>{l as string}</label>
                        <input type="date" defaultValue={v as string} onChange={e => (set as (v:string)=>void)(e.target.value)} className={inputCls} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[var(--on-surface-variant)] italic">{w.hint}</p>
                </div>
              ))}
              {[
                { title:'CALIBRATION DATE', label:'SESSION DATE', v:calib, set:setCalib, hint:'Must be at least 3 business days after Manager Review closes.' },
                { title:'RESULTS RELEASE DATE', label:'PUBLICATION DATE', v:release, set:setRelease, hint:'Reports will be available to employees on this date at 09:00 AM.' },
              ].map(w => (
                <div key={w.title} className="bg-[var(--surface-container-low)] rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2"><Calendar size={14} className="text-[var(--secondary)]" /><span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">{w.title}</span></div>
                  <div>
                    <label className={labelCls}>{w.label}</label>
                    <input type="date" defaultValue={w.v} onChange={e => w.set(e.target.value)} className={inputCls} />
                  </div>
                  <p className="text-[11px] text-[var(--on-surface-variant)] italic">{w.hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Rating & Weights */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-headline text-[var(--primary)] mb-1">Define Rating & Weighting Framework</h2>
              <p className="text-sm text-[var(--on-surface-variant)]">Link the assessment logic to this cycle. These settings determine how employees are scored.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label:'RATING SCALE', val:scale, set:setScale, opts:['Standard 5-Point Scale','Pulse 3-Band Scale','Leadership Framework'], createHref:'/admin/foundation/cycles/CYC-2024-A/scales', createLabel:'Create New Rating Scale' },
                { label:'WEIGHTING CONFIGURATION', val:weight, set:setWeight, opts:['Standard Performance Model 2024','Lightweight Check-in Config'], createHref:'/admin/foundation/cycles/CYC-2024-A/weights', createLabel:'Create New Weight Config' },
              ].map(f => (
                <div key={f.label} className="bg-[var(--surface-container-low)] rounded-xl p-5 space-y-3">
                  <label className={labelCls}>{f.label} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={f.val} onChange={e => f.set(e.target.value)} className={`${inputCls} pr-10 appearance-none`}>
                      <option value="">Select...</option>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                    {chevronSVG}
                  </div>
                  {/* Working link to create page */}
                  <button
                    type="button"
                    onClick={() => router.push(f.createHref)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[var(--secondary)] hover:text-[var(--secondary-dark)] transition-colors"
                  >
                    <Plus size={12} /> {f.createLabel}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 p-4 bg-[var(--secondary-container)]/30 rounded-xl border border-[var(--secondary)]/20">
              <Info size={16} className="text-[var(--secondary)] shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs text-[var(--on-surface-variant)]">
                <p className="font-bold text-[var(--on-surface)]">About Rating & Weights</p>
                <p>The <strong>Rating Scale</strong> dictates the numerical range. The <strong>Weighting Configuration</strong> applies relative importance to sections.</p>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-1.5"><Info size={11} className="text-[var(--secondary)]" /> Changes affect all participants in this cycle.</div>
                  <div className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-[var(--secondary)]" /> Scales cannot be edited after the cycle goes live.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Review */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold font-headline text-[var(--primary)] mb-1">Cycle Review Summary</h2>
              <p className="text-sm text-[var(--on-surface-variant)]">Please review all configuration details before final submission.</p>
            </div>
            <div className="bg-[var(--surface-container-low)] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2"><Info size={14} className="text-[var(--on-surface-variant)]" /><h3 className="text-sm font-bold text-[var(--on-surface)]">Cycle Identity</h3></div>
              <div className="grid grid-cols-3 gap-3">
                {[{ label:'CYCLE NAME', value:name||'2024 Annual Review Cycle' }, { label:'CYCLE CODE', value:code }, { label:'TYPE', value:type }].map(item => (
                  <div key={item.label} className="bg-[var(--surface-container-high)] rounded-lg p-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-1">{item.label}</div>
                    <div className="text-sm font-bold text-[var(--on-surface)]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[var(--surface-container-low)] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2"><Calendar size={14} className="text-[var(--on-surface-variant)]" /><h3 className="text-sm font-bold text-[var(--on-surface)]">Cycle Timeline</h3></div>
              <div className="grid grid-cols-2 gap-3">
                {[{ label:'SELF-ASSESSMENT', value:'Nov 01 - Nov 15' }, { label:'MANAGER REVIEW', value:'Nov 16 - Nov 30' }, { label:'CALIBRATION', value:'Dec 05, 2024' }, { label:'RESULTS RELEASE', value:'Dec 15, 2024' }].map(item => (
                  <div key={item.label} className="bg-[var(--surface-container-high)] rounded-lg p-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-1">{item.label}</div>
                    <div className="text-sm font-semibold text-[var(--on-surface)]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[var(--secondary-container)]/30 rounded-xl border border-[var(--secondary)]/20">
              <Info size={16} className="text-[var(--secondary)] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-[var(--on-surface)] mb-0.5">Ready for Deployment</div>
                <div className="text-xs text-[var(--on-surface-variant)]">This cycle configuration is valid. You can save it as a draft now or return later to finalise employee eligibility lists.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Wizard footer ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--outline-variant)]/30">
          <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
            {step > 1 && <><Clock size={12} /> Autosaved just now</>}
          </div>
          <div className="flex items-center gap-3">
            {step === 1
              ? <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-[var(--on-surface)] bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] rounded-lg transition-colors">Cancel</button>
              : <button type="button" onClick={() => setStep(s => (s-1) as WizardStep)} className="px-4 py-2.5 text-sm font-semibold text-[var(--on-surface)] bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] rounded-lg transition-colors">← Back</button>
            }
            {step === 2 && (
              <button type="button" className="px-4 py-2.5 text-sm font-semibold border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">Save as Draft</button>
            )}
            {step < 4
              ? <button type="button" onClick={() => setStep(s => (s+1) as WizardStep)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] rounded-lg shadow-[0_4px_12px_rgba(0,25,66,0.3)] transition-colors">
                  Next <ArrowRight size={15} />
                </button>
              : <div className="flex gap-2">
                  <button type="button" className="px-4 py-2.5 text-sm font-semibold border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">Schedule Later</button>
                  <button type="button" onClick={onClose} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] rounded-lg shadow-[0_4px_12px_rgba(0,25,66,0.3)] transition-colors">
                    Save as Draft <ArrowRight size={15} />
                  </button>
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
