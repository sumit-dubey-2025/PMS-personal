export type NodeType =
  | 'Business Unit'
  | 'Division'
  | 'Department'
  | 'Team'
  | 'Sub-Team';

export type NodeStatus = 'Active' | 'Archived';

export interface OrgNode {
  id: string; // Used internally for DnD
  nodeCode: string; // Unique, e.g., FIN-001
  nodeName: string;
  nodeType: NodeType;
  parentNodeCode: string | null;
  nodeOwner: string | null;
  description: string | null;
  status: NodeStatus;
  headCount: number;
  hierarchyPath: string; // e.g., /Global Corp/Finance
  children?: OrgNode[];
}

export interface HierarchySnapshot {
  id: string;
  snapshotType: 'CycleActivation' | 'Manual';
  linkedCycleCode?: string;
  timestamp: string;
  employeeCount: number;
  nodeCount: number;
  triggeredBy: string;
}
