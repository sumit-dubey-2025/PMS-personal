'use client';

import Link from 'next/link';
import { Calendar, BarChart2, Star, Scale, ShieldCheck, Users } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import type { Cycle } from '@/types/cycle';

// ─── Config Links ──────────────────────────────────────────────────────────────
export function ConfigLinks({ cycleId }: { cycleId: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Configure:</span>
      {[
        { label: 'Rating Scale', icon: <Star size={12} />,        href: `/admin/foundation/cycles/${cycleId}/scales` },
        { label: 'Weighting',    icon: <Scale size={12} />,       href: `/admin/foundation/cycles/${cycleId}/weights` },
        { label: 'Eligibility',  icon: <ShieldCheck size={12} />, href: `/admin/foundation/cycles/${cycleId}/eligibility` },
      ].map(link => (
        <Link key={link.href} href={link.href}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-on-surface-variant hover:text-secondary-dark hover:bg-secondary-container">
            {link.icon} {link.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}

// ─── Active Cycle Card ─────────────────────────────────────────────────────────
export function ActiveCycleCard({ cycle, onWeightsClick }: { cycle: Cycle; onWeightsClick: (id: string) => void }) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-primary font-headline">{cycle.name}</h3>
            <Badge variant="active">Active</Badge>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{cycle.type}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={13} className="text-secondary" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Windows Summary</span>
      </div>
      <p className="text-sm text-on-surface" dangerouslySetInnerHTML={{ __html: cycle.windowSummary }} />
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm">Complete Cycle</Button>
        <Button variant="secondary" size="sm">Archive Cycle</Button>
        <Button variant="secondary" size="sm" className="gap-1.5"><BarChart2 size={12} /> View Analytics</Button>
      </div>
      <ConfigLinks cycleId={cycle.id} />
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="bg-surface-container-low rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Historical Trends</span>
          <div className="flex items-end gap-1 h-16 mt-3">
            {[35,45,55,50,65,75,90].map((h,i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height:`${h}%`, backgroundColor: i===6 ? 'var(--primary)' : 'var(--surface-container-high)' }} />
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-2">Completion rate 2023–2024</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-on-surface">Need to adjust weightings?</h3>
          <p className="text-xs text-on-surface-variant">Distribute impact across competencies and goals dynamically.</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onWeightsClick(cycle.id)}>Scale Designer</Button>
            <Button variant="ghost" size="sm">Docs</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Draft Cycle Card ──────────────────────────────────────────────────────────
export function DraftCycleCard({ cycle, onActivate }: { cycle: Cycle; onActivate: (cycle: Cycle) => void }) {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-primary font-headline">{cycle.name}</h3>
          <Badge variant="draft">Draft</Badge>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{cycle.type}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={13} className="text-on-surface-variant" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Windows Summary</span>
      </div>
      <p className="text-sm text-on-surface" dangerouslySetInnerHTML={{ __html: cycle.windowSummary }} />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => onActivate(cycle)}>Activate Cycle</Button>
        <Button variant="secondary" size="sm">Edit Settings</Button>
      </div>
      <ConfigLinks cycleId={cycle.id} />
    </Card>
  );
}

// ─── Completed Cycle Card ──────────────────────────────────────────────────────
export function CompletedCycleCard({ cycle }: { cycle: Cycle }) {
  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{cycle.type}</span>
        <Badge variant="completed">Completed</Badge>
      </div>
      <h3 className="text-base font-bold text-on-surface">{cycle.name}</h3>
      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant"><Calendar size={11} /> {cycle.dateRange}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-on-surface-variant">+{cycle.participants} participants</span>
        <Button size="sm" className="gap-1.5"><BarChart2 size={11} /> View Analytics</Button>
      </div>
    </Card>
  );
}

// ─── Archived Cycle Card ───────────────────────────────────────────────────────
export function ArchivedCycleCard({ cycle }: { cycle: Cycle }) {
  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="archived">Archived</Badge>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{cycle.type}</span>
      </div>
      <h3 className="text-base font-bold text-on-surface">{cycle.name}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Duration</div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface"><Calendar size={11} className="text-on-surface-variant" /> {cycle.dateRange}</div>
        </div>
        {cycle.department && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Department</div>
            <div className="text-xs text-on-surface">{cycle.department}</div>
          </div>
        )}
        {cycle.participants && !cycle.department && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Participants</div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface"><Users size={11} className="text-on-surface-variant" /> {cycle.participants.toLocaleString()}</div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        {cycle.auditStatus ? <span className="text-[10px] text-on-surface-variant">AUDIT: <strong>{cycle.auditStatus}</strong></span> : <span />}
        <Button size="sm" className="gap-1.5"><BarChart2 size={11} /> View Analytics</Button>
      </div>
    </Card>
  );
}
