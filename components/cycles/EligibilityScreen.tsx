'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, CheckCircle, AlertTriangle, X, Save } from 'lucide-react';
import { Button, Card, FieldLabel, Input } from '@/components/ui';

interface Rule { id: string; name: string; tag: string; active: boolean; }

const RULES: Rule[] = [
  { id:'1', name:'Tenure Exclusion',        tag:'TENURE',          active:true },
  { id:'2', name:'Contractor Exclusion',    tag:'EMPLOYMENT TYPE', active:true },
  { id:'3', name:'Engineering Only Filter', tag:'DEPARTMENT',      active:true },
];

const TREE_NODES = [
  { id:'global',    label:'Global Operations', indent:0,  hasChevron:true,  parentId:undefined },
  { id:'eng',       label:'Engineering',        indent:12, hasChevron:true,  parentId:'global' },
  { id:'proddev',   label:'Product Dev',        indent:24, hasChevron:false, parentId:'eng' },
  { id:'infra',     label:'Infrastructure',     indent:24, hasChevron:false, parentId:'eng' },
  { id:'marketing', label:'Marketing',          indent:12, hasChevron:true,  parentId:'global' },
];

function OrgTree() {
  const [checked,  setChecked]  = useState(new Set(['eng','proddev','infra']));
  const [expanded, setExpanded] = useState(new Set(['eng']));

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

function RuleLogicToggle() {
  const [selected, setSelected] = useState<'INCLUDE'|'EXCLUDE'>('INCLUDE');
  return (
    <div className="flex rounded-lg overflow-hidden border border-outline-variant/40">
      {(['INCLUDE','EXCLUDE'] as const).map(opt => (
        <button key={opt} type="button" onClick={() => setSelected(opt)}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${selected===opt ? 'bg-primary-dark text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function EligibilityScreen({ cycleCode }: { cycleCode: string }) {
  const [selectedRule, setSelectedRule] = useState<Rule>(RULES[2]);
  const [ruleName,     setRuleName]     = useState('Engineering Only Filter');
  const [evalOrder,    setEvalOrder]    = useState(3);
  const [subtree,      setSubtree]      = useState(true);
  const [showAdd,      setShowAdd]      = useState(false);

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
        <Button onClick={() => setShowAdd(true)} className="gap-1.5 shrink-0"><Plus size={14} /> Add Rule</Button>
      </div>

      <div className="grid grid-cols-[340px_1fr] gap-6">
        {/* Rule Library */}
        <div className="space-y-3">
          <Card>
            <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">Rule Library</h3>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {RULES.map(rule => (
                <div key={rule.id} onClick={() => { setSelectedRule(rule); setRuleName(rule.name); }}
                  className={`px-5 py-4 cursor-pointer transition-colors ${selectedRule.id === rule.id ? 'bg-secondary-container/40 border-l-2 border-secondary' : 'hover:bg-surface-container-low'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-on-surface">{rule.name}</span>
                    <div className="relative w-9 h-5 rounded-full cursor-pointer transition-colors shrink-0" style={{ backgroundColor: rule.active ? 'var(--secondary)' : 'var(--outline-variant)' }}>
                      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: rule.active ? '18px' : '2px' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-on-surface-variant">{rule.tag}</span>
                    <span className={`text-[10px] font-bold ${rule.active ? 'text-success' : 'text-on-surface-variant'}`}>{rule.active ? 'ACTIVE' : 'INACTIVE'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-on-surface-variant"><AlertTriangle size={13} /> <span className="text-xs font-bold">TIP</span></div>
            <p className="text-xs text-on-surface-variant leading-relaxed">Rules are evaluated in order. If an employee is excluded by a high-priority rule, subsequent rules will not be processed for them.</p>
          </Card>
        </div>

        {/* Rule Builder */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-on-surface">Rule Builder:</h3>
            <span className="text-sm font-bold text-secondary">Department Filter</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><FieldLabel>Rule Name</FieldLabel><Input value={ruleName} onChange={e => setRuleName(e.target.value)} /></div>
            <div><FieldLabel>Org Hierarchy Tree</FieldLabel><OrgTree /></div>
          </div>

          <div><FieldLabel>Description</FieldLabel><textarea rows={3} defaultValue="Only includes permanent full-time employees within the global Engineering organisation." className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-secondary transition-all resize-none" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Eval Order</FieldLabel>
              <Input type="number" value={evalOrder} onChange={e => setEvalOrder(Number(e.target.value))} />
              <p className="mt-1 text-[10px] text-on-surface-variant">Determines processing priority</p>
            </div>
            <div><FieldLabel>Rule Logic</FieldLabel><RuleLogicToggle /></div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSubtree(v => !v)} className="relative w-11 h-6 rounded-full transition-colors" style={{ backgroundColor: subtree ? 'var(--secondary)' : 'var(--outline-variant)' }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: subtree ? '23px' : '3px' }} />
            </button>
            <span className="text-sm font-medium text-on-surface">Include Subtree</span>
          </div>

          <Button className="w-full gap-2"><BarChart size={14} /> Preview Impact</Button>
        </Card>
      </div>
    </div>
  );
}

function BarChart({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
