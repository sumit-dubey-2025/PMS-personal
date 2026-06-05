'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Search, BarChart2, Edit2, Copy, Download, Trash2, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, X, Save } from 'lucide-react';
import { Button, Card, FieldLabel, Input } from '@/components/ui';
import { Tooltip } from '@/components/ui/Tooltip';

interface Band {
  id: string; label: string; minScore: number; maxScore: number;
  numValue: number; meritEligible: boolean; color: string;
}

interface ScaleRecord {
  id: string; name: string; code: string; desc: string;
  bandCount: number; status: 'active' | 'draft'; locked: boolean;
  modDate: string; modBy: string; bandData: Band[];
}

const DEFAULT_BANDS: Band[] = [
  { id:'1', label:'Exceeds Expectations', minScore:91, maxScore:100, numValue:5, meritEligible:true,  color:'#00677E' },
  { id:'2', label:'Fully Meets',          minScore:71, maxScore:90,  numValue:4, meritEligible:true,  color:'#7B9FCC' },
  { id:'3', label:'Developing',           minScore:51, maxScore:70,  numValue:3, meritEligible:false, color:'#94A3B8' },
  { id:'4', label:'Needs Improvement',    minScore:26, maxScore:50,  numValue:2, meritEligible:false, color:'#DC2626' },
  { id:'5', label:'Unsatisfactory',       minScore:0,  maxScore:25,  numValue:1, meritEligible:false, color:'#1A1A1A' },
];

const Q1_BANDS: Band[] = [
  { id:'1', label:'Exceeds',   minScore:71, maxScore:100, numValue:3, meritEligible:true,  color:'#00677E' },
  { id:'2', label:'Meets',     minScore:41, maxScore:70,  numValue:2, meritEligible:false, color:'#7B9FCC' },
  { id:'3', label:'Below',     minScore:0,  maxScore:40,  numValue:1, meritEligible:false, color:'#DC2626' },
];

const LDR_BANDS: Band[] = [
  { id:'1', label:'Exceptional',  minScore:76, maxScore:100, numValue:4, meritEligible:true,  color:'#00677E' },
  { id:'2', label:'Proficient',   minScore:51, maxScore:75,  numValue:3, meritEligible:true,  color:'#7B9FCC' },
  { id:'3', label:'Developing',   minScore:26, maxScore:50,  numValue:2, meritEligible:false, color:'#94A3B8' },
  { id:'4', label:'Insufficient', minScore:0,  maxScore:25,  numValue:1, meritEligible:false, color:'#DC2626' },
];

const INIT_DIRECTORY: ScaleRecord[] = [
  { id:'1', name:'Standard 5-Point Scale', code:'RSC-2024-STD', desc:'Primary performance measurement scale used across all review cycles.', bandCount:5, status:'active', locked:true,  modDate:'Oct 12, 2023', modBy:'Sarah Chen', bandData: DEFAULT_BANDS },
  { id:'2', name:'Q1 Pulse Scale',         code:'RSC-Q1-PULSE', desc:'Simplified 3-level scale for quarterly health checks.',                bandCount:3, status:'active', locked:false, modDate:'Jan 04, 2024', modBy:'Mike Ross',  bandData: Q1_BANDS },
  { id:'3', name:'Leadership Framework',   code:'RSC-LDR',      desc:'Competency based scale specifically for leadership roles.',            bandCount:4, status:'draft',  locked:false, modDate:'Feb 18, 2024', modBy:'Sarah Chen', bandData: LDR_BANDS },
];

export default function RatingScaleScreen({ cycleCode }: { cycleCode: string }) {
  const [directory,        setDirectory]        = useState<ScaleRecord[]>(INIT_DIRECTORY);
  const [view,             setView]             = useState<'directory'|'editor'>('directory');
  const [editScale,        setEditScale]        = useState<ScaleRecord | null>(null);
  const [previewOpen,      setPreviewOpen]      = useState(true);

  // Editor state
  const [scaleName,  setScaleName]  = useState('');
  const [scaleDesc,  setScaleDesc]  = useState('');
  const [bands,      setBands]      = useState<Band[]>(DEFAULT_BANDS);

  // Band flyout state
  const [editBandId, setEditBandId] = useState<string|null>(null);
  const [flyLabel,   setFlyLabel]   = useState('');
  const [flyMin,     setFlyMin]     = useState(0);
  const [flyMax,     setFlyMax]     = useState(100);
  const [flyValue,   setFlyValue]   = useState(5);
  const [flyMerit,   setFlyMerit]   = useState(true);
  const [flyColor,   setFlyColor]   = useState('#00677E');

  function openEditor(scale: ScaleRecord | null) {
    if (scale) {
      setEditScale(scale);
      setScaleName(scale.name);
      setScaleDesc(scale.desc);
      setBands(scale.bandData.map(b => ({ ...b })));
    } else {
      setEditScale(null);
      setScaleName('');
      setScaleDesc('');
      setBands(DEFAULT_BANDS.map(b => ({ ...b })));
    }
    setEditBandId(null);
    setPreviewOpen(true);
    setView('editor');
  }

  function openBand(band: Band) {
    setFlyLabel(band.label);
    setFlyMin(band.minScore);
    setFlyMax(band.maxScore);
    setFlyValue(band.numValue);
    setFlyMerit(band.meritEligible);
    setFlyColor(band.color);
    setEditBandId(band.id);
  }

  function applyBand() {
    setBands(prev => prev.map(b => b.id === editBandId
      ? { ...b, label:flyLabel, minScore:flyMin, maxScore:flyMax, numValue:flyValue, meritEligible:flyMerit, color:flyColor }
      : b));
    setEditBandId(null);
  }

  // "Discard" now DELETES the band being edited
  function discardBand() {
    setBands(prev => prev.filter(b => b.id !== editBandId));
    setEditBandId(null);
  }

  function addNewBand() {
    const newBand: Band = {
      id: String(Date.now()),
      label: 'New Band',
      minScore: 0, maxScore: 10,
      numValue: bands.length + 1,
      meritEligible: false,
      color: '#94A3B8',
    };
    setBands(prev => [...prev, newBand]);
    // Open the flyout immediately for the new band
    setFlyLabel(newBand.label);
    setFlyMin(newBand.minScore);
    setFlyMax(newBand.maxScore);
    setFlyValue(newBand.numValue);
    setFlyMerit(newBand.meritEligible);
    setFlyColor(newBand.color);
    setEditBandId(newBand.id);
  }

  function saveScale() {
    if (editScale) {
      setDirectory(prev => prev.map(s => s.id === editScale.id
        ? { ...s, name: scaleName, desc: scaleDesc, bandData: bands, bandCount: bands.length, modDate: 'Just now', modBy: 'HR Admin' }
        : s));
    } else {
      const newScale: ScaleRecord = {
        id: String(Date.now()),
        name: scaleName, code: 'RSC-NEW', desc: scaleDesc,
        bandCount: bands.length, status: 'draft', locked: false,
        modDate: 'Just now', modBy: 'HR Admin', bandData: bands,
      };
      setDirectory(prev => [...prev, newScale]);
    }
    setView('directory');
  }

  const sorted  = [...bands].sort((a, b) => a.minScore - b.minScore);
  const isValid = sorted.length > 0 && sorted[0].minScore === 0 && sorted[sorted.length - 1].maxScore === 100;

  /* ── Directory ───────────────────────────────────────────────── */
  if (view === 'directory') return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        <Link href="/admin/foundation/cycles" className="hover:text-primary transition-colors">Configuration</Link>
        <ChevronRight size={12} />
        <span className="text-primary">Rating Scales</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-primary">Rating Scale Manager</h1>
          <p className="text-sm text-on-surface-variant mt-1">Configure and maintain the standard evaluation metrics used across performance review cycles and competency assessments.</p>
        </div>
        <Button onClick={() => openEditor(null)} className="gap-1.5 shrink-0">
          <Plus size={14} /> Add New Scale
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-lg">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <Input placeholder="Search by scale name or code..." className="pl-9" />
        </div>
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container-low">
              {['Scale Details','Bands','Status','Last Modified','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {directory.map(scale => (
              <tr key={scale.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
                      <BarChart2 size={16} className="text-secondary-dark" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-on-surface">{scale.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-on-surface-variant">{scale.code}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5 max-w-xs truncate">{scale.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-lg font-bold text-primary">{scale.bandCount}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">bands</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    {scale.status === 'active' ? (
                      <>
                        <CheckCircle size={14} className="text-success" />
                        <span className="text-xs font-bold text-success uppercase tracking-wide">Active</span>
                      </>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
                        <span className="text-xs font-semibold capitalize text-on-surface-variant">Draft</span>
                      </>
                    )}
                  </div>
                  {scale.locked && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-secondary mt-0.5">
                      <Lock size={10} /> LINKED (2024 CYCLE)
                    </div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs font-medium text-on-surface">{scale.modDate}</div>
                  <div className="text-[10px] text-on-surface-variant">by {scale.modBy}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="p-2 text-secondary" title="Edit" onClick={() => openEditor(scale)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2" title="Clone">
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2" title={scale.status === 'draft' ? 'Delete' : 'Download'}>
                      {scale.status === 'draft' ? <Trash2 size={14} className="text-error" /> : <Download size={14} />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-4 border-t border-outline-variant/20 flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="text-lg">✦</span>
          Showing {directory.length} rating scales
        </div>
      </Card>
    </div>
  );

  /* ── Editor ──────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        <Link href="/admin/foundation/cycles" className="hover:text-primary transition-colors">Cycles</Link>
        <ChevronRight size={12} />
        <button onClick={() => setView('directory')} className="hover:text-primary transition-colors">Rating Scales</button>
        <ChevronRight size={12} />
        <span className="text-primary">{scaleName || 'New Scale'}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-primary">Rating Scale Manager</h1>
          <p className="text-sm text-on-surface-variant mt-1">Define performance benchmarks and score distributions for global cycles.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" onClick={() => setView('directory')}>Cancel</Button>
          <Button className="gap-1.5" onClick={saveScale} disabled={!scaleName.trim() || !isValid}>
            <Save size={14} /> Save Scale
          </Button>
        </div>
      </div>

      {/*
        Layout: when preview is open → 2 columns [editor | preview]
                when preview is closed → editor takes full width
      */}
      <div className={`grid gap-6 transition-all duration-300 ${previewOpen ? 'grid-cols-[1fr_300px]' : 'grid-cols-1'}`}>

        {/* Left: Scale metadata + Band Editor */}
        <div className="space-y-5 min-w-0">

          {/* Scale name + description */}
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>
                  Scale Name <Tooltip label="Scale Name" description="A unique, human-readable name for this rating scale." />
                </FieldLabel>
                <Input value={scaleName} onChange={e => setScaleName(e.target.value)} placeholder="e.g. Standard 5-Point Scale" />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <Input value={scaleDesc} onChange={e => setScaleDesc(e.target.value)} placeholder="General performance rating scale…" />
              </div>
            </div>
          </Card>

          {/* Band Editor */}
          <Card>
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
              <h3 className="text-sm font-bold text-on-surface">Band Editor</h3>
              <div className="flex items-center gap-2">
                {/* Employee Preview toggle button */}
                <button
                  type="button"
                  onClick={() => setPreviewOpen(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    previewOpen
                      ? 'border-secondary bg-secondary-container text-secondary-dark'
                      : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {previewOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                  {previewOpen ? 'Hide Preview' : 'Employee Preview'}
                </button>
                <Button variant="secondary" size="sm" className="gap-1.5" onClick={addNewBand}>
                  <Plus size={12} /> Add New Band
                </Button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  {['Band Label','Min %','Max %','Value','Merit','Color',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bands.map(band => (
                  <tr key={band.id} className={`border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low transition-colors ${editBandId === band.id ? 'bg-secondary-container/20' : ''}`}>
                    <td className="px-4 py-3 text-sm font-semibold text-on-surface">{band.label}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-surface-container-high">{band.minScore}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-surface-container-high">{band.maxScore}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="w-7 h-7 rounded-full bg-secondary-container text-secondary-dark text-xs font-bold flex items-center justify-center">{band.numValue}</span>
                    </td>
                    <td className="px-4 py-3" onClick={e => { e.stopPropagation(); setBands(prev => prev.map(b => b.id === band.id ? { ...b, meritEligible: !b.meritEligible } : b)); }}>
                      <div className="relative w-10 h-5 rounded-full cursor-pointer transition-colors" style={{ backgroundColor: band.meritEligible ? 'var(--secondary)' : 'var(--outline-variant)' }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: band.meritEligible ? '22px' : '2px' }} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-7 h-7 rounded-lg border-2 border-black/10" style={{ backgroundColor: band.color }} />
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="p-1.5" onClick={() => openBand(band)}>
                        <Edit2 size={13} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-outline-variant/20 flex items-center gap-2">
              {isValid
                ? <><CheckCircle size={14} className="text-success" /><span className="text-xs font-semibold text-success">Validation Check: Bands are contiguous and cover 0–100% score range.</span></>
                : <><AlertTriangle size={14} className="text-error" /><span className="text-xs font-semibold text-error">Bands must cover 0–100% without gaps or overlaps.</span></>
              }
            </div>
          </Card>
        </div>

        {/* Right: Employee Preview — only rendered when open */}
        {previewOpen && (
          <div className="space-y-0">
            <Card className="p-5 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-secondary" />
                  <h3 className="text-sm font-bold text-on-surface">Employee Preview</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Live Review Badges</p>

              {/* Scrollable band list — max ~4 cards then scrolls */}
              <div className="overflow-y-auto space-y-2" style={{ maxHeight: '340px' }}>
                {[...bands].sort((a, b) => b.numValue - a.numValue).map(band => (
                  <div key={band.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border shrink-0" style={{ borderColor:`${band.color}33` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-10 rounded-full shrink-0" style={{ backgroundColor: band.color }} />
                      <div>
                        <div className="text-xs font-bold text-on-surface">{band.label}</div>
                        <div className="text-[10px] text-on-surface-variant">Score: {band.minScore} – {band.maxScore}%</div>
                      </div>
                    </div>
                    <div className="text-center bg-surface-container-high rounded-lg px-2.5 py-1.5 shrink-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Level</div>
                      <div className="text-sm font-bold text-primary">{band.numValue}</div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-on-surface-variant leading-relaxed italic mt-3">
                "This preview demonstrates how the ratings will appear to employees and managers during the 'Self-Reflection' and 'Manager Review' steps of the Performance Cycle."
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Band Flyout */}
      {editBandId && (
        <>
          <div className="bg-on-surface/10 fixed inset-0 z-40 backdrop-blur-[2px]" onClick={discardBand} />
          <aside className="bg-surface-container-lowest shadow-ambient-lifted fixed top-16 right-0 z-50 flex h-[calc(100vh-4rem)] w-[380px] flex-col rounded-l-2xl">
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-outline-variant/15 px-6 py-4 bg-surface-container-lowest/90 backdrop-blur-[20px]">
              <div>
                <h2 className="text-lg font-bold font-headline text-primary">Edit Rating Band</h2>
                <p className="text-xs text-on-surface-variant">Update parameters for this performance tier</p>
              </div>
              <Button variant="ghost" size="sm" className="p-2" onClick={() => setEditBandId(null)}><X size={18} /></Button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <FieldLabel>
                  Band Label <Tooltip label="Band Label" description="The name shown to employees and managers for this rating tier." />
                </FieldLabel>
                <Input value={flyLabel} onChange={e => setFlyLabel(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>
                    Min Score (%) <Tooltip label="Min Score (%)" description="The lowest score that falls within this band. Must connect to the previous band's max." />
                  </FieldLabel>
                  <Input type="number" value={flyMin} onChange={e => setFlyMin(Number(e.target.value))} />
                </div>
                <div>
                  <FieldLabel>
                    Max Score (%) <Tooltip label="Max Score (%)" description="The highest score that falls within this band. Must connect to the next band's min." />
                  </FieldLabel>
                  <Input type="number" value={flyMax} onChange={e => setFlyMax(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <FieldLabel>
                  Numerical Value <Tooltip label="Numerical Value" description="The integer score assigned to this band, used in composite score calculations." />
                </FieldLabel>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setFlyValue(n)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${flyValue === n ? 'border-secondary bg-secondary-container text-secondary-dark' : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <div>
                  <div className="text-sm font-bold text-on-surface">Eligible for Merit</div>
                  <div className="text-xs text-on-surface-variant">Include in salary increase calculations</div>
                </div>
                <button type="button" onClick={() => setFlyMerit(m => !m)} className="relative w-12 h-6 rounded-full transition-colors" style={{ backgroundColor: flyMerit ? 'var(--secondary)' : 'var(--outline-variant)' }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: flyMerit ? '26px' : '4px' }} />
                </button>
              </div>
              <div>
                <FieldLabel>Color Code</FieldLabel>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <input type="color" value={flyColor} onChange={e => setFlyColor(e.target.value)} className="absolute inset-0 opacity-0 w-12 h-12 cursor-pointer" />
                    <div className="w-12 h-12 rounded-xl border-2 border-black/10 cursor-pointer" style={{ backgroundColor: flyColor }} />
                  </div>
                  <Input value={flyColor} onChange={e => setFlyColor(e.target.value)} className="font-mono text-secondary" />
                </div>
              </div>
            </div>

            <footer className="sticky bottom-0 z-10 border-t border-outline-variant/15 px-6 py-4 bg-surface-container-lowest/90 backdrop-blur-[20px]">
              {/* Delete band button */}
              <button
                type="button"
                onClick={discardBand}
                className="w-full mb-3 flex items-center justify-center gap-2 py-2 rounded-lg border border-error/30 bg-error/5 text-error text-xs font-bold hover:bg-error/10 transition-colors"
              >
                <Trash2 size={13} /> Delete This Band
              </button>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setEditBandId(null)}>Discard Changes</Button>
                <Button className="flex-1" onClick={applyBand}>Apply Changes</Button>
              </div>
            </footer>
          </aside>
        </>
      )}
    </div>
  );
}
