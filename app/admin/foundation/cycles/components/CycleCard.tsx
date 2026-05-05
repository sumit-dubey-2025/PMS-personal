'use client';

import Link from 'next/link';
import { Calendar, BarChart2, Star, Scale, ShieldCheck, Users, Archive, Download, Info } from 'lucide-react';
import type { Cycle } from '@/types/cycle';

// ─── Config Links ──────────────────────────────────────────────────────────────
export function ConfigLinks({ cycleId }: { cycleId: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Configure:</span>
      {[
        { label: 'Rating Scale', icon: <Star size={12} />,       href: `/admin/foundation/cycles/${cycleId}/scales` },
        { label: 'Weighting',    icon: <Scale size={12} />,      href: `/admin/foundation/cycles/${cycleId}/weights` },
        { label: 'Eligibility',  icon: <ShieldCheck size={12} />,href: `/admin/foundation/cycles/${cycleId}/eligibility` },
      ].map(link => (
        <Link key={link.href} href={link.href}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-container-high)] hover:bg-[var(--secondary-container)] text-[var(--on-surface-variant)] hover:text-[var(--secondary-dark)] text-xs font-semibold transition-colors"
        >
          {link.icon} {link.label}
        </Link>
      ))}
    </div>
  );
}

// ─── Active Cycle Card ─────────────────────────────────────────────────────────
interface ActiveCardProps {
  cycle: Cycle;
  onWeightsClick: (cycleId: string) => void;
}

export function ActiveCycleCard({ cycle, onWeightsClick }: ActiveCardProps) {
  return (
    <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-[var(--primary)] font-headline">{cycle.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Active</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">{cycle.type}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={13} className="text-[var(--secondary)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Windows Summary</span>
      </div>
      <p className="text-sm text-[var(--on-surface)]" dangerouslySetInnerHTML={{ __html: cycle.windowSummary }} />
      <div className="flex items-center gap-2 flex-wrap">
        <button className="px-3 py-2 text-xs font-bold text-white bg-[var(--primary-dark)] rounded-lg hover:bg-[var(--primary)] transition-colors">Complete Cycle</button>
        <button className="px-3 py-2 text-xs font-bold text-[var(--on-surface)] bg-[var(--surface-container-high)] rounded-lg hover:bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/50 transition-colors">Archive Cycle</button>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[var(--on-surface)] bg-[var(--surface-container-high)] rounded-lg hover:bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/50 transition-colors">
          <BarChart2 size={12} /> View Analytics
        </button>
      </div>
      <ConfigLinks cycleId={cycle.id} />

      {/* Bottom info cards */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="bg-[var(--surface-container-low)] rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Historical Trends</span>
          <div className="flex items-end gap-1 h-16 mt-3">
            {[35,45,55,50,65,75,90].map((h,i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height:`${h}%`, backgroundColor: i===6 ? 'var(--primary)' : 'var(--surface-container-high)' }} />
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mt-2">Completion rate 2023–2024</p>
        </div>
        <div className="bg-[var(--surface-container-low)] rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-[var(--on-surface)]">Need to adjust weightings?</h3>
          <p className="text-xs text-[var(--on-surface-variant)]">Distribute impact across competencies and goals dynamically.</p>
          <div className="flex gap-2">
            <button onClick={() => onWeightsClick(cycle.id)} className="px-2.5 py-1.5 text-xs font-semibold border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">Scale Designer</button>
            <button className="px-2.5 py-1.5 text-xs font-semibold border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">Docs</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Draft Cycle Card ──────────────────────────────────────────────────────────
interface DraftCardProps {
  cycle: Cycle;
  onActivate: (cycle: Cycle) => void;
}

export function DraftCycleCard({ cycle, onActivate }: DraftCardProps) {
  return (
    <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-6 shadow-sm space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-[var(--primary)] font-headline">{cycle.name}</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">Draft</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">{cycle.type}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={13} className="text-[var(--on-surface-variant)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Windows Summary</span>
      </div>
      <p className="text-sm text-[var(--on-surface)]" dangerouslySetInnerHTML={{ __html: cycle.windowSummary }} />
      <div className="flex items-center gap-2">
        <button onClick={() => onActivate(cycle)} className="px-3 py-2 text-xs font-bold text-white bg-[var(--primary-dark)] rounded-lg hover:bg-[var(--primary)] transition-colors">Activate Cycle</button>
        <button className="px-3 py-2 text-xs font-bold text-[var(--on-surface)] bg-[var(--surface-container-high)] rounded-lg hover:bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/50 transition-colors">Edit Settings</button>
      </div>
      <ConfigLinks cycleId={cycle.id} />
    </div>
  );
}

// ─── Completed Cycle Card ──────────────────────────────────────────────────────
export function CompletedCycleCard({ cycle }: { cycle: Cycle }) {
  return (
    <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">{cycle.type}</span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> COMPLETED
        </span>
      </div>
      <h3 className="text-base font-bold text-[var(--on-surface)]">{cycle.name}</h3>
      <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)]"><Calendar size={11} /> {cycle.dateRange}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--on-surface-variant)]">+{cycle.participants} participants</span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[var(--primary-dark)] rounded-lg hover:bg-[var(--primary)] transition-colors">
          <BarChart2 size={11} /> View Analytics
        </button>
      </div>
    </div>
  );
}

// ─── Archived Cycle Card ───────────────────────────────────────────────────────
export function ArchivedCycleCard({ cycle }: { cycle: Cycle }) {
  return (
    <div className="bg-[var(--surface-container-lowest)] rounded-2xl border border-[var(--outline-variant)]/30 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">ARCHIVED</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">{cycle.type}</span>
      </div>
      <h3 className="text-base font-bold text-[var(--on-surface)]">{cycle.name}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-1">Duration</div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface)]"><Calendar size={11} className="text-[var(--on-surface-variant)]" /> {cycle.dateRange}</div>
        </div>
        {cycle.department && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-1">Department</div>
            <div className="text-xs text-[var(--on-surface)]">{cycle.department}</div>
          </div>
        )}
        {cycle.participants && !cycle.department && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-1">Participants</div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface)]"><Users size={11} className="text-[var(--on-surface-variant)]" /> {cycle.participants.toLocaleString()} Employees</div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        {cycle.auditStatus
          ? <span className="text-[10px] text-[var(--on-surface-variant)]">AUDIT: <strong>{cycle.auditStatus}</strong></span>
          : <span />}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[var(--primary-dark)] rounded-lg hover:bg-[var(--primary)] transition-colors">
          <BarChart2 size={11} /> View Analytics
        </button>
      </div>
    </div>
  );
}
