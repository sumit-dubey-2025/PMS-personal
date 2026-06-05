import { NodeType } from '@/lib/hierarchyrules';

export const NODE_TYPE_PREFIX: Record<NodeType, string> = {
  'Organization':  'ORG',
  'Business Unit': 'BU',
  'Region':        'RGN',
  'Country':       'CTY',
  'Division':      'DIV',
  'Department':    'DEPT',
  'Team':          'TM',
  'Sub-Team':      'STM',
  'Practice':      'PRC',
};

/**
 * Format (with parent):    {TYPE_PREFIX}-{PARENT_TYPE_PREFIX}-{4_HEX}
 * Format (no parent/root): {TYPE_PREFIX}-{4_HEX}
 *
 * Examples:
 *   ORG-4F2A          → root Organization
 *   BU-ORG-9C3E       → Business Unit under Organization
 *   DIV-BU-1B7F       → Division under Business Unit
 *   TM-DIV-3A2D       → Team under Division
 *   TM-DEPT-7E1C      → Team under Department
 *
 * Max length: 4 + 1 + 4 + 1 + 4 = 14 chars — never grows with depth
 */
export function generateNodeCode(
  nodeType: NodeType,
  parentType: NodeType | null,   // ✅ now takes parent TYPE not parent code
  existingCodes: Set<string>,
  maxRetries = 5,
): string {
  const prefix = NODE_TYPE_PREFIX[nodeType] ?? nodeType.slice(0, 3).toUpperCase();
  const parentPrefix = parentType
    ? (NODE_TYPE_PREFIX[parentType] ?? parentType.slice(0, 3).toUpperCase())
    : null;

  for (let i = 0; i < maxRetries; i++) {
    const suffix = Math.floor(Math.random() * 0xFFFF)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');

    const code = parentPrefix
      ? `${prefix}-${parentPrefix}-${suffix}`
      : `${prefix}-${suffix}`;

    if (!existingCodes.has(code.toUpperCase())) return code;
  }

  throw new Error(
    `Failed to generate a unique node code after ${maxRetries} attempts. Please try again.`
  );
}