'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Add, Download } from '@/components/ui/Icons';
import { Button } from '@/components/ui';
import type { JobLevel } from '@/types/role';
import JobLevelFormPanel from './JobLevelFormPanel';
import {
  useCreateJobLevel,
  usePatchJobLevel,
  useArchiveJobLevel,
  useReorderJobLevels,
} from '@/hooks/useRoleMutations';

interface Props {
  jobLevels: JobLevel[];
  isLoading: boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-0 px-0 py-4 animate-pulse border-b border-[var(--outline-variant)]/20">
      <div className="w-10 flex justify-center"><div className="h-4 w-4 rounded bg-[var(--surface-container-high)]" /></div>
      <div className="w-[220px] space-y-1.5">
        <div className="h-4 w-32 rounded bg-[var(--surface-container-high)]" />
        <div className="h-3 w-20 rounded bg-[var(--surface-container-high)]" />
      </div>
      <div className="w-[100px]"><div className="h-6 w-14 rounded-md bg-[var(--surface-container-high)]" /></div>
      <div className="w-[160px]"><div className="h-4 w-24 rounded bg-[var(--surface-container-high)]" /></div>
      <div className="flex-1 flex justify-end pr-5"><div className="h-8 w-36 rounded bg-[var(--surface-container-high)]" /></div>
    </div>
  );
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────
function SortableRow({
  level,
  isSelected,
  onClick,
}: {
  level: JobLevel;
  isSelected: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: level.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const formattedSalary =
    level.salaryMin && level.salaryMax
      ? `$${level.salaryMin.toLocaleString()} – $${level.salaryMax.toLocaleString()}`
      : '—';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={[
        'flex items-center gap-0 cursor-pointer transition-colors border-b border-[var(--outline-variant)]/20 last:border-0 group select-none',
        isDragging
          ? 'bg-[var(--surface-container-low)] shadow-lg rounded-lg'
          : isSelected
            ? 'bg-[var(--secondary-container)]/20 border-l-[3px] border-l-[var(--secondary)]'
            : 'hover:bg-[var(--surface-container-low)] border-l-[3px] border-l-transparent',
      ].join(' ')}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="w-10 flex justify-center py-4 cursor-grab active:cursor-grabbing"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={[
          'transition-colors',
          isSelected ? 'text-[var(--secondary)]' : 'text-[var(--on-surface-muted)] group-hover:text-[var(--on-surface-variant)]',
        ].join(' ')}>
          <circle cx="5" cy="4" r="1.5" fill="currentColor" />
          <circle cx="11" cy="4" r="1.5" fill="currentColor" />
          <circle cx="5" cy="8" r="1.5" fill="currentColor" />
          <circle cx="11" cy="8" r="1.5" fill="currentColor" />
          <circle cx="5" cy="12" r="1.5" fill="currentColor" />
          <circle cx="11" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Name + track */}
      <div className="w-[220px] py-4 shrink-0">
        <p className={[
          'text-sm font-semibold',
          isSelected ? 'text-[var(--secondary-dark)]' : 'text-[var(--on-surface)] group-hover:text-[var(--primary)]',
        ].join(' ')}>
          {level.name}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--on-surface-muted)] mt-0.5">
          {level.track}
        </p>
      </div>

      {/* Code badge */}
      <div className="w-[100px] py-4 shrink-0">
        <span className={[
          'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border',
          isSelected
            ? 'bg-[var(--secondary)] text-[var(--on-secondary)] border-[var(--secondary)]'
            : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]/30',
        ].join(' ')}>
          {level.code}
        </span>
      </div>

      {/* Level band */}
      <div className="w-[160px] py-4 shrink-0">
        <span className="text-sm text-[var(--on-surface-variant)]">
          Level Band: <span className="font-semibold text-[var(--on-surface)]">{level.band}</span>
        </span>
      </div>

      {/* Salary */}
      <div className="flex-1 py-4 text-right pr-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--on-surface-muted)]">Salary Band</p>
        <p className="text-sm font-semibold text-[var(--primary)] mt-0.5">{formattedSalary}</p>
      </div>

      {/* Chevron when selected */}
      {isSelected && (
        <div className="w-8 flex justify-center shrink-0 pr-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--secondary-dark)]">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── JobLevelsTab ─────────────────────────────────────────────────────────────
export default function JobLevelsTab({ jobLevels, isLoading }: Props) {
  const [panelOpen,     setPanelOpen]     = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<JobLevel | null>(null);
  const [localLevels,   setLocalLevels]   = useState<JobLevel[]>([]);
  const [initialized,   setInitialized]   = useState(false);

  // Sync local state from props on first load
  if (!initialized && jobLevels.length > 0) {
    setLocalLevels([...jobLevels].sort((a, b) => a.order - b.order));
    setInitialized(true);
  }

  const createMutation  = useCreateJobLevel();
  const patchMutation   = usePatchJobLevel();
  const archiveMutation = useArchiveJobLevel();
  const reorderMutation = useReorderJobLevels();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localLevels.findIndex((l) => l.id === active.id);
    const newIndex = localLevels.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(localLevels, oldIndex, newIndex);
    setLocalLevels(reordered);
    reorderMutation.mutate(reordered.map((l) => l.id));
  };

  const handleRowClick = (level: JobLevel) => {
    setSelectedLevel(level);
    setPanelOpen(true);
  };

  const handleAddNew = () => {
    setSelectedLevel(null);
    setPanelOpen(true);
  };

  const displayLevels = initialized ? localLevels : [...jobLevels].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--on-surface)]">Job Levels</h2>
          <p className="text-xs text-[var(--on-surface-muted)]">
            Configure and reorder organisational tiers for competency mapping.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download size={14} />
            Download Matrix PDF
          </Button>
          <Button size="sm" onClick={handleAddNew}>
            <Add size={14} />
            Add Level
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/30 shadow-sm overflow-hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : displayLevels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="material-symbols-rounded text-4xl text-[var(--on-surface-muted)]">schema</span>
            <p className="text-sm font-semibold text-[var(--on-surface)]">No job levels defined</p>
            <p className="text-xs text-[var(--on-surface-muted)]">Click "Add Level" to get started.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayLevels.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {displayLevels.map((level) => (
                <SortableRow
                  key={level.id}
                  level={level}
                  isSelected={panelOpen && selectedLevel?.id === level.id}
                  onClick={() => handleRowClick(level)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer */}
      {!isLoading && displayLevels.length > 0 && (
        <div className="flex items-center justify-between text-[11px] text-[var(--on-surface-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--success)] inline-block" />
            Active Framework: 2024 Q3 &nbsp;·&nbsp; Last updated by HR Admin · 2h ago
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="hover:text-[var(--on-surface)] transition-colors">Download Matrix PDF</button>
            <button type="button" className="hover:text-[var(--on-surface)] transition-colors">Audit Logs</button>
          </div>
        </div>
      )}

      <JobLevelFormPanel
        isOpen={panelOpen}
        jobLevel={selectedLevel}
        onClose={() => setPanelOpen(false)}
        createMutation={createMutation}
        patchMutation={patchMutation}
        archiveMutation={archiveMutation}
      />
    </div>
  );
}
