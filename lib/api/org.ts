import { OrgNode, NodeType, NodeStatus } from '@/types/org-hierarchy';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5104/api';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1';

type OrgNodeApiDto = {
  id?: number | string;
  nodeCode?: string;
  name?: string;
  type?: string;
  parentId?: number | string | null;
  status?: string;
  nodeOwner?: unknown;
  description?: string;
  employeeCount?: number;
  path?: string;
  children?: unknown[];
};

const DEV_USER_EMAIL =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_DEV_USER_EMAIL ?? 'dev@localhost'
    : null;

    

function isOrgNodeApiDto(node: unknown): node is OrgNodeApiDto {
  return typeof node === "object" && node !== null;
}    
async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE}/${API_VERSION}${path}`;
  return fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(DEV_USER_EMAIL ? { 'X-Dev-User-Email': DEV_USER_EMAIL } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });
}

function mapTreeResponses(
  nodes: unknown[],
  parentNodeCode: string | null
): OrgNode[] {
  if (!Array.isArray(nodes)) return [];

  return nodes
    .filter(isOrgNodeApiDto)
    .map((n) => {
      const rawType = (n.type || "").toLowerCase();

      let nodeType: NodeType = "Department";
      if (rawType === "business_unit") nodeType = "Business Unit";
      else if (rawType === "division") nodeType = "Division";
      else if (rawType === "team") nodeType = "Team";
      else if (rawType === "sub_team") nodeType = "Sub-Team";

      const selfCode =
        n.id && parseInt(String(n.id), 10) > 0
          ? n.id.toString()
          : crypto.randomUUID();

      const resolvedParentCode =
        n.parentId != null ? n.parentId.toString() : parentNodeCode;

      const rawStatus = (n.status || "").toLowerCase();
      const status: NodeStatus =
        rawStatus === "archived" ? "Archived" : "Active";

      const orgNode: OrgNode = {
        id: selfCode,
        nodeCode: n.nodeCode || selfCode,
        nodeName: n.name || "Unnamed Node",
        nodeType,
        parentNodeCode: resolvedParentCode,
        nodeOwner: typeof n.nodeOwner === "string"? n.nodeOwner: null,
        description: n.description ?? null,
        status,
        headCount: n.employeeCount || 0,
        hierarchyPath: n.path || `/${n.name || "Unnamed Node"}`,
        children: [],
      };

      if (Array.isArray(n.children) && n.children.length > 0) {
        orgNode.children = mapTreeResponses(n.children, selfCode);
      }

      return orgNode;
    });
}

export async function getOrgNodes(): Promise<OrgNode[]> {
  try {
    const res = await apiFetch('/org/nodes?depth=10&includeArchived=true');

    if (!res.ok) {
      console.error(`Failed to fetch org nodes: ${res.status}`);
      return [];
    }

    const json = await res.json();
    // console.log('Fetched org nodes:', json);
    return mapTreeResponses(json.data || [], null);
  } catch (error) {
    console.error('Error fetching org nodes:', error);
    return [];
  }
}

function mapNodeTypeToApi(nodeType: string): string {
  const typeMap: Record<string, string> = {
    'Business Unit': 'business_unit',
    Division: 'division',
    Department: 'department',
    Team: 'team',
    'Sub-Team': 'sub_team',
    Region: 'region',
  };

  return typeMap[nodeType] ?? nodeType.toLowerCase().replace(/\s+/g, '_');
}

function mapSingleNodeResponse(json: Record<string, unknown>, parentId: string | null): OrgNode {
  const [mapped] = mapTreeResponses([json], parentId);
  return mapped;
}

export async function createOrgNode(payload: {
  name: string;
  type: string;
  parentId: string | null;
  nodeOwner?: string | null;  
  displayOrder?: number;
  nodeCode?: string;
  description?: string | null;
}): Promise<OrgNode> {
  if (payload.parentId !== null && !/^\d+$/.test(payload.parentId)) {
    throw new Error('The selected parent node has a stale reference. Please refresh.');
  }

  const res = await apiFetch('/org/nodes', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      type: mapNodeTypeToApi(payload.type),
      parentId: payload.parentId,

      nodeOwner: payload.nodeOwner ?? null,   

      displayOrder: payload.displayOrder ?? 0,
      ...(payload.nodeCode ? { nodeCode: payload.nodeCode } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `Failed to create node (${res.status})`);
  }

  const json = await res.json();
  return mapSingleNodeResponse(json, payload.parentId);
}

export async function updateOrgNode(
  nodeId: string,
  payload: {
    name: string;
    parentId: string | null;
    nodeOwner?: string | null;   
    displayOrder?: number;
    nodeCode?: string;
    description?: string | null;
  },
): Promise<OrgNode> {
  if (!/^\d+$/.test(nodeId)) {
    throw new Error('This node has a stale reference. Please refresh.');
  }

  if (payload.parentId !== null && !/^\d+$/.test(payload.parentId)) {
    throw new Error('Invalid parent node.');
  }

  const res = await apiFetch(`/org/nodes/${nodeId}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: payload.name,
      parentId: payload.parentId,

      nodeOwner: payload.nodeOwner ?? null,   

      description: payload.description ?? null,
      displayOrder: payload.displayOrder ?? 0,
      ...(payload.nodeCode ? { nodeCode: payload.nodeCode } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `Failed to update node (${res.status})`);
  }

  const json = await res.json();
  return mapSingleNodeResponse(json, payload.parentId);
}

export async function setOrgNodeStatus(
  nodeId: string,
  status: 'Active' | 'Archived'
): Promise<void> {
  if (!/^\d+$/.test(nodeId)) {
    throw new Error('This node has a stale reference. Please refresh.');
  }

  const res = await apiFetch(`/org/nodes/${nodeId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail ??
        `Failed to update node status (${res.status})`
    );
  }
}

export async function deleteOrgNode(nodeId: string): Promise<void> {
  if (!/^\d+$/.test(nodeId)) {
    throw new Error('This node has a stale reference. Please refresh.');
  }

  const res = await apiFetch(`/org/nodes/${nodeId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail ??
        `Failed to delete node (${res.status})`
    );
  }
}