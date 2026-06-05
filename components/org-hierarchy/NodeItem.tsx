'use client';

import React, { useState } from 'react';
import { OrgNode } from '@/types/org-hierarchy';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  AlertCircle,
  Edit2,
  Archive,
  CheckCircle,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge, Button } from '@/components/ui';

interface Props {
  node: OrgNode;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onClick: () => void;
  onDelete: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  headcountMap: Record<string, number>;
}

export function NodeItem({
  node,
  depth,
  isExpanded,
  hasChildren,
  onToggle,
  onClick,
  onDelete,
  onDeactivate,
  onActivate,
  headcountMap,
}: Props) {
  const isWarningDepth = depth >= 5;
  const isDeactivated  = node.status !== 'Active';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dynamicHeadcount = headcountMap[node.id] ?? 0;

  // ✅ Disable drag for inactive nodes
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: { node },
    disabled: isDeactivated, // 🔥 KEY FIX
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${depth * 32}px`,
    zIndex: isDragging ? 10 : isMenuOpen ? 50 : 1,
    opacity: isDragging ? 0.4 : isDeactivated ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group flex items-center p-3 mb-2 rounded-xl transition-colors cursor-pointer ${
        isDeactivated
          ? 'bg-[var(--surface-container-highest)] hover:bg-[var(--surface-container-high)]'
          : 'bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-low)]'
      } ${
        isDragging
          ? 'shadow-lg border border-[var(--outline-accent)]'
          : 'border border-transparent'
      }`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.disable-card-click')) return;
        onClick();
      }}
    >
      {/* Depth warning stripe */}
      {isWarningDepth && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--warning)] rounded-l-xl opacity-80" />
      )}

      {/* ✅ Drag Handle (disabled for inactive nodes) */}
      <button
        className={`disable-card-click opacity-0 group-hover:opacity-100 p-1 mr-2 transition-opacity ${
          isDeactivated
            ? 'cursor-not-allowed text-[var(--on-surface-muted)]'
            : 'cursor-grab active:cursor-grabbing text-[var(--on-surface-muted)] hover:text-[var(--on-surface)]'
        }`}
        {...(!isDeactivated ? attributes : {})}
        {...(!isDeactivated ? listeners : {})}
        disabled={isDeactivated}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Expand / Collapse Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`disable-card-click p-1 mr-2 rounded-md hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] ${
          !hasChildren && 'invisible'
        }`}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex-grow flex items-center gap-4">
        <div>
          <h5
            className={`text-sm font-semibold flex items-center gap-2 ${
              isDeactivated ? 'text-[var(--on-surface-muted)]' : 'text-[var(--on-surface)]'
            }`}
          >
            {isDeactivated ? `${node.nodeName} (Archived)` : node.nodeName}
            {isWarningDepth && (
              <AlertCircle className="w-3.5 h-3.5 text-[var(--warning)]" />
            )}
          </h5>
          <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">{node.nodeCode}</p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 ml-auto mr-4">
          <Badge variant="default">{node.nodeType}</Badge>

          <Badge variant="default">{dynamicHeadcount} HC</Badge>

          {node.status === 'Active' ? (
            <Badge variant="active">Active</Badge>
          ) : (
            <Badge variant="archived">Archived</Badge>
          )}
        </div>
      </div>

      {/* Context Menu */}
      <div className="relative disable-card-click">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="p-1.5 text-[var(--on-surface-muted)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] rounded-md transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
              }}
            />

            <div className="absolute right-0 mt-1 w-44 bg-[var(--surface-container-lowest)] rounded-lg shadow-xl border border-[var(--outline-variant)] border-opacity-30 z-50 overflow-hidden py-1">

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onClick();
                }}
                className="w-full px-4 py-2 text-sm text-left hover:bg-[var(--surface-container-low)] text-[var(--on-surface)] flex items-center gap-3 transition-colors"
              >
                <Edit2 className="w-4 h-4 opacity-70" /> Edit Node
              </button>

              {isDeactivated ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onActivate();
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-[var(--surface-container-low)] text-[var(--success)] flex items-center gap-3 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 opacity-70" /> Activate
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onDeactivate();
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-[var(--surface-container-low)] text-[var(--warning)] flex items-center gap-3 transition-colors"
                >
                  <Archive className="w-4 h-4 opacity-70" /> Deactivate
                </button>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
