'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, AlertTriangle, X, Save, GripVertical } from 'lucide-react';
import { Button, Card, FieldLabel, Input } from '@/components/ui';
import { Tooltip } from '@/components/ui/Tooltip';

type RuleType = 'TENURE' | 'EMPLOYMENT TYPE' | 'DEPARTMENT' | 'GRADE BAND' | 'CUSTOM';

interface Rule {
  id: string;
  name: string;
  tag: RuleType;
  active: boolean;
  description?: string;
  evalOrder: number;
}

const INITIAL_RULES: Rule[] = [
  { id:'1', name:'Tenure Exclusion',        tag:'TENURE',          active:true,  description:'Exclude employees with < 90 days tenure.',   evalOrder:1 },
  { id:'2', name:'Contractor Exclusion',    tag:'EMPLOYMENT TYPE', active:true,  description:'Include only Permanent and Full-time staff.',  evalOrder:2 },
  { id:'3', name:'Engineering Only Filter', tag:'DEPARTMENT',      active:true,  description:'Only includes Engineering org subtree.',        evalOrder:3 },
];

const TREE_NODES = [
  { id:'global',    label:'Global Operations', indent:0,  hasChevron:true,  parentId:undefined as string|undefined },
  { id:'eng',       label:'Engineering',        indent:12, hasChevron:true,  parentId:'global' },
  { id:'proddev',   label:'Product Dev',        indent:24, hasChevron:false, parentId:'eng' },
  { id:'infra',     label:'Infrastructure',     indent:24, hasChevron:false, parentId:'eng' },
  { id:'marketing', label:'Marketing',          indent:12, hasChevron:true,  parentId:'global' },
];

function OrgTree() {
  const [checked,  setChecked]  = useState(new Set(['eng','proddev','infra']));
  const [expanded, setExpanded] = useState(new Set(['eng','global']));

  const toggle = useCallback((id: string) => setChecked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
  const expand = useCallback((id: string) => setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);

  const visible = TREE_NODES.filter(n => !n.parentId || expanded.has(n.parentId));

  return (
    <div className="border border-outline-variant/40 rounded-lg bg-surface-container-low p-3 space-y-1">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-on-surface">{checked.size} Selected</span>
        <button type="button" onClick={() => setExpanded(new Set(TREE_NODES.filter(n=>n.hasChevron).map(n=>n.id)))} className="text-xs font-semibold text-secondary hover:text-secondary-dark">Expand All</button>
      </div>
      {visible.map(node => (
        <div key={node.id} className="flex items-center gap-2" style={{ paddingLeft:`${node.indent}px` }}>
          {node.hasChevron
            ? <button type="button" onClick={() => expand(node.id)} className="w-4 h-4 flex items-center justify-center text-on-surface-variant">
                <ChevronRight size={12} className={`transition-transform ${expanded.has(node.id) ? 'rotate-90' : ''}`} />
              </button>
            : <div className="w-4" />}
          <input type="checkbox" checked={checked.has(node.id)} onChange={() => toggle(node.id)} className="cursor-pointer accent-secondary" />
          <span className="text-sm text-on-surface">{node.label}</span>
        </div>
      ))}
    </div>
  );
}

function RuleLogicToggle({ value, onChange }: { value: 'INCLUDE'|'EXCLUDE'; onChange: (v:'INCLUDE'|'EXCLUDE') => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-outline-variant/40">
      {(['INCLUDE','EXCLUDE'] as const).map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${value===opt ? 'bg-primary-dark text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className="relative w-9 h-5 rounded-full cursor-pointer transition-colors shrink-0"
      style={{ backgroundColor: active ? 'var(--secondary)' : 'var(--outline-variant)' }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: active ? '18px' : '2px' }} />
    </button>
  );
}

/* ── Add Rule Slide-over ─────────────────────────────────────────── */
function AddRuleSlideOver({
  onClose,
  onSave,
  nextOrder,
}: {
  onClose: () => void;
  onSave: (rule: Omit<Rule, 'id'>) => void;
  nextOrder: number;
}) {
  const [name,        setName]        = useState('');
  const [ruleType,    setRuleType]    = useState<RuleType>('DEPARTMENT');
  const [description, setDescription] = useState('');
  const [evalOrder,   setEvalOrder]   = useState(nextOrder);
  const [logicMode,   setLogicMode]   = useState<'INCLUDE'|'EXCLUDE'>('INCLUDE');
  const [subtree,     setSubtree]     = useState(true);
  const [minTenure,   setMinTenure]   = useState(90);
  const [empTypes,    setEmpTypes]    = useState<string[]>(['Permanent']);
  const [minGrade,    setMinGrade]    = useState(1);
  const [maxGrade,    setMaxGrade]    = useState(5);

  const EMP_OPTIONS = ['Permanent','Contract','Intern','Part-time'];

  function toggleEmpType(t: string) {
    setEmpTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  const canSave = name.trim().length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-[520px] z-50 flex flex-col bg-surface shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div>
            <h2 className="text-lg font-bold font-headline text-on-surface">Add Eligibility Rule</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Configure a new rule to control participant eligibility.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
            <X size={18} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Basic info */}
          <div className="space-y-4">
            <div>
              <FieldLabel>
                Rule Name <Tooltip label="Rule Name" description="A clear, human-readable name for this eligibility rule." />
              </FieldLabel>
              <Input placeholder="e.g. Tenure Exclusion" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
              <FieldLabel>
                Rule Type <Tooltip label="Rule Type" description="Determines which parameter fields are shown and how the rule logic is evaluated." />
              </FieldLabel>
              <select
                value={ruleType}
                onChange={e => setRuleType(e.target.value as RuleType)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary"
              >
                {(['TENURE','EMPLOYMENT TYPE','DEPARTMENT','GRADE BAND','CUSTOM'] as RuleType[]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe what this rule does…"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-secondary transition-all resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>
                  Eval Order <Tooltip label="Eval Order" description="Lower numbers are evaluated first. Employees excluded early skip remaining rules." />
                </FieldLabel>
                <Input type="number" value={evalOrder} onChange={e => setEvalOrder(Number(e.target.value))} min={1} />
                <p className="mt-1 text-[10px] text-on-surface-variant">Determines processing priority</p>
              </div>
              <div>
                <FieldLabel>
                  Rule Logic <Tooltip label="Rule Logic" description="Include: only matching employees participate. Exclude: matching employees are removed." />
                </FieldLabel>
                <RuleLogicToggle value={logicMode} onChange={setLogicMode} />
              </div>
            </div>
          </div>

          {/* Dynamic parameters */}
          <div className="border-t border-outline-variant/20 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Rule Parameters</h3>

            {ruleType === 'TENURE' && (
              <div>
                <FieldLabel>
                  Minimum Tenure (days) <Tooltip label="Minimum Tenure (days)" description="Employees with fewer days of tenure than this value will be excluded." />
                </FieldLabel>
                <Input type="number" value={minTenure} onChange={e => setMinTenure(Number(e.target.value))} min={0} />
                <p className="mt-1 text-xs text-on-surface-variant">Auto-label: "Exclude employees with &lt; {minTenure} days tenure."</p>
              </div>
            )}

            {ruleType === 'EMPLOYMENT TYPE' && (
              <div className="space-y-2">
                <FieldLabel>
                  Employment Types <Tooltip label="Employment Types" description="Select which employment types this rule applies to." />
                </FieldLabel>
                {EMP_OPTIONS.map(t => (
                  <label key={t} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-surface-container-low">
                    <input type="checkbox" checked={empTypes.includes(t)} onChange={() => toggleEmpType(t)} className="accent-secondary cursor-pointer" />
                    <span className="text-sm text-on-surface">{t}</span>
                  </label>
                ))}
              </div>
            )}

            {ruleType === 'DEPARTMENT' && (
              <div className="space-y-3">
                <FieldLabel>
                  Org Hierarchy Selection <Tooltip label="Org Hierarchy Selection" description="Select one or more departments. Enable Include Subtree to include all child nodes." />
                </FieldLabel>
                <OrgTree />
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setSubtree(v => !v)} className="relative w-11 h-6 rounded-full transition-colors" style={{ backgroundColor: subtree ? 'var(--secondary)' : 'var(--outline-variant)' }}>
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: subtree ? '23px' : '3px' }} />
                  </button>
                  <span className="text-sm font-medium text-on-surface">Include Subtree (all descendants)</span>
                </label>
              </div>
            )}

            {ruleType === 'GRADE BAND' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>
                    Min Grade Level <Tooltip label="Min Grade Level" description="Employees at or above this grade level will be matched by this rule." />
                  </FieldLabel>
                  <Input type="number" value={minGrade} onChange={e => setMinGrade(Number(e.target.value))} min={1} max={7} />
                </div>
                <div>
                  <FieldLabel>
                    Max Grade Level <Tooltip label="Max Grade Level" description="Employees at or below this grade level will be matched by this rule." />
                  </FieldLabel>
                  <Input type="number" value={maxGrade} onChange={e => setMaxGrade(Number(e.target.value))} min={1} max={7} />
                </div>
                <p className="col-span-2 text-xs text-on-surface-variant">Includes employees within grade levels {minGrade}–{maxGrade}.</p>
              </div>
            )}

            {ruleType === 'CUSTOM' && (
              <div>
                <FieldLabel>
                  JSON Logic <Tooltip label="JSON Logic" description="Advanced — must be valid JSON Logic syntax. For IT/system admins only." />
                </FieldLabel>
                <textarea rows={6}
                  placeholder={'{\n  "and": [\n    { ">": [{ "var": "tenure_days" }, 90] }\n  ]\n}'}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface text-xs font-mono outline-none focus:ring-2 focus:ring-secondary transition-all resize-none" />
                <p className="mt-1 text-[10px] text-on-surface-variant">Advanced — for IT/system admins only. Must be valid JSON Logic.</p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-start gap-2">
            <AlertTriangle size={13} className="text-on-surface-variant shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">After saving, use <strong>Preview Impact</strong> to see how many employees are affected before activating the cycle.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" disabled={!canSave}
            onClick={() => { onSave({ name, tag: ruleType, active: true, description, evalOrder }); onClose(); }}>
            <Save size={14} /> Add Rule
          </Button>
        </div>
      </div>
    </>
  );
}

function BarChart({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

/* ── Main EligibilityScreen ──────────────────────────────────────── */
export default function EligibilityScreen({ cycleCode }: { cycleCode: string }) {
  const [rules,        setRules]        = useState<Rule[]>(INITIAL_RULES);
  const [selectedRule, setSelectedRule] = useState<Rule>(INITIAL_RULES[2]);
  const [ruleName,     setRuleName]     = useState(INITIAL_RULES[2].name);
  const [evalOrder,    setEvalOrder]    = useState(INITIAL_RULES[2].evalOrder);
  const [subtree,      setSubtree]      = useState(true);
  const [logicMode,    setLogicMode]    = useState<'INCLUDE'|'EXCLUDE'>('INCLUDE');
  const [showAdd,      setShowAdd]      = useState(false);

  function toggleRule(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    setSelectedRule(prev => prev.id === id ? { ...prev, active: !prev.active } : prev);
  }

  function handleAddRule(ruleData: Omit<Rule, 'id'>) {
    const newRule: Rule = { ...ruleData, id: String(Date.now()) };
    setRules(prev => [...prev, newRule]);
    setSelectedRule(newRule);
    setRuleName(newRule.name);
    setEvalOrder(newRule.evalOrder);
  }

  function handleSelectRule(rule: Rule) {
    setSelectedRule(rule);
    setRuleName(rule.name);
    setEvalOrder(rule.evalOrder);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        <Link href="/admin/foundation/cycles" className="hover:text-primary transition-colors">Cycles</Link>
        <ChevronRight size={12} />
        <span className="text-primary">Eligibility Rules</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-primary">Eligibility Rules</h1>
          <p className="text-sm text-on-surface-variant mt-1">Define and manage eligibility logic for compensation and performance reviews.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-1.5 shrink-0">
          <Plus size={14} /> Add Rule
        </Button>
      </div>

      <div className="grid grid-cols-[340px_1fr] gap-6">

        {/* Rule Library */}
        <div className="space-y-3">
          <Card>
            <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">Rule Library</h3>
              <span className="text-xs text-on-surface-variant">{rules.length} rule{rules.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {rules.map(rule => (
                <div key={rule.id} onClick={() => handleSelectRule(rule)}
                  className={`px-5 py-4 cursor-pointer transition-colors ${selectedRule.id === rule.id ? 'bg-secondary-container/40 border-l-2 border-secondary' : 'hover:bg-surface-container-low'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-outline-variant cursor-grab" />
                      <span className="text-sm font-semibold text-on-surface">{rule.name}</span>
                    </div>
                    <div onClick={e => { e.stopPropagation(); toggleRule(rule.id); }}>
                      <Toggle active={rule.active} onChange={() => {}} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-6">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-on-surface-variant">{rule.tag}</span>
                    <span className={`text-[10px] font-bold ${rule.active ? 'text-success' : 'text-on-surface-variant'}`}>{rule.active ? 'ACTIVE' : 'INACTIVE'}</span>
                    <span className="text-[10px] text-on-surface-variant ml-auto">#{rule.evalOrder}</span>
                  </div>
                </div>
              ))}
              {rules.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-on-surface-variant">
                  No rules yet. Click <strong>Add Rule</strong> to get started.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <AlertTriangle size={13} />
              <span className="text-xs font-bold">TIP</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">Rules are evaluated in order. If an employee is excluded by a high-priority rule, subsequent rules will not be processed for them.</p>
          </Card>
        </div>

        {/* Rule Builder */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-on-surface">Rule Builder:</h3>
            <span className="text-sm font-bold text-secondary">{selectedRule.tag}</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">Active</span>
              <div onClick={() => toggleRule(selectedRule.id)}>
                <Toggle active={selectedRule.active} onChange={() => {}} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>
                Rule Name <Tooltip label="Rule Name" description="A clear, human-readable name for this eligibility rule." />
              </FieldLabel>
              <Input value={ruleName} onChange={e => setRuleName(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Org Hierarchy Tree</FieldLabel>
              <OrgTree />
            </div>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea rows={3} defaultValue={selectedRule.description ?? ''}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-secondary transition-all resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>
                Eval Order <Tooltip label="Eval Order" description="Lower numbers are evaluated first. Employees excluded early skip remaining rules." />
              </FieldLabel>
              <Input type="number" value={evalOrder} onChange={e => setEvalOrder(Number(e.target.value))} />
              <p className="mt-1 text-[10px] text-on-surface-variant">Determines processing priority</p>
            </div>
            <div>
              <FieldLabel>
                Rule Logic <Tooltip label="Rule Logic" description="Include: only matching employees participate. Exclude: matching employees are removed." />
              </FieldLabel>
              <RuleLogicToggle value={logicMode} onChange={setLogicMode} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSubtree(v => !v)} className="relative w-11 h-6 rounded-full transition-colors" style={{ backgroundColor: subtree ? 'var(--secondary)' : 'var(--outline-variant)' }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: subtree ? '23px' : '3px' }} />
            </button>
            <span className="text-sm font-medium text-on-surface">Include Subtree</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1 gap-2"><BarChart size={14} /> Preview Impact</Button>
            <Button variant="secondary" className="gap-2"><Save size={14} /> Save Rule</Button>
          </div>
        </Card>
      </div>

      {showAdd && (
        <AddRuleSlideOver
          onClose={() => setShowAdd(false)}
          onSave={handleAddRule}
          nextOrder={rules.length + 1}
        />
      )}
    </div>
  );
}
