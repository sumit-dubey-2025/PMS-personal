'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Add, FilterList } from '@/components/ui/Icons';
import { Button } from '@/components/ui';
import { SearchInput } from '@/components/ui/SearchInput';
import ConfirmPopup from '@/components/ui/ConfirmPopup';
import DesignationFilterPanel, { type DesignationFilterValues } from './DesignationFilterPanel';
import type { Designation, JobLevel } from '@/types/jobLevel';
import {
  useCreateDesignation,
  usePatchDesignation,
  useDeleteDesignation,
} from '@/hooks/useJobLevelMutations';
import DesignationFormPanel from './DesignationFormPanel';

interface Props {
  designations: Designation[];
  jobLevels: JobLevel[];
  isLoading: boolean;
}

const PAGE_SIZE = 5;

const DEPARTMENTS = [
  'Leadership', 'Technology', 'Engineering', 'Product & Design',
  'Human Resources', 'Finance', 'Marketing', 'Operations', 'Legal',
  'Data & Analytics', 'Sales', 'Customer Success',
];

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-[var(--outline-variant)]/20">
      <td className="px-4 py-4"><div className="h-4 w-36 rounded bg-[var(--surface-container-high)] mb-1" /><div className="h-3 w-20 rounded bg-[var(--surface-container-high)]" /></td>
      <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-[var(--surface-container-high)]" /></td>
      <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-[var(--surface-container-high)]" /></td>
      <td className="px-4 py-4"><div className="h-4 w-10 rounded bg-[var(--surface-container-high)]" /></td>
      <td className="px-4 py-4"><div className="h-7 w-16 rounded bg-[var(--surface-container-high)]" /></td>
    </tr>
  );
}

export default function DesignationTab({ designations, jobLevels, isLoading }: Props) {
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [selected,     setSelected]     = useState<Designation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Designation | null>(null);
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [filters,      setFilters]      = useState<DesignationFilterValues>({ levelId: '', department: '' });
  const filterRef = useRef<HTMLDivElement>(null);

  const createMutation = useCreateDesignation();
  const patchMutation  = usePatchDesignation();
  const deleteMutation = useDeleteDesignation();

  // Close filter panel on outside click
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  const levelMap = useMemo(
    () => Object.fromEntries(jobLevels.map((jl) => [jl.id, jl])),
    [jobLevels],
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filtered = useMemo(() => {
    return designations.filter((d) => {
      const matchSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.uid.toLowerCase().includes(search.toLowerCase());
      const matchLevel = !filters.levelId || d.associatedLevelId === filters.levelId;
      const matchDept  = !filters.department || d.department === filters.department;
      return matchSearch && matchLevel && matchDept;
    });
  }, [designations, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = (d: Designation) => { setSelected(d); setPanelOpen(true); };
  const handleAddNew = () => { setSelected(null); setPanelOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };
  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleApplyFilters = (vals: DesignationFilterValues) => { setFilters(vals); setPage(1); };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--on-surface)]">Designations</h2>
          <p className="text-xs text-[var(--on-surface-muted)]">
            Manage specific designations mapped to job levels.
          </p>
        </div>
        <Button size="sm" onClick={handleAddNew}>
          <Add size={14} />
          Add Designation
        </Button>
      </div>

      {/* Search + Filter row */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search by designation title or UID…"
          className="flex-1 max-w-sm"
        />

        {/* Filter button */}
        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((p) => !p)}
            className={[
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
              filterOpen || activeFilterCount > 0
                ? 'border-secondary/50 bg-secondary/10 text-secondary ring-2 ring-secondary/20'
                : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-outline-variant/60 hover:text-on-surface',
            ].join(' ')}
          >
            <FilterList size={16} />
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-on-secondary">
                {activeFilterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <DesignationFilterPanel
              values={filters}
              jobLevels={jobLevels}
              departments={DEPARTMENTS}
              onApply={handleApplyFilters}
              onClose={() => setFilterOpen(false)}
            />
          )}
        </div>

        {/* Total count card */}
        <div className="ml-auto flex items-center gap-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] px-5 py-2.5 min-w-[160px]">
          <span className="material-symbols-rounded text-[20px]">badge</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Designations</p>
            <p className="text-2xl font-bold leading-tight">{designations.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/30 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]">
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Designation Title</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Associated Level</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Department</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Number of Employees</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <span className="material-symbols-rounded text-4xl text-[var(--on-surface-muted)]">badge</span>
                  <p className="mt-2 text-sm font-semibold text-[var(--on-surface)]">No designations found</p>
                  <p className="text-xs text-[var(--on-surface-muted)]">Try adjusting your search or filters.</p>
                </td>
              </tr>
            ) : (
              paginated.map((d) => {
                const level = levelMap[d.associatedLevelId];
                return (
                  <tr key={d.id} className="border-b border-[var(--outline-variant)]/20 last:border-0 hover:bg-[var(--surface-container-low)] transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[var(--on-surface)]">{d.title}</p>
                      <p className="text-[11px] text-[var(--on-surface-muted)] mt-0.5">{d.uid}</p>
                    </td>
                    <td className="px-4 py-4">
                      {level ? (
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[var(--primary)] shrink-0" />
                          <span className="text-sm text-[var(--on-surface-variant)]">{level.code} – {level.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--on-surface-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-[var(--on-surface-variant)]">{d.department}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-[var(--on-surface)]">{d.employeeCount}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(d)}
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
                          onClick={() => setDeleteTarget(d)}
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-[var(--on-surface-muted)]">
          <span>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-[var(--outline-variant)]/40 text-xs font-semibold disabled:opacity-40 hover:bg-[var(--surface-container-low)] transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={[
                  'w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                  p === page
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                    : 'hover:bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]',
                ].join(' ')}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[var(--outline-variant)]/40 text-xs font-semibold disabled:opacity-40 hover:bg-[var(--surface-container-low)] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Form Panel */}
      <DesignationFormPanel
        isOpen={panelOpen}
        designation={selected}
        jobLevels={jobLevels}
        departments={DEPARTMENTS}
        onClose={() => setPanelOpen(false)}
        createMutation={createMutation}
        patchMutation={patchMutation}
      />

      {/* Delete Confirm */}
      <ConfirmPopup
        open={deleteTarget !== null}
        variant="danger"
        title="Delete Designation?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
