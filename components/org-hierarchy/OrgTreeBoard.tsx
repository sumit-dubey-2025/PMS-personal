'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { OrgNode } from '@/types/org-hierarchy';
import { NodeEditSlideOver } from './NodeEditSlideOver';
import { FlatTree } from './FlatTree';
import { ConfirmDialog } from './ConfirmDialog';
import { History, Search, Plus, Loader2 } from 'lucide-react';
import { deleteOrgNode, setOrgNodeStatus } from '@/lib/api/org';

// Helper to flatten the hierarchical tree for dnd-kit consumption
export function flattenTree(nodes: OrgNode[], depth = 0, parentId: string | null = null): OrgNode[] {
  const result: OrgNode[] = [];
 
 function walk(nodes: OrgNode[], depth: number): void {  
    for (const node of nodes) {  
      result.push({ ...node });  
      if (node.children) {  
        walk(node.children, depth + 1);  
      }  
    }  
  }  
 
  walk(nodes, depth);     
  return result;
}

interface PendingAction {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'warning' | 'success';
  execute: () => Promise<void>;
}

export function OrgTreeBoard({ initialNodes }: { initialNodes: OrgNode[] }) {
  const router = useRouter();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [nodes, setNodes] = useState<OrgNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const flatNodes = useMemo(() => flattenTree(nodes), [nodes]);

  const MAX_DEPTH = 10;
  const maxDepth = useMemo(
    () =>
      flatNodes.reduce((acc, n) => {
        const depth = n.hierarchyPath ? n.hierarchyPath.split(' / ').length : 1;
        return Math.max(acc, depth);
      }, 0),
    [flatNodes],
  );
  // Warn when the deepest node is one level from the hard limit
  const showDepthWarning = maxDepth >= MAX_DEPTH - 1;

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const handleNodeClick = (node: OrgNode) => {
    setSelectedNode(node);
    setIsEditPanelOpen(true);
  };

  const handleAddRootNode = () => {
    setSelectedNode(null);
    setIsEditPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsEditPanelOpen(false);
    setSelectedNode(null);
  };

  const refreshTree = () => startRefreshTransition(() => router.refresh());

  const handleSaved = () => {
    refreshTree();
    handleClosePanel();
  };

  const handleDeleteNode = (node: OrgNode) => {
    setPendingAction({
      title: 'Delete Node',
      message: `Are you sure you want to delete "${node.nodeName}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      execute: async () => {
        await deleteOrgNode(node.id);
        refreshTree();
      },
    });
  };

  const handleDeactivateNode = (node: OrgNode) => {
    setPendingAction({
      title: 'Deactivate Node',
      message: `"${node.nodeName}" will be archived and hidden from active views. You can reactivate it later.`,
      confirmLabel: 'Deactivate',
      variant: 'warning',
      execute: async () => {
        await setOrgNodeStatus(node.id, 'Archived');
        refreshTree();
      },
    });
  };

  const handleActivateNode = (node: OrgNode) => {
    setPendingAction({
      title: 'Activate Node',
      message: `"${node.nodeName}" will be restored to active status and visible in the hierarchy.`,
      confirmLabel: 'Activate',
      variant: 'success',
      execute: async () => {
        await setOrgNodeStatus(node.id, 'Active');
        refreshTree();
      },
    });
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    setIsConfirming(true);
    try {
      await pendingAction.execute();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setIsConfirming(false);
      setPendingAction(null);
    }
  };

  const handleCancelConfirm = () => {
    if (!isConfirming) setPendingAction(null);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Page Header */}
      <div className="mb-6 flex flex-row items-center justify-between">
        <div>
          <h1 className="text-[var(--on-surface)] text-3xl font-bold font-headline">Org Hierarchy Manager</h1>
          <p className="text-[var(--on-surface-variant)] text-sm mt-1">Manage organizational structures, reporting lines, and business units.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] border-opacity-50 text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors shadow-sm">
            <History className="w-4 h-4 text-[var(--on-surface-variant)]" />
            <span className="text-sm font-semibold">Snapshot History</span>
          </button> */}
          <button disabled className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] border-opacity-50 text-[var(--on-surface-variant)] opacity-50 cursor-not-allowed transition-colors shadow-sm">
           <History className="w-4 h-4 text-[var(--on-surface-variant)]" />
            <span className="text-sm font-semibold">Snapshot History</span>
          </button>
          <button
            onClick={handleAddRootNode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-light)] transition-colors shadow-[0_4px_12px_rgba(0,45,106,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Add Root Node</span>
          </button>
        </div>
      </div>

      {/* Main Board Surface */}
      <div className="flex-grow overflow-hidden">
        <div className="h-full flex flex-col p-8 rounded-xl shadow-[0_8px_32px_rgba(33,33,33,0.06)] bg-[var(--surface-container-lowest)]">

          <div className="flex flex-col gap-4 mb-6 shrink-0">
            {/* Search Box & Filter */}
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-[var(--on-surface-muted)]" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:ring-opacity-20 transition-all text-sm font-medium"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  title="Filter by node type"
                  className={`px-4 py-2 ${filterType !== 'All' ? 'bg-[var(--secondary-container)] text-[var(--on-secondary)]' : 'bg-[var(--surface-container-low)] text-[var(--on-surface)]'} rounded-lg hover:bg-[var(--surface-container-high)] transition-all flex items-center justify-center shrink-0 border-none outline-none focus:ring-2 focus:ring-[var(--secondary)] h-full`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </button>

                {isFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--surface-container-lowest)] rounded-lg shadow-xl border border-[var(--outline-variant)] border-opacity-30 z-50 overflow-hidden">
                      <div className="px-4 py-2 text-xs font-semibold uppercase text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)] border-opacity-20">
                        Filter by Type
                      </div>
                      <div className="flex flex-col py-1">
                        {['All', 'Business Unit', 'Region', 'Division', 'Department', 'Team', 'Sub-Team'].map(type => (
                          <button
                            key={type}
                            onClick={() => {
                              setFilterType(type);
                              setIsFilterOpen(false);
                            }}
                            className={`px-4 py-2 text-sm text-left hover:bg-[var(--surface-container-low)] transition-colors ${filterType === type ? 'font-bold text-[var(--secondary-dark)] bg-[var(--secondary-container)] bg-opacity-20' : 'text-[var(--on-surface)]'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-y-auto flex-grow relative">
            {/* Tree refresh loader overlay */}
            {isRefreshing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-[var(--surface-container-lowest)] bg-opacity-75 backdrop-blur-[4px]">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                <span className="text-sm font-semibold text-[var(--on-surface-variant)]">Refreshing hierarchy…</span>
              </div>
            )}

            <div className={`transition-opacity duration-200 ${isRefreshing ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
              <FlatTree
                nodes={nodes}
                flatNodes={flatNodes}
                setNodes={setNodes}
                onNodeClick={handleNodeClick}
                onDeleteNode={handleDeleteNode}
                onDeactivateNode={handleDeactivateNode}
                onActivateNode={handleActivateNode}
                searchQuery={searchQuery}
                filterType={filterType}
              />
            </div>

            {showDepthWarning && (
              <div className="mt-6 p-4 bg-[var(--error-container)] bg-opacity-20 rounded-lg flex items-start gap-3 border border-[var(--error)] border-opacity-30 mx-4">
                <div className="text-[var(--error)] mt-0.5 shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--error)]">Hierarchy Limit Approaching</h3>
                  <p className="text-xs text-[var(--error)] mt-1 opacity-80 font-medium">
                    Depth level {maxDepth} reached. Further nesting will be restricted at level {MAX_DEPTH}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — now an overlay, rendered via portal */}
        <NodeEditSlideOver
          node={selectedNode}
          isOpen={isEditPanelOpen}
          allNodes={flatNodes}
          onClose={handleClosePanel}
          onSaved={handleSaved}
        />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={pendingAction !== null}
        title={pendingAction?.title ?? ''}
        message={pendingAction?.message ?? ''}
        confirmLabel={pendingAction?.confirmLabel ?? ''}
        variant={pendingAction?.variant ?? 'danger'}
        isLoading={isConfirming}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
    </div>
    </div>
  );
}
