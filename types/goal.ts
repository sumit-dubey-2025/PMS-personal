// ---------------------------------------------------------------------------
// Goal domain types — aligned to PulsePerform.Api GoalResponse / API spec
// ---------------------------------------------------------------------------

export type GoalCategory = 'Delivery' | 'Capability' | 'Behavioural';

export type GoalWorkflowStatus =
  | 'Draft'
  | 'InReview'
  | 'Approved'
  | 'EditRequested'
  | 'Rejected'
  | 'Archived';

export interface SmartFields {
  specific: string | null;
  measurable: string | null;
  achievable: string | null;
  relevant: string | null;
  timeBound: string | null;
}

export interface Goal {
  goalCode: string;
  cycleCode: string;
  goalScope: string;
  ownerEmployeeEmail: string;
  title: string;
  description: string | null;
  goalCategory: GoalCategory;
  successCriteria: string[] | null;
  targetDate: string | null;
  smart: SmartFields | null;
  workflowStatus: GoalWorkflowStatus;
  isStretchGoal: boolean;
  weightPercent: number | null;
  roleExpectationCode: string | null;
  parentGoalCode: string | null;
  linkedObjectiveCode: string | null;
  currentCompletionPercent: number;
  currentProgressStatus: string | null;
  lastDecisionComment: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  etag: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalPaginationMeta {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export interface GoalListResponse {
  data: Goal[];
  pagination: GoalPaginationMeta;
}

// ─── Request types ─────────────────────────────────────────────────────────────

export interface CreateGoalRequest {
  cycleCode: string;
  title: string;
  description?: string | null;
  goalCategory: GoalCategory;
  successCriteria?: string[] | null;
  targetDate?: string | null;
  smart?: Partial<SmartFields> | null;
  roleExpectationCode?: string | null;
  weightPercent?: number | null;
  isStretchGoal?: boolean;
}

export interface PatchGoalRequest {
  title?: string | null;
  description?: string | null;
  goalCategory?: GoalCategory | null;
  successCriteria?: string[] | null;
  targetDate?: string | null;
  /** When true, explicitly clears the targetDate field. Use this flag instead of
   *  sending targetDate: null because the backend cannot distinguish an absent field
   *  from an explicit null on a nullable DateOnly property. */
  clearTargetDate?: boolean;
  smart?: Partial<SmartFields> | null;
  roleExpectationCode?: string | null;
  weightPercent?: number | null;
  isStretchGoal?: boolean | null;
  changeReason?: string | null;
}

export interface PatchGoalResponse {
  goalCode: string;
  workflowStatus: GoalWorkflowStatus;
  title: string;
  targetDate: string | null;
  isStretchGoal: boolean;
  weightPercent: number | null;
  etag: string | null;
  updatedAt: string;
}

// ─── Role Expectation types ────────────────────────────────────────────────────

export interface RoleExpectation {
  expectationCode: string;
  title: string;
  goalCategory: GoalCategory;
  expectationText: string;
  exampleMeasures: string[] | null;
  roleFamilyCode: string;
  jobLevelCode: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: string;
}

export interface RoleExpectationPaginationMeta {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export interface RoleExpectationListResponse {
  data: RoleExpectation[];
  pagination: RoleExpectationPaginationMeta;
}

// ─── API error types ───────────────────────────────────────────────────────────

/**
 * Matches the `FieldError` shape emitted by `ApiProblemDetails.errors` on the
 * API side (ExceptionHandlingMiddleware → 422 responses).
 */
export interface FieldError {
  field: string;
  code: string;
  message: string;
}

// ─── Form state ────────────────────────────────────────────────────────────────

export interface GoalFormValues {
  cycleCode: string;
  title: string;
  description: string;
  goalCategory: GoalCategory | '';
  successCriteria: string;
  targetDate: string;
  smartSpecific: string;
  smartMeasurable: string;
  smartAchievable: string;
  smartRelevant: string;
  smartTimeBound: string;
  roleExpectationCode: string;
  weightPercent: string;
  isStretchGoal: boolean;
}

export type GoalFormErrors = Partial<Record<keyof GoalFormValues, string>>;
