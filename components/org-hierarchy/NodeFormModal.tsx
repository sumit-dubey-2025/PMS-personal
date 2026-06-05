'use client';

import React, { useEffect } from 'react';
import { OrgNode } from '@/types/org-hierarchy';
import { NodeEditSlideOver } from './NodeEditSlideOver';

interface Props {
  node: OrgNode | null;
  isOpen: boolean;
  allNodes: OrgNode[];
  onClose: () => void;
  onSaved: (node: OrgNode, mode: 'add' | 'edit') => void;
  headcountMap: Record<string, number>;
}

export function NodeFormModal({ node, isOpen, allNodes, onClose, onSaved, headcountMap }: Props) {
  // Lock body scroll while panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0, 29, 66, 0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Right-side panel — full screen height, fixed width, no horizontal scroll */}
      <div
        className="relative h-full w-[480px] flex flex-col bg-[var(--surface-container-lowest)] shadow-[-8px_0_40px_rgba(0,29,66,0.18)] overflow-hidden"
        style={{ animation: 'nodePanelSlideIn 0.28s cubic-bezier(0.16,1,0.3,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left edge gradient accent — vertical version of pp19 top bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] shrink-0 z-10"
          style={{ background: 'linear-gradient(180deg, var(--primary-dark, #001942), var(--primary, #002D6A), var(--secondary, #4AC6E9))' }}
        />

        {/* NodeEditSlideOver — override its fixed sizing so it fills the panel correctly */}
        {/* overflow-x-hidden prevents any horizontal scroll; overflow-y-auto gives vertical scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [&>div]:h-auto [&>div]:w-full [&>div]:shadow-none [&>div]:rounded-none [&>div]:shrink-0">
          <NodeEditSlideOver
            node={node}
            isOpen={isOpen}
            allNodes={allNodes}
            onClose={onClose}
            onSaved={onSaved}
            headcountMap={headcountMap}
          />
        </div>
      </div>

      <style>{`
        @keyframes nodePanelSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </div>
  );
}
