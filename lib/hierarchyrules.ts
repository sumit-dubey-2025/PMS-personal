export type NodeType =
  | "Organization"
  | "Business Unit"
  | "Region"
  | "Country"
  | "Division"
  | "Department"
  | "Team"
  | "Sub-Team"
  | "Practice";

export const hierarchyMatrix: Record<NodeType, NodeType[]> = {
  Organization: ["Business Unit", "Region", "Practice"],
  "Business Unit": ["Region", "Practice"],
  Region: ["Country", "Division"],
  Country: ["Division"],
  Division: ["Department"],
  Department: ["Team"],
  Team: ["Sub-Team"],
  "Sub-Team": [],
  Practice: []
};