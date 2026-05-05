'use client';

import React from 'react';
import { AlertTriangle, Trash2, Archive, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'warning' | 'success';
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-[var(--error-container)] bg-opacity-30',
    iconColor: 'text-[var(--error)]',
    confirmClass: 'bg-[var(--error)] hover:opacity-90 text-white',
  },
  warning: {
    icon: Archive,
    iconBg: 'bg-[var(--warning-container,#FEF3E2)] bg-opacity-40',
    iconColor: 'text-[var(--warning)]',
    confirmClass: 'bg-[var(--warning)] hover:opacity-90 text-white',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-[var(--primary-container,#E8F0FE)] bg-opacity-30',
    iconColor: 'text-[var(--primary)]',
    confirmClass: 'bg-[var(--primary)] hover:bg-[var(--primary-light)] text-[var(--on-primary)]',
  },
};

export function ConfirmDialog({ isOpen, title, message, confirmLabel, variant, isLoading, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  const { icon: Icon, iconBg, iconColor, confirmClass } = variantConfig[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--primary-dark)] bg-opacity-40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-[var(--surface-container-lowest)] backdrop-blur-[20px] rounded-2xl shadow-[0_24px_64px_rgba(33,33,33,0.18)] w-full max-w-sm mx-4 overflow-hidden">
        {/* Body */}
        <div className="p-8 flex flex-col items-center text-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-7 h-7 ${iconColor}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--on-surface)]">{title}</h2>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--outline-variant)] border-opacity-50 text-[var(--on-surface)] text-sm font-semibold hover:bg-[var(--surface-container-low)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 ${confirmClass}`}
          >
            {isLoading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
