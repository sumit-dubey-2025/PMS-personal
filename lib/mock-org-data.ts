import { OrgNode } from '@/types/org-hierarchy';

export const MOCK_ORG_NODES: OrgNode[] = [
  {
    id: 'global-corp',
    nodeCode: 'global-corp',
    nodeName: 'Global Corp',
    nodeType: 'Business Unit',
    parentNodeCode: null,
    nodeOwner: 'ceo@globalcorp.com',
    description: 'The overarching business unit.',
    status: 'Active',
    headCount: 1542,
    hierarchyPath: '/Global Corp',
    children: [
      {
        id: 'hr',
        nodeCode: 'hr',
        nodeName: 'HR Administration',
        nodeType: 'Division',
        parentNodeCode: 'global-corp',
        nodeOwner: 'hr@globalcorp.com',
        description: 'Human Resources Division',
        status: 'Active',
        headCount: 42,
        hierarchyPath: '/Global Corp/HR Administration',
        children: []
      },
      {
        id: 'engineering',
        nodeCode: 'engineering',
        nodeName: 'Engineering',
        nodeType: 'Division',
        parentNodeCode: 'global-corp',
        nodeOwner: 'cto@globalcorp.com',
        description: 'Engineering Division',
        status: 'Active',
        headCount: 450,
        hierarchyPath: '/Global Corp/Engineering',
        children: [
          {
            id: 'backend',
            nodeCode: 'backend',
            nodeName: 'Backend Engineering',
            nodeType: 'Department',
            parentNodeCode: 'engineering',
            nodeOwner: 'backend-lead@globalcorp.com',
            description: 'Core platform APIs and microservices.',
            status: 'Active',
            headCount: 120,
            hierarchyPath: '/Global Corp/Engineering/Backend Engineering',
            children: []
          }
        ]
      }
    ]
  }
];
