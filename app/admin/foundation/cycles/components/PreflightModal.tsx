'use client';

import { Rocket, X, Users, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Cycle } from '@/types/cycle';
import { PREFLIGHT } from './mockData';

interface Props {
  cycle: Cycle;
  onClose: () => void;
}

export default function PreflightModal({ cycle, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="bg-[var(--on-surface)]/10 fixed inset-0 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--surface-container-lowest)] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-lg p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Rocket size={18} className="text-[var(--secondary)]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--secondary-dark)]">System Readiness</p>
              <h2 className="text-lg font-bold font-headline text-[var(--primary)]">Pre-Flight Activation</h2>
              <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">{cycle.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <X size={18} className="text-[var(--on-surface-variant)]" />
          </button>
        </div>

        {/* Potential impact */}
        <div className="flex items-center gap-3 p-4 bg-[var(--surface-container-low)] rounded-xl">
          <div className="w-10 h-10 rounded-full bg-[var(--secondary-container)] flex items-center justify-center shrink-0">
            <Users size={20} className="text-[var(--secondary-dark)]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--on-surface-variant)]">Potential Impact</div>
            <div className="text-sm text-[var(--on-surface)]">
              Estimated <span className="font-bold text-[var(--primary)]">1,248</span> eligible employees
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)] mb-3">
            Activation Checklist
          </div>
          <div className="space-y-2">
            {PREFLIGHT.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[var(--surface-container-low)] rounded-lg">
                {item.ok
                  ? <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  : <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--on-surface)]">{item.label}</div>
                  {item.note && (
                    <div className={`text-[10px] mt-0.5 font-semibold ${item.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item.note}
                    </div>
                  )}
                </div>
                {item.warning && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded">WARNING</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-[var(--on-surface)] bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] rounded-lg transition-colors"
          >
            ← Back to Config
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] rounded-lg shadow-[0_4px_12px_rgba(0,25,66,0.3)] transition-colors"
          >
            Confirm Activation <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
