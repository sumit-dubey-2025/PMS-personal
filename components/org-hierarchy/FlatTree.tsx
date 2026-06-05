'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { OrgNode } from '@/types/org-hierarchy';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { NodeItem } from './NodeItem';
import { hierarchyMatrix } from '@/lib/hierarchyrules';

interface Props {
  nodes: OrgNode[]; // Unused in flat approach, but kept for signature
  flatNodes: OrgNode[];
  setNodes: React.Dispatch<React.SetStateAction<OrgNode[]>>;
  onNodeClick: (node: OrgNode) => void;
  onDeleteNode: (node: OrgNode) => void;
  onDeactivateNode: (node: OrgNode, headcount: number) => void;
  onActivateNode: (node: OrgNode) => void;
  searchQuery: string;
  filterType: string;
  headcountMap: Record<string, number>;
}

// Computes depth of every node by walking the parentNodeCode chain.
// Root nodes (parentNodeCode === null) are depth 0.
function computeNodeDepths(nodes: OrgNode[]): Map<string, number> {
  const byId = new Map<string, OrgNode>(nodes.map(n => [n.id, n]));
  const cache = new Map<string, number>();
  const resolve = (id: string): number => {
    if (cache.has(id)) return cache.get(id)!;
    const node = byId.get(id);
    if (!node?.parentNodeCode) {
      cache.set(id, 0);
      return 0;
    }
    const d = resolve(node.parentNodeCode) + 1;
    cache.set(id, d);
    return d;
  };
  for (const n of nodes) resolve(n.id);
  return cache;
}

export function FlatTree({ flatNodes, setNodes, onNodeClick, onDeleteNode, onDeactivateNode, onActivateNode, searchQuery, filterType, headcountMap }: Props) {
  // flattenTree in OrgTreeBoard already produces correct DFS order via tree traversal.
  // Use flatNodes directly; no re-sort needed.
  const [activeItems, setActiveItems] = useState<OrgNode[]>(flatNodes);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set<string>());

  // Re-sync when incoming flatNodes change (e.g. after CRUD operations).
  // flattenTree produces DFS order so parents always appear before their children.
  useEffect(() => {
    setActiveItems(flatNodes);
  }, [flatNodes]);
const calculateHeadcount = (node: OrgNode | null): number => {
  if (!node) return 0;

  const selfCount = headcountMap[node.id] ?? 0;

  if (!node.children || node.children.length === 0) {
    return selfCount;
  }

  return (
    selfCount +
    node.children.reduce(
      (sum, child) => sum + calculateHeadcount(child),
      0
    )
  );
};
  // Precompute node depths and a by-id lookup once per activeItems change.
  const depthMap = useMemo(() => computeNodeDepths(activeItems), [activeItems]);
  const nodeById = useMemo(
    () => new Map<string, OrgNode>(activeItems.map(n => [n.id, n])),
    [activeItems],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };
 
  const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const draggedNode = nodeById.get(active.id as string);
  const targetNode = nodeById.get(over.id as string);

  // 🚫 BLOCK if either node is inactive
  if (draggedNode?.status == "Archived" || targetNode?.status == "Archived") {
    console.warn("Drag blocked: inactive node involved");
    return;
  }
const isValidMove = (dragged: OrgNode, target: OrgNode) => {
  return hierarchyMatrix[target.nodeType]?.includes(dragged.nodeType);
};

if (!isValidMove(draggedNode!, targetNode!)) {
  console.warn("Invalid hierarchy move");
  return;
}
  setActiveItems((items) => {
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    return arrayMove(items, oldIndex, newIndex);
  });

  // TODO: call move API
};

  const isSearchActive = searchQuery.trim().length > 0;
  const isTypeFilterActive = filterType !== 'All';
  const query = searchQuery.toLowerCase();

  // Returns true if every ancestor in the parent chain is in expandedIds.
  // Root nodes (parentNodeCode === null) are always visible.
  const isAncestorChainExpanded = (node: OrgNode): boolean => {
    let cur = node;
    while (cur.parentNodeCode !== null) {
      const parent = nodeById.get(cur.parentNodeCode);
      if (!parent) return true; // dangling reference — treat as root
      if (!expandedIds.has(parent.id)) return false;
      cur = parent;
    }
    return true;
  };

  let visibleItems: OrgNode[];

  if (isSearchActive || isTypeFilterActive) {
    // When searching or filtering, show all matches regardless of tree collapse state.
    visibleItems = activeItems.filter(node => {
      const matchesSearch = isSearchActive
        ? node.nodeName.toLowerCase().includes(query) ||
          node.nodeCode.toLowerCase().includes(query) ||
          (node.nodeOwner?.toLowerCase().includes(query) ?? false)
        : true;
      const matchesType = isTypeFilterActive ? node.nodeType === filterType : true;
      return matchesSearch && matchesType;
    });
  } else {
    visibleItems = activeItems.filter(node => isAncestorChainExpanded(node));
  }

  return (
    <DndContext id="org-tree-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleItems.map(n => n.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {visibleItems.map((node) => {
            const depth = depthMap.get(node.id) ?? 0;
            const hasChildren = activeItems.some(n => n.parentNodeCode === node.id);
            
            return (
              <NodeItem
                key={node.id}
                node={node}
                depth={depth}
                isExpanded={expandedIds.has(node.id)}
                hasChildren={hasChildren}
                onToggle={() => toggleExpand(node.id)}
                onClick={() => onNodeClick(node)}
                onDelete={() => onDeleteNode(node)}
                onDeactivate={() =>
  onDeactivateNode(node, headcountMap[node.id] ?? 0)
}
                onActivate={() => onActivateNode(node)}
                headcountMap={headcountMap}

              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
