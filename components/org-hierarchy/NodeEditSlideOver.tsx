'use client';

import React, { useState, useEffect } from 'react';
import { OrgNode } from '@/types/org-hierarchy';
import { Employee } from '@/types/employee';
import { findEmployeeByName } from '@/lib/api/employees';
import { createOrgNode, updateOrgNode, setOrgNodeStatus } from '@/lib/api/org';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Close } from '@/components/ui/Icons';
import { PeoplePicker } from './PeoplePicker';
import { Tooltip } from '@/components/ui/Tooltip';

interface Props {
  node: OrgNode | null;
  isOpen: boolean;
  allNodes: OrgNode[];
  onClose: () => void;
  onSaved: () => void;
}

export function NodeEditSlideOver({ node, isOpen, allNodes, onClose, onSaved }: Props) {
  const [isActive,      setIsActive]      = useState(node?.status === 'Active');
  const [nodeName,      setNodeName]      = useState(node?.nodeName ?? '');
  const [nodeCode,      setNodeCode]      = useState(node?.nodeCode ?? '');
  const [nodeType,      setNodeType]      = useState(node?.nodeType ?? 'Department');
  const [parentId,      setParentId]      = useState<string | null>(node?.parentNodeCode ?? null);
  const [description,   setDescription]   = useState(node?.description ?? '');
  const [nodeOwner,     setNodeOwner]     = useState<Employee | null>(null);
  const [submitted,     setSubmitted]     = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);
  const [saveError,     setSaveError]     = useState<string | null>(null);
  const [nodeCodeError, setNodeCodeError] = useState<string | null>(null);

  const NODE_CODE_REGEX = /^[A-Z0-9][A-Z0-9\-]{0,19}$/;

  useEffect(() => {
    if (!isOpen) return;
    setIsActive(node?.status === 'Active');
    setNodeName(node?.nodeName ?? '');
    setNodeCode(node?.nodeCode ?? '');
    setNodeType(node?.nodeType ?? 'Department');
    setParentId(node?.parentNodeCode ?? null);
    setDescription(node?.description ?? '');
    setSubmitted(false);
    setSaveError(null);
    setNodeCodeError(null);
  }, [node, isOpen]);

  useEffect(() => {
    if (!isOpen || !node?.nodeOwner) {
      setNodeOwner(null);
      return;
    }
    let stale = false;
    findEmployeeByName(node.nodeOwner)
      .then((emp) => { if (!stale) setNodeOwner(emp); })
      .catch(() => { if (!stale) setNodeOwner(null); });
    return () => { stale = true; };
  }, [node?.nodeOwner, isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSubmitted(true);
    const codeValid = nodeCode.trim() && NODE_CODE_REGEX.test(nodeCode);
    if (!nodeName.trim() || !nodeType || !nodeOwner || !codeValid) return;
    setIsSaving(true);
    setSaveError(null);
    setNodeCodeError(null);
    try {
      if (node) {
        await updateOrgNode(node.id, {
          name:        nodeName.trim(),
          parentId,
          nodeCode:    nodeCode.trim(),
          description: description.trim() || null,
          nodeOwner:   nodeOwner.id,
        });
        const newStatus = isActive ? 'Active' : 'Archived';
        if (newStatus !== node.status) {
          await setOrgNodeStatus(node.id, newStatus);
        }
      } else {
        await createOrgNode({
          name:        nodeName.trim(),
          type:        nodeType,
          parentId,
          nodeCode:    nodeCode.trim(),
          description: description.trim() || null,
          nodeOwner:   nodeOwner.id,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      if (msg.toLowerCase().includes('already in use') || msg.includes('DUPLICATE_NODE_CODE')) {
        setNodeCodeError(msg);
      } else {
        setSaveError(msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* ── Dim backdrop ──────────────────────────────────────────────── */}
      <div
        className="bg-tertiary/10 fixed inset-0 z-40 backdrop-blur-[2px]"
        onClick={!isSaving ? onClose : undefined}
        aria-hidden="true"
      />

      {/* ── Slide-over panel ─────────────────────────────────────────── */}
      <aside className="bg-surface-container-lowest shadow-ambient-lifted fixed top-16 right-0 z-50 flex h-[calc(100vh-4rem)] w-[420px] flex-col rounded-l-2xl">

        {/* Header */}
        <header className="border-outline-variant/15 bg-surface-container-lowest/90 sticky top-0 z-10 flex shrink-0 items-center justify-between border-b px-6 py-4 backdrop-blur-[20px]">
          <div>
            {node && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary-dark)] mb-1">
                {node.hierarchyPath.split('/').filter(Boolean).join(' › ')}
              </p>
            )}
            <h2 className="text-xl font-headline font-bold text-[var(--primary)]">
              {node ? 'Edit Node Details' : 'Add Root Node'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {node && (
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Headcount</div>
                <div className="text-xl font-bold text-[var(--secondary-dark)] font-headline">{node.headCount.toLocaleString()}</div>
              </div>
            )}
            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors disabled:opacity-50"
              aria-label="Close panel"
            >
              <Close className="w-5 h-5 text-[var(--on-surface-variant)]" />
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-grow overflow-y-auto px-6 py-6 space-y-5">

          {/* Node Name */}
          <div>
            <label className="flex items-center text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5">
              Node Name
              <Tooltip label="Node Name" description="The display name for this organisational unit" />
            </label>
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="e.g. Engineering"
              className={`w-full px-4 py-3 bg-[var(--surface-container-low)] rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] transition-all text-sm font-medium ${submitted && !nodeName.trim() ? 'border-2 border-red-500' : 'border-none'}`}
            />
            {submitted && !nodeName.trim() && (
              <p className="mt-1 text-xs text-red-500">Node Name is required.</p>
            )}
          </div>

          {/* Node Code + Node Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5">
                Node Code
                <Tooltip label="Node Code" description="Uppercase letters, digits and hyphens only — max 20 chars" />
              </label>
              <input
                type="text"
                value={nodeCode}
                onChange={(e) => { setNodeCode(e.target.value.toUpperCase()); setNodeCodeError(null); }}
                placeholder="e.g. ENG-001"
                maxLength={20}
                className={`w-full px-4 py-3 rounded-lg text-sm font-mono transition-all bg-[var(--surface-container-low)] text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] ${(submitted && !nodeCode.trim()) || nodeCodeError ? 'border-2 border-red-500' : 'border-none'}`}
              />
              {submitted && !nodeCode.trim() && (
                <p className="mt-1 text-xs text-red-500">Node Code is required.</p>
              )}
              {submitted && nodeCode.trim() && !NODE_CODE_REGEX.test(nodeCode) && (
                <p className="mt-1 text-xs text-red-500">Must be 1–20 chars, uppercase letters/digits/hyphens.</p>
              )}
              {nodeCodeError && <p className="mt-1 text-xs text-red-500">{nodeCodeError}</p>}
            </div>

            <div>
              <label className="flex items-center text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5">
                Node Type
                <Tooltip label="Node Type" description="The structural type of this node in the hierarchy" />
              </label>
              <select
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value as typeof nodeType)}
                className={`w-full px-4 py-3 bg-[var(--surface-container-low)] rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium appearance-none transition-all ${submitted && !nodeType ? 'border-2 border-red-500' : 'border-none'}`}
              >
                <option>Business Unit</option>
                <option>Region</option>
                <option>Division</option>
                <option>Department</option>
                <option>Team</option>
                <option>Sub-Team</option>
              </select>
              {submitted && !nodeType && (
                <p className="mt-1 text-xs text-red-500">Node Type is required.</p>
              )}
            </div>
          </div>

          {/* Parent Node */}
          <div>
            <label className="block text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5">
              Parent Node
            </label>
            <select
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-4 py-3 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium appearance-none"
            >
              <option value="">None (Root)</option>
              {allNodes
                .filter((n) => n.id !== node?.id)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nodeName} ({n.nodeType})
                  </option>
                ))}
            </select>
          </div>

          {/* Node Owner */}
          <div>
            <label className="flex items-center text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5">
              Node Owner
              <Tooltip label="Node Owner" description="The employee responsible for this organisational unit" />
            </label>
            <PeoplePicker
              value={nodeOwner}
              onChange={setNodeOwner}
              hasError={submitted && !nodeOwner}
            />
            {submitted && !nodeOwner && (
              <p className="mt-1 text-xs text-red-500">Node Owner is required.</p>
            )}
          </div>

          {/* Hierarchy Path — read only */}
          {node && (
            <div>
              <label className="block text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5">
                Hierarchy Path
              </label>
              <div className="w-full px-4 py-3 bg-[var(--surface-container-low)] rounded-lg text-[var(--on-surface-variant)] text-sm font-mono border-none opacity-75 select-all">
                {node.hierarchyPath}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--surface-container-low)] border-none rounded-lg text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--secondary)] text-sm font-medium resize-none leading-relaxed"
              placeholder="Describe the function of this organisational unit..."
            />
          </div>

          {/* Status toggle — edit only */}
          {node && (
            <div>
              <label className="block text-[10px] font-bold tracking-[0.07em] uppercase text-[var(--on-surface-variant)] mb-1.5">
                Status
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:ring-opacity-50 ${isActive ? 'bg-[var(--secondary-dark)]' : 'bg-[var(--outline)]'}`}
                >
                  <span className="sr-only">Toggle status</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
                <span className={`text-sm font-semibold ${isActive ? 'text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)]'}`}>
                  {isActive ? 'Active' : 'Archived'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-outline-variant/15 bg-surface-container-lowest/90 sticky bottom-0 z-10 flex shrink-0 flex-col gap-3 border-t px-6 py-4 backdrop-blur-[20px]">
          {saveError && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-[var(--error-container)] bg-opacity-30 border border-[var(--error)] border-opacity-30">
              <AlertCircle className="w-4 h-4 text-[var(--error)] mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-[var(--error)]">{saveError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 text-sm font-bold text-[var(--on-surface)] bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 text-sm font-bold text-[var(--on-primary)] bg-[var(--primary-dark)] hover:bg-[var(--primary)] shadow-[0_4px_12px_rgba(0,25,66,0.3)] rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
