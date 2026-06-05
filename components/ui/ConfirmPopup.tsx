'use client';

// src/web/components/ui/ConfirmPopup.tsx
//
// Reusable confirmation popup used across the goal module and anywhere else.
// Supports: title, message, variant (warning / danger / info), cancel + confirm labels.
// Usage:
//   <ConfirmPopup
//     open={showConfirm}
//     variant="danger"
//     title="Decline Goal?"
//     message="Once declined you cannot undo this action."
//     confirmLabel="Yes, Decline"
//     onConfirm={() => handleDecline()}
//     onCancel={() => setShowConfirm(false)}
//   />

import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ConfirmPopupVariant = 'warning' | 'danger' | 'info' | 'success';

interface ConfirmPopupProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmPopupVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_CONFIG: Record<ConfirmPopupVariant, {
  iconBg: string; iconColor: string; icon: React.ReactNode;
  confirmBg: string; confirmText: string; confirmHover: string; border: string;
}> = {
  warning: {
    iconBg: 'bg-warning-container', iconColor: 'text-warning',
    icon: <AlertTriangle size={22} />,
    confirmBg: 'bg-warning', confirmText: 'text-white', confirmHover: 'hover:opacity-90',
    border: 'border-warning/20',
  },
  danger: {
    iconBg: 'bg-error-container', iconColor: 'text-error',
    icon: <AlertCircle size={22} />,
    confirmBg: 'bg-error', confirmText: 'text-white', confirmHover: 'hover:opacity-90',
    border: 'border-error/20',
  },
  info: {
    iconBg: 'bg-primary/10', iconColor: 'text-primary',
    icon: <Info size={22} />,
    confirmBg: 'bg-primary', confirmText: 'text-on-primary', confirmHover: 'hover:opacity-90',
    border: 'border-primary/20',
  },
  success: {
    iconBg: 'bg-success-container', iconColor: 'text-success',
    icon: <AlertCircle size={22} />,
    confirmBg: 'bg-success', confirmText: 'text-white', confirmHover: 'hover:opacity-90',
    border: 'border-success/20',
  },
};

export default function ConfirmPopup({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmPopupProps) {
  if (!open) return null;

  const cfg = VARIANT_CONFIG[variant];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Card */}
      <div className={`relative z-10 w-full max-w-sm rounded-2xl bg-surface-container-lowest shadow-2xl border ${cfg.border} overflow-hidden`}>
        {/* Top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <X size={14} />
        </button>

        <div className="px-6 pt-6 pb-5">
          {/* Icon */}
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${cfg.iconBg} ${cfg.iconColor}`}>
            {cfg.icon}
          </div>

          {/* Text */}
          <h2 className="text-base font-bold font-headline text-on-surface mb-2">{title}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${cfg.confirmBg} ${cfg.confirmText} ${cfg.confirmHover}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
