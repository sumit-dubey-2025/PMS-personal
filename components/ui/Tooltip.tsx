'use client';

/**
 * Tooltip — reusable tooltip for any label or element.
 *
 * FILE: components/ui/Tooltip.tsx
 *
 * USAGE:
 *   import { Tooltip } from '@/components/ui/Tooltip';
 *
 *   // Mandatory field — red asterisk + "Required field" in tooltip
 *   <label>Node Name <Tooltip label="Node Name" /></label>
 *
 *   // Mandatory + extra hint
 *   <label>Node Code <Tooltip label="Node Code" description="Uppercase only, max 20 chars" /></label>
 *
 *   // Optional field — no asterisk, just info icon
 *   <label>Description <Tooltip label="Description" required={false} description="Optional hint" /></label>
 *
 *   // No tooltip — just plain label (most fields)
 *   <label>Parent Node</label>
 */

import React, { useState, useRef } from 'react';

interface TooltipProps {
  /** Field name shown in tooltip header */
  label: string;
  /** Shows red asterisk + "Required field" — default: true */
  required?: boolean;
  /** Optional extra description shown in tooltip */
  description?: string;
}

export function Tooltip({ label, required = true, description }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos,     setPos]     = useState<'above' | 'below'>('above');
  const btnRef                 = useRef<HTMLButtonElement>(null);

  const show = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos(rect.top < 180 ? 'below' : 'above');
    }
    setVisible(true);
  };

  return (
    <span className="relative inline-flex items-center align-middle">
      {required && (
        <span className="text-red-500 mx-0.5 text-xs font-bold leading-none">*</span>
      )}
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        onFocus={show}
        onBlur={() => setVisible(false)}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:bg-[var(--outline-variant)] transition-colors cursor-help focus:outline-none ml-0.5"
        aria-label={`Help for ${label}`}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
          <path d="M4 0C1.8 0 0 1.8 0 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm.5 6.5h-1v-1h1v1zm0-2h-1c0-1.5 1.5-1.4 1.5-2.5 0-.6-.4-1-1-1s-1 .4-1 1h-1c0-1.1.9-2 2-2s2 .9 2 2c0 1.4-1.5 1.4-1.5 2.5z"/>
        </svg>
      </button>

      {visible && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-[9999] pointer-events-none ${pos === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
          {pos === 'below' && (
            <div className="flex justify-center mb-[-4px]">
              <div className="w-2 h-2 bg-[var(--on-surface)] rotate-45" />
            </div>
          )}
          <div className="bg-[var(--on-surface)] text-[var(--surface)] rounded-lg px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.2)] min-w-[130px] max-w-[210px]">
            <p className="text-[11px] font-bold leading-tight">{label}</p>
            {required && (
              <p className="text-[10px] mt-0.5 text-red-300 font-semibold">Required field</p>
            )}
            {description && (
              <p className="text-[10px] mt-1 leading-snug opacity-75">{description}</p>
            )}
          </div>
          {pos === 'above' && (
            <div className="flex justify-center mt-[-4px]">
              <div className="w-2 h-2 bg-[var(--on-surface)] rotate-45" />
            </div>
          )}
        </div>
      )}
    </span>
  );
}

export default Tooltip;
