import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GoalEditorForm } from '@/components/goals/GoalEditorForm';
import type { Goal } from '@/types/goal';

// ─── Mock API client ──────────────────────────────────────────────────────────

vi.mock('@/lib/api/goals', () => ({
  createGoal: vi.fn(),
  getGoal: vi.fn(),
  patchGoal: vi.fn(),
  listRoleExpectations: vi.fn(),
}));

import { createGoal, getGoal, listRoleExpectations, patchGoal } from '@/lib/api/goals';

const mockCreateGoal = vi.mocked(createGoal);
const mockGetGoal = vi.mocked(getGoal);
const mockPatchGoal = vi.mocked(patchGoal);
const mockListRoleExpectations = vi.mocked(listRoleExpectations);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function buildGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    goalCode: 'GOAL-FY26-H2-0001',
    cycleCode: 'FY26-H2',
    goalScope: 'Individual',
    ownerEmployeeEmail: 'employee@example.com',
    title: 'Improve deployment reliability',
    description: null,
    goalCategory: 'Capability',
    successCriteria: null,
    targetDate: null,
    smart: null,
    workflowStatus: 'Draft',
    isStretchGoal: false,
    weightPercent: null,
    roleExpectationCode: null,
    parentGoalCode: null,
    linkedObjectiveCode: null,
    currentCompletionPercent: 0,
    currentProgressStatus: null,
    lastDecisionComment: null,
    submittedAt: null,
    approvedAt: null,
    etag: '"1-abc"',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GoalEditorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockListRoleExpectations.mockResolvedValue({
      data: [
        {
          expectationCode: 'RE-ENG-L4-CAP-001',
          title: 'Azure platform capability uplift',
          goalCategory: 'Capability',
          expectationText: 'Demonstrates measurable improvement in Azure capabilities.',
          exampleMeasures: ['Complete one Azure certification'],
          roleFamilyCode: 'ENG',
          jobLevelCode: 'L4',
          effectiveFrom: null,
          effectiveTo: null,
          status: 'Active',
        },
      ],
      pagination: { limit: 50, nextCursor: null, hasMore: false, totalCount: 1 },
    });
  });

  afterEach(() => {
    cleanup();
  });

  // ── Render state ────────────────────────────────────────────────────────────

  it('renders empty form with required fields and save button', () => {
    render(<GoalEditorForm cycleCode="FY26-H2" />);

    expect(screen.getByLabelText(/Goal Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Goal Category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Draft/i })).toBeInTheDocument();
  });

  it('shows loading skeleton when goalCode is provided (client-side fetch)', async () => {
    mockGetGoal.mockResolvedValueOnce(buildGoal());

    render(<GoalEditorForm goalCode="GOAL-FY26-H2-0001" />);

    // Loading state is shown initially
    expect(screen.getByRole('status', { name: /Loading goal/i })).toBeInTheDocument();

    // Form becomes available once goal loads
    await waitFor(() => {
      expect(screen.getByLabelText(/Goal Title/i)).toBeInTheDocument();
    });
  });

  it('shows error when client-side goal fetch fails', async () => {
    mockGetGoal.mockRejectedValueOnce(Object.assign(new Error('Goal not found'), { status: 404 }));

    render(<GoalEditorForm goalCode="GOAL-NONEXISTENT" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('renders all SMART field textareas', () => {
    render(<GoalEditorForm cycleCode="FY26-H2" />);

    expect(screen.getByLabelText(/Specific/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Measurable/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Achievable/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Relevant/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time-bound/i)).toBeInTheDocument();
  });

  it('populates existing goal data when editing', () => {
    const goal = buildGoal({
      title: 'Improve Azure deployment reliability',
      goalCategory: 'Capability',
      description: 'This is a detailed description',
    });

    render(<GoalEditorForm cycleCode="FY26-H2" existingGoal={goal} />);

    expect((screen.getByLabelText(/Goal Title/i) as HTMLInputElement).value).toBe(
      'Improve Azure deployment reliability',
    );
    expect((screen.getByLabelText(/Description/i) as HTMLTextAreaElement).value).toBe(
      'This is a detailed description',
    );
    expect(screen.getByRole('button', { name: /Update Draft/i })).toBeInTheDocument();
  });

  it('shows "Update Draft" button when an existing goal is provided', () => {
    render(<GoalEditorForm cycleCode="FY26-H2" existingGoal={buildGoal()} />);

    expect(screen.getByRole('button', { name: /Update Draft/i })).toBeInTheDocument();
  });

  // ── Required field validation ────────────────────────────────────────────────

  it('shows validation summary when required fields are missing on save', async () => {
    render(<GoalEditorForm cycleCode="FY26-H2" />);

    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please fix the following errors/i)).toBeInTheDocument();
    });

    // Text appears in both the summary list and inline — use getAllByText
    expect(screen.getAllByText(/Title is required/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Goal category is required/i).length).toBeGreaterThan(0);
  });

  it('shows inline field error on title when title is empty', async () => {
    render(<GoalEditorForm cycleCode="FY26-H2" />);

    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('does not submit when title is missing', async () => {
    render(<GoalEditorForm cycleCode="FY26-H2" />);

    // Only set category, leave title empty
    fireEvent.change(screen.getByLabelText(/Goal Category/i), {
      target: { value: 'Capability' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      expect(mockCreateGoal).not.toHaveBeenCalled();
    });
  });

  it('does not submit when category is missing', async () => {
    render(<GoalEditorForm cycleCode="FY26-H2" />);

    fireEvent.change(screen.getByLabelText(/Goal Title/i), {
      target: { value: 'Some goal title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      expect(mockCreateGoal).not.toHaveBeenCalled();
    });
  });

  // ── Save draft success ───────────────────────────────────────────────────────

  it('calls createGoal with correct payload on new goal save', async () => {
    const created = buildGoal();
    mockCreateGoal.mockResolvedValueOnce(created);

    render(<GoalEditorForm cycleCode="FY26-H2" />);

    fireEvent.change(screen.getByLabelText(/Goal Title/i), {
      target: { value: 'Improve Azure deployment reliability' },
    });
    fireEvent.change(screen.getByLabelText(/Goal Category/i), {
      target: { value: 'Capability' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      expect(mockCreateGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          cycleCode: 'FY26-H2',
          title: 'Improve Azure deployment reliability',
          goalCategory: 'Capability',
        }),
      );
    });
  });

  it('shows success banner after successful save', async () => {
    mockCreateGoal.mockResolvedValueOnce(buildGoal());

    render(<GoalEditorForm cycleCode="FY26-H2" />);

    fireEvent.change(screen.getByLabelText(/Goal Title/i), {
      target: { value: 'My goal' },
    });
    fireEvent.change(screen.getByLabelText(/Goal Category/i), {
      target: { value: 'Delivery' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/Goal draft saved successfully/i)).toBeInTheDocument();
    });
  });

  it('calls patchGoal when editing an existing goal', async () => {
    const existing = buildGoal();
    const patched = {
      goalCode: existing.goalCode,
      workflowStatus: 'Draft' as const,
      title: 'Updated Title',
      targetDate: null,
      isStretchGoal: false,
      weightPercent: null,
      etag: '"2-xyz"',
      updatedAt: '2026-01-02T00:00:00Z',
    };
    mockPatchGoal.mockResolvedValueOnce(patched);

    render(<GoalEditorForm cycleCode="FY26-H2" existingGoal={existing} />);

    fireEvent.change(screen.getByLabelText(/Goal Title/i), {
      target: { value: 'Updated Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Update Draft/i }));

    await waitFor(() => {
      expect(mockPatchGoal).toHaveBeenCalledWith(
        existing.goalCode,
        expect.objectContaining({ title: 'Updated Title' }),
        existing.etag,
      );
    });
  });

  // ── Save draft error handling ────────────────────────────────────────────────

  it('shows error summary when API returns validation errors', async () => {
    const apiError = Object.assign(new Error('Validation failed'), {
      status: 422,
      errors: [
        {
          field: 'GoalCategory',
          code: 'ValidationError',
          message: 'goalCategory must be one of: Delivery, Capability, Behavioural.',
        },
      ],
    });
    mockCreateGoal.mockRejectedValueOnce(apiError);

    render(<GoalEditorForm cycleCode="FY26-H2" />);

    fireEvent.change(screen.getByLabelText(/Goal Title/i), {
      target: { value: 'My goal' },
    });
    fireEvent.change(screen.getByLabelText(/Goal Category/i), {
      target: { value: 'Delivery' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please fix the following errors/i)).toBeInTheDocument();
    });
  });

  it('shows generic error message when API fails without detail', async () => {
    mockCreateGoal.mockRejectedValueOnce(new Error('Server error'));

    render(<GoalEditorForm cycleCode="FY26-H2" />);

    fireEvent.change(screen.getByLabelText(/Goal Title/i), {
      target: { value: 'My goal' },
    });
    fireEvent.change(screen.getByLabelText(/Goal Category/i), {
      target: { value: 'Delivery' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  // ── Role expectation picker ──────────────────────────────────────────────────

  it('loads role expectations when a category is selected', async () => {
    render(<GoalEditorForm cycleCode="FY26-H2" />);

    fireEvent.change(screen.getByLabelText(/Goal Category/i), {
      target: { value: 'Capability' },
    });

    await waitFor(() => {
      expect(mockListRoleExpectations).toHaveBeenCalledWith(
        expect.objectContaining({ cycleCode: 'FY26-H2', goalCategory: 'Capability' }),
      );
    });
  });

  it('shows expectation options in the role expectation dropdown after loading', async () => {
    render(<GoalEditorForm cycleCode="FY26-H2" />);

    fireEvent.change(screen.getByLabelText(/Goal Category/i), {
      target: { value: 'Capability' },
    });

    await waitFor(() => {
      expect(screen.getByText('Azure platform capability uplift')).toBeInTheDocument();
    });
  });

  it('role expectation picker is disabled before a category is selected', () => {
    render(<GoalEditorForm cycleCode="FY26-H2" />);

    // The select has id="roleExpectationCode"
    const picker = screen.getByRole('combobox', { name: /Role Expectation/i });
    expect(picker).toBeDisabled();
  });
});
