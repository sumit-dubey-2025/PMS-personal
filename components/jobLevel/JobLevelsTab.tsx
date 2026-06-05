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
import { Add } from '@/components/ui/Icons';
import { Button } from '@/components/ui';
import type { JobLevel } from '@/types/jobLevel';
import JobLevelFormPanel from './JobLevelFormPanel';
import ConfirmPopup from '@/components/ui/ConfirmPopup';
import {
  useCreateJobLevel,
  usePatchJobLevel,
  useArchiveJobLevel,
  useReorderJobLevels,
  useDeleteJobLevel,
} from '@/hooks/useJobLevelMutations';

interface Props {
  jobLevels: JobLevel[];
  isLoading: boolean;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-[var(--outline-variant)]/20">
      <td className="px-4 py-4 w-10"><div className="h-4 w-4 rounded bg-[var(--surface-container-high)] mx-auto" /></td>
      <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-[var(--surface-container-high)]" /></td>
      <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-[var(--surface-container-high)]" /></td>
      <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-[var(--surface-container-high)]" /></td>
      <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-[var(--surface-container-high)]" /></td>
      <td className="px-4 py-4"><div className="h-6 w-16 rounded bg-[var(--surface-container-high)]" /></td>
    </tr>
  );
}

function SortableRow({
  level,
  onEdit,
  onDelete,
}: {
  level: JobLevel;
  onEdit: (level: JobLevel) => void;
  onDelete: (level: JobLevel) => void;
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

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={[
        'border-b border-[var(--outline-variant)]/20 last:border-0 group select-none transition-colors',
        isDragging
          ? 'bg-[var(--surface-container-low)] shadow-lg'
          : 'hover:bg-[var(--surface-container-low)]',
      ].join(' ')}
    >
      {/* Drag handle */}
      <td className="w-10 px-4 py-4 text-center">
        <div
          {...attributes}
          {...listeners}
          className="inline-flex cursor-grab active:cursor-grabbing text-[var(--on-surface-muted)] group-hover:text-[var(--on-surface-variant)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="5" cy="4" r="1.5" fill="currentColor" />
            <circle cx="11" cy="4" r="1.5" fill="currentColor" />
            <circle cx="5" cy="8" r="1.5" fill="currentColor" />
            <circle cx="11" cy="8" r="1.5" fill="currentColor" />
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="11" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </td>

      {/* Level ID */}
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]/30">
          {level.code}
        </span>
      </td>

      {/* Title */}
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-[var(--on-surface)]">{level.name}</p>
      </td>

      {/* Grade / Level Band */}
      <td className="px-4 py-4">
        <span className="text-sm text-[var(--on-surface-variant)]">
          Level Band: <span className="font-semibold text-[var(--on-surface)]">{level.band}</span>
        </span>
      </td>

      {/* Salary Band */}
      <td className="px-4 py-4">
        <p className="text-sm text-[var(--on-surface-variant)]">
          {level.salaryMin && level.salaryMax
            ? `$${level.salaryMin.toLocaleString()} – $${level.salaryMax.toLocaleString()}`
            : '—'}
        </p>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(level)}
            className="p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--primary)] transition-colors"
            title="Edit"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(level)}
            className="p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--error-container)] hover:text-[var(--error)] transition-colors"
            title="Delete"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function JobLevelsTab({ jobLevels, isLoading }: Props) {
  const [panelOpen,       setPanelOpen]       = useState(false);
  const [selectedLevel,   setSelectedLevel]   = useState<JobLevel | null>(null);
  const [localLevels,     setLocalLevels]     = useState<JobLevel[]>([]);
  const [initialized,     setInitialized]     = useState(false);
  const [deleteTarget,    setDeleteTarget]    = useState<JobLevel | null>(null);

  if (!initialized && jobLevels.length > 0) {
    setLocalLevels([...jobLevels].sort((a, b) => a.order - b.order));
    setInitialized(true);
  }

  const createMutation  = useCreateJobLevel();
  const patchMutation   = usePatchJobLevel();
  const archiveMutation = useArchiveJobLevel();
  const reorderMutation = useReorderJobLevels();
  const deleteMutation  = useDeleteJobLevel();

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

  const handleEdit = (level: JobLevel) => {
    setSelectedLevel(level);
    setPanelOpen(true);
  };

  const handleAddNew = () => {
    setSelectedLevel(null);
    setPanelOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setLocalLevels((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const displayLevels = initialized ? localLevels : [...jobLevels].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--on-surface)]">Job Levels</h2>
          <p className="text-xs text-[var(--on-surface-muted)]">
            Configure and reorder organisational tiers. Drag rows to reorder.
          </p>
        </div>
        <Button size="sm" onClick={handleAddNew}>
          <Add size={14} />
          Add Level
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/30 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Level ID</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Title</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Grade</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Salary Band</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : displayLevels.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <span className="material-symbols-rounded text-4xl text-[var(--on-surface-muted)]">layers</span>
                  <p className="mt-2 text-sm font-semibold text-[var(--on-surface)]">No job levels defined</p>
                  <p className="text-xs text-[var(--on-surface-muted)]">Click "Add Level" to get started.</p>
                </td>
              </tr>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={displayLevels.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  {displayLevels.map((level) => (
                    <SortableRow
                      key={level.id}
                      level={level}
                      onEdit={handleEdit}
                      onDelete={(l) => setDeleteTarget(l)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Panel */}
      <JobLevelFormPanel
        isOpen={panelOpen}
        jobLevel={selectedLevel}
        onClose={() => setPanelOpen(false)}
        createMutation={createMutation}
        patchMutation={patchMutation}
        archiveMutation={archiveMutation}
      />

      {/* Delete Confirm */}
      <ConfirmPopup
        open={deleteTarget !== null}
        variant="danger"
        title="Delete Job Level?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
