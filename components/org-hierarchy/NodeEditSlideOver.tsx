'use client';

import React, { useState, useEffect } from 'react';
import { OrgNode } from '@/types/org-hierarchy';
import { Employee } from '@/types/employee';
import { getEmployee, findEmployeeByName } from '@/lib/api/employees';
import { createOrgNode, updateOrgNode, setOrgNodeStatus } from '@/lib/api/org';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { Close } from '@/components/ui/Icons';
import { FieldLabel, Input, Select, Tooltip } from '@/components/ui';
import { PeoplePicker } from './PeoplePicker';

interface Props {
  node: OrgNode | null;
  isOpen: boolean;
  allNodes: OrgNode[];
  onClose: () => void;
  onSaved: (node: OrgNode, mode: 'add' | 'edit') => void;
  headcountMap: Record<string, number>;
}

export function NodeEditSlideOver({ node, isOpen, allNodes, onClose, onSaved, headcountMap }: Props) {
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

  // ── Reset form ────────────────────────────────────────────────────────────
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

  // ── Resolve node owner ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !node) { setNodeOwner(null); return; }
    let stale = false;
    const value = node.nodeOwner ? String(node.nodeOwner).trim() : '';
    if (!value) { setNodeOwner(null); return; }

    setNodeOwner({
      id: value,
      name: /^\d+$/.test(value) ? 'Loading...' : value,
      email: '',
      designation: '',
    } as any);

    const resolveOwner = async () => {
      try {
        let emp = null;
        if (/^\d+$/.test(value)) {
          emp = await getEmployee(value);
        } else {
          emp = await findEmployeeByName(value);
        }
        if (!stale) setNodeOwner(emp);
      } catch (err) {
        console.error('Failed to resolve node owner:', err);
        if (!stale) setNodeOwner(null);
      }
    };

    resolveOwner();
    return () => { stale = true; };
  }, [node, isOpen]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── calculateHeadcount ────────────────────────────────────────────────────
  const calculateHeadcount = (node: OrgNode | null): number => {
    if (!node) return 0;
    const selfCount = headcountMap[node.id] ?? 0;
    if (!node.children || node.children.length === 0) return selfCount;
    return selfCount + node.children.reduce((sum, child) => sum + calculateHeadcount(child), 0);
  };

  if (!isOpen) return null;

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSubmitted(true);
    const codeValid = nodeCode.trim() && NODE_CODE_REGEX.test(nodeCode);
    if (!nodeName.trim() || !nodeType || !nodeOwner || !codeValid) return;

    setIsSaving(true);
    setSaveError(null);
    setNodeCodeError(null);

    try {
      let result: OrgNode;

      if (node) {
        // ✏️ EDIT
        result = await updateOrgNode(node.id, {
          name:        nodeName.trim(),
          parentId,
          nodeCode:    nodeCode.trim(),
          description: description.trim() || null,
          nodeOwner:   nodeOwner?.id ?? null,
        });

        result = { ...result, nodeOwner: nodeOwner?.id ?? null };

        const newStatus = isActive ? 'Active' : 'Archived';
        if (newStatus !== node.status) {
          await setOrgNodeStatus(node.id, newStatus);
          result.status = newStatus;
        }

        onSaved(result, 'edit'); // ✅ KEEP PANEL OPEN
      } else {
        // ➕ ADD
        result = await createOrgNode({
          name:        nodeName.trim(),
          type:        nodeType,
          parentId,
          nodeCode:    nodeCode.trim(),
          description: description.trim() || null,
          nodeOwner:   nodeOwner?.id ?? null,
        });

        onSaved(result, 'add');
        onClose(); // close only for add
      }
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
      {/* ── Dim backdrop ── */}
      <div
        className="fixed inset-0 z-40 bg-[var(--primary-dark)]/10 backdrop-blur-[2px]"
        onClick={!isSaving ? onClose : undefined}
        aria-hidden="true"
      />

      {/* ── Slide-over panel ── */}
      <aside className="fixed top-16 right-0 z-50 flex h-[calc(100vh-4rem)] w-[420px] flex-col rounded-l-2xl bg-[var(--surface-container-lowest)] shadow-[0_8px_48px_rgba(33,33,33,0.12)]">

        {/* Header */}
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--outline-variant)]/15 bg-[var(--surface-container-lowest)]/90 px-6 py-4 backdrop-blur-[20px]">
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
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Headcount
                </div>
                <div className="text-xl font-bold text-[var(--secondary-dark)] font-headline">
                  {calculateHeadcount(node).toLocaleString()}
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors disabled:opacity-50"
              aria-label="Close panel"
            >
              <Close size={20} className="text-[var(--on-surface-variant)]" />
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-grow overflow-y-auto px-6 py-6 space-y-5">

          {/* Node Name */}
          <div>
            <FieldLabel htmlFor="nodeName" required>
              Node Name <Tooltip label="Node Name" description="Human-readable name for this organisational unit." />
            </FieldLabel>
            <Input
              id="nodeName"
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="e.g. Engineering"
              className={submitted && !nodeName.trim() ? 'ring-2 ring-[var(--error)] border-transparent' : ''}
            />
            {submitted && !nodeName.trim() && (
              <p className="mt-1 text-xs text-[var(--error)]">Node Name is required.</p>
            )}
          </div>

          {/* Node Code + Node Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="nodeCode" required>
                Node Code <Tooltip label="Node Code" description="Uppercase letters, digits and hyphens only — max 20 chars." />
              </FieldLabel>
              <Input
                id="nodeCode"
                type="text"
                value={nodeCode}
                onChange={(e) => { setNodeCode(e.target.value.toUpperCase()); setNodeCodeError(null); }}
                placeholder="e.g. ENG-001"
                maxLength={20}
                className={`font-mono ${(submitted && !nodeCode.trim()) || nodeCodeError ? 'ring-2 ring-[var(--error)] border-transparent' : ''}`}
              />
              {submitted && !nodeCode.trim() && (
                <p className="mt-1 text-xs text-[var(--error)]">Node Code is required.</p>
              )}
              {submitted && nodeCode.trim() && !NODE_CODE_REGEX.test(nodeCode) && (
                <p className="mt-1 text-xs text-[var(--error)]">Must be 1–20 chars, uppercase letters/digits/hyphens.</p>
              )}
              {nodeCodeError && (
                <p className="mt-1 text-xs text-[var(--error)]">{nodeCodeError}</p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="nodeType" required>
                Node Type <Tooltip label="Node Type" description="The structural type of this node in the hierarchy." />
              </FieldLabel>
              <Select
                id="nodeType"
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value as typeof nodeType)}
                className={submitted && !nodeType ? 'ring-2 ring-[var(--error)] border-transparent' : ''}
              >
                <option>Business Unit</option>
                <option>Region</option>
                <option>Division</option>
                <option>Department</option>
                <option>Team</option>
                <option>Sub-Team</option>
              </Select>
              {submitted && !nodeType && (
                <p className="mt-1 text-xs text-[var(--error)]">Node Type is required.</p>
              )}
            </div>
          </div>

          {/* Parent Node */}
          <div>
            <FieldLabel htmlFor="parentNode">Parent Node</FieldLabel>
            <Select
              id="parentNode"
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value || null)}
            >
              <option value="">None (Root)</option>
              {allNodes
                .filter((n) => n.id !== node?.id)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nodeName} ({n.nodeType})
                  </option>
                ))}
            </Select>
          </div>

          {/* Node Owner */}
          <div>
            <FieldLabel required>
              Node Owner <Tooltip label="Node Owner" description="The employee responsible for this organisational unit." />
            </FieldLabel>
            <PeoplePicker
              value={nodeOwner}
              onChange={setNodeOwner}
              hasError={submitted && !nodeOwner}
            />
            {submitted && !nodeOwner && (
              <p className="mt-1 text-xs text-[var(--error)]">Node Owner is required.</p>
            )}
          </div>

          {/* Hierarchy Path — read only */}
          {node && (
            <div>
              <FieldLabel>Hierarchy Path</FieldLabel>
              <div className="w-full px-4 py-3 bg-[var(--surface-container-low)] rounded-lg text-[var(--on-surface-variant)] text-sm font-mono border border-[var(--outline-variant)]/40 opacity-75 select-all">
                {node.hierarchyPath}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)]/40 rounded-[var(--input-radius)] text-on-surface text-sm font-medium resize-none leading-relaxed outline-none focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent transition-all"
              placeholder="Describe the function of this organisational unit..."
            />
          </div>

          {/* Status toggle — edit only */}
          {node && (
            <div>
              <FieldLabel>Status</FieldLabel>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:ring-opacity-50 ${
                    isActive ? 'bg-[var(--secondary-dark)]' : 'bg-[var(--outline)]'
                  }`}
                >
                  <span className="sr-only">Toggle status</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
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
        <footer className="sticky bottom-0 z-10 flex shrink-0 flex-col gap-3 border-t border-[var(--outline-variant)]/15 bg-[var(--surface-container-lowest)]/90 px-6 py-4 backdrop-blur-[20px]">
          {saveError && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-[var(--error-container)]/30 border border-[var(--error)]/30">
              <AlertCircle className="w-4 h-4 text-[var(--error)] mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-[var(--error)]">{saveError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 text-sm font-bold bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </footer>

      </aside>
    </>
  );
}
