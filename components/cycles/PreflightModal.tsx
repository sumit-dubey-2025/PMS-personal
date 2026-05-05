'use client';

import { Rocket, X, Users, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import type { Cycle } from '@/types/cycle';
import { PREFLIGHT } from '@/components/cycles/mockData';

interface Props { cycle: Cycle; onClose: () => void; }

export default function PreflightModal({ cycle, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-on-surface/10 fixed inset-0 backdrop-blur-[2px]" onClick={onClose} />
      <Card className="relative w-full max-w-lg p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Rocket size={18} className="text-secondary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-dark">System Readiness</p>
              <h2 className="text-lg font-bold font-headline text-primary">Pre-Flight Activation</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">{cycle.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2"><X size={18} /></Button>
        </div>

        <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
            <Users size={20} className="text-secondary-dark" />
          </div>
          <div>
            <div className="text-xs font-bold text-on-surface-variant">Potential Impact</div>
            <div className="text-sm text-on-surface">Estimated <span className="font-bold text-primary">1,248</span> eligible employees</div>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Activation Checklist</div>
          <div className="space-y-2">
            {PREFLIGHT.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg">
                {item.ok
                  ? <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
                  : <AlertTriangle size={16} className="text-error shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="text-sm font-medium text-on-surface">{item.label}</div>
                  {item.note && <div className={`text-[10px] mt-0.5 font-semibold ${item.ok ? 'text-success' : 'text-error'}`}>{item.note}</div>}
                </div>
                {item.warning && <span className="px-2 py-0.5 text-[10px] font-bold bg-error-container text-error rounded">WARNING</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>← Back to Config</Button>
          <Button className="flex-1 gap-2" onClick={onClose}>Confirm Activation <ArrowRight size={15} /></Button>
        </div>
      </Card>
    </div>
  );
}
