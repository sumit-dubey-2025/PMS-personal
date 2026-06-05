'use client';

import { type ChangeEvent, type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { createGoal, getGoal, listRoleExpectations, patchGoal } from '@/lib/api/goals';
import type {
  Goal,
  GoalCategory,
  GoalFormErrors,
  GoalFormValues,
  PatchGoalRequest,
  RoleExpectation,
  SmartFields,
} from '@/types/goal';

// ─── Constants ─────────────────────────────────────────────────────────────────

const GOAL_CATEGORIES: GoalCategory[] = ['Delivery', 'Capability', 'Behavioural'];

const EMPTY_FORM: GoalFormValues = {
  cycleCode: '',
  title: '',
  description: '',
  goalCategory: '',
  successCriteria: '',
  targetDate: '',
  smartSpecific: '',
  smartMeasurable: '',
  smartAchievable: '',
  smartRelevant: '',
  smartTimeBound: '',
  roleExpectationCode: '',
  weightPercent: '',
  isStretchGoal: false,
};

// ─── Component props ────────────────────────────────────────────────────────────

interface GoalEditorFormProps {
  /** Active cycle code to scope the goal and load role expectations. Inferred from the
   *  fetched goal when `goalCode` is provided; required when creating a new goal. */
  cycleCode?: string;
  /** Existing goal code — when provided without `existingGoal`, the component fetches
   *  the goal client-side so auth cookies are forwarded automatically. */
  goalCode?: string;
  /** When provided, loads an existing goal for editing without an extra fetch. */
  existingGoal?: Goal;
  /** Called after a successful create or patch so the parent can navigate away. */
  onSaved?: (goal: Goal) => void;
}

// ─── Form field component ───────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, required, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-on-surface font-body text-sm font-medium">
        {label}
        {required && (
          <span className="text-error ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-on-surface-variant font-body text-xs">{hint}</p>}
      {error && (
        <p role="alert" className="text-error font-body text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function GoalEditorForm({
  cycleCode,
  goalCode,
  existingGoal,
  onSaved,
}: GoalEditorFormProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [form, setForm] = useState<GoalFormValues>(() =>
    existingGoal
      ? mapGoalToForm(existingGoal, existingGoal.cycleCode)
      : { ...EMPTY_FORM, cycleCode: cycleCode ?? '' },
  );
  const [errors, setErrors] = useState<GoalFormErrors>({});
  const [summaryErrors, setSummaryErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedGoal, setSavedGoal] = useState<Goal | null>(existingGoal ?? null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoadingGoal, setIsLoadingGoal] = useState(Boolean(goalCode && !existingGoal));
  const [goalLoadError, setGoalLoadError] = useState<string | null>(null);

  const [roleExpectations, setRoleExpectations] = useState<RoleExpectation[]>([]);
  const [isLoadingExpectations, setIsLoadingExpectations] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);

  // ── Fetch goal client-side when goalCode is provided without existingGoal ──
  useEffect(() => {
    if (!goalCode || existingGoal) return;

    let cancelled = false;
    setIsLoadingGoal(true);
    setGoalLoadError(null);

    getGoal(goalCode)
      .then((goal) => {
        if (cancelled) return;
        setForm(mapGoalToForm(goal, goal.cycleCode));
        setSavedGoal(goal);
        setIsLoadingGoal(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          (err as { message?: string }).message ?? 'Failed to load goal. Please try again.';
        setGoalLoadError(msg);
        setIsLoadingGoal(false);
      });

    return () => {
      cancelled = true;
    };
    // goalCode and existingGoal are mount-time values; no reason to re-run on change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load role expectations when category or cycle changes ─────────────────
  useEffect(() => {
    if (!form.goalCategory || !form.cycleCode) return;

    let cancelled = false;
    setIsLoadingExpectations(true);

    listRoleExpectations({ cycleCode: form.cycleCode, goalCategory: form.goalCategory, limit: 50 })
      .then((data) => {
        if (!cancelled) setRoleExpectations(data.data);
      })
      .catch(() => {
        if (!cancelled) setRoleExpectations([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingExpectations(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.goalCategory, form.cycleCode]);

  // ── Field change handler ───────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
      const nextValue = checked !== undefined ? checked : value;
      const isGoalCategoryChange = name === 'goalCategory';

      if (isGoalCategoryChange) {
        // Clear stale options immediately so the dependent dropdown cannot retain
        // values from the previous category while new expectations are loading.
        setRoleExpectations([]);
      }

      setForm((prev) => ({
        ...prev,
        [name]: nextValue,
        ...(isGoalCategoryChange ? { roleExpectationCode: '' } : {}),
      }));

      // Clear field-level error on change
      setErrors((prev) => {
        const fieldName = name as keyof GoalFormValues;
        const hasFieldError = Boolean(prev[fieldName]);
        const hasRoleExpectationError = isGoalCategoryChange && Boolean(prev.roleExpectationCode);

        if (!hasFieldError && !hasRoleExpectationError) return prev;

        const next = { ...prev };
        delete next[fieldName];

        if (isGoalCategoryChange) {
          delete next.roleExpectationCode;
        }

        return next;
      });
      setSaveSuccess(false);
    },
    [],
  );

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = useCallback((): GoalFormErrors => {
    const errs: GoalFormErrors = {};

    if (!form.title.trim()) errs.title = 'Title is required.';
    else if (form.title.length > 500) errs.title = 'Title must not exceed 500 characters.';

    if (!form.goalCategory) errs.goalCategory = 'Goal category is required.';

    if (form.description.length > 4000)
      errs.description = 'Description must not exceed 4000 characters.';

    if (form.weightPercent) {
      const w = Number(form.weightPercent);
      if (!Number.isInteger(w) || w < 0 || w > 100)
        errs.weightPercent = 'Weight must be an integer between 0 and 100.';
    }

    return errs;
  }, [form]);

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const errs = validate();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        setSummaryErrors(Object.values(errs).filter(Boolean) as string[]);
        setTimeout(() => summaryRef.current?.focus(), 50);
        return;
      }

      setErrors({});
      setSummaryErrors([]);
      setIsSaving(true);

      try {
        let result: Goal;

        if (savedGoal) {
          // PATCH: send explicit values so users can clear previously-set fields.
          // • description / roleExpectationCode: "" clears the field on the backend
          // • successCriteria: [] clears the list (empty array is treated as "clear")
          // • smart: always send the object — individual null fields clear the column
          // • clearTargetDate: true instructs the backend to remove the target date
          const smartPatch: SmartFields = {
            specific: form.smartSpecific.trim() || null,
            measurable: form.smartMeasurable.trim() || null,
            achievable: form.smartAchievable.trim() || null,
            relevant: form.smartRelevant.trim() || null,
            timeBound: form.smartTimeBound.trim() || null,
          };

          const patchPayload: PatchGoalRequest = {
            title: form.title.trim(),
            // Send "" so the backend can write it to SharePoint and clear the field;
            // the local Goal state normalizes "" → null (see merge below).
            description: form.description.trim(),
            goalCategory: form.goalCategory as GoalCategory,
            successCriteria: form.successCriteria
              ? form.successCriteria
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [], // [] clears criteria on the backend; local state normalizes to null below
            targetDate: form.targetDate || null,
            clearTargetDate: !form.targetDate, // signal backend to clear when empty
            smart: smartPatch, // always send; individual null fields clear SMART columns
            // Send "" so the backend clears the RoleExpectationCodeLookupId in SharePoint;
            // local state normalizes "" → null (see merge below).
            roleExpectationCode: form.roleExpectationCode,
            weightPercent: form.weightPercent ? Number(form.weightPercent) : null,
            isStretchGoal: form.isStretchGoal,
          };

          const patch = await patchGoal(savedGoal.goalCode, patchPayload, savedGoal.etag);

          // Build local state for fields that are absent from PatchGoalResponse.
          // The backend treats "" as "cleared" for text fields and [] for arrays; here we
          // normalize those back to null to match the Goal interface's null-for-absent convention.
          const smartHasValue =
            smartPatch.specific !== null ||
            smartPatch.measurable !== null ||
            smartPatch.achievable !== null ||
            smartPatch.relevant !== null ||
            smartPatch.timeBound !== null;

          result = {
            ...savedGoal,
            // Normalize "" → null; backend already received "" and cleared the SP field.
            description: patchPayload.description || null,
            goalCategory: patchPayload.goalCategory ?? savedGoal.goalCategory,
            // Normalize [] → null; backend already received [] and cleared the SP field.
            successCriteria:
              (patchPayload.successCriteria?.length ?? 0) > 0
                ? patchPayload.successCriteria!
                : null,
            smart: smartHasValue ? smartPatch : null,
            // Normalize "" → null; backend already received "" and cleared the SP lookup.
            roleExpectationCode: patchPayload.roleExpectationCode || null,
            ...patch, // title, targetDate, workflowStatus, weightPercent, isStretchGoal, etag, updatedAt from server
          };
        } else {
          // POST: null = omit / don't set
          const smartPayload =
            form.smartSpecific.trim() ||
            form.smartMeasurable.trim() ||
            form.smartAchievable.trim() ||
            form.smartRelevant.trim() ||
            form.smartTimeBound.trim()
              ? {
                  specific: form.smartSpecific.trim() || null,
                  measurable: form.smartMeasurable.trim() || null,
                  achievable: form.smartAchievable.trim() || null,
                  relevant: form.smartRelevant.trim() || null,
                  timeBound: form.smartTimeBound.trim() || null,
                }
              : null;

          result = await createGoal({
            cycleCode: form.cycleCode,
            title: form.title.trim(),
            description: form.description.trim() || null,
            goalCategory: form.goalCategory as GoalCategory,
            successCriteria: form.successCriteria
              ? form.successCriteria
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : null,
            targetDate: form.targetDate || null,
            smart: smartPayload,
            roleExpectationCode: form.roleExpectationCode || null,
            weightPercent: form.weightPercent ? Number(form.weightPercent) : null,
            isStretchGoal: form.isStretchGoal,
          });
        }

        setSavedGoal(result);
        setSaveSuccess(true);
        onSaved?.(result);
      } catch (err: unknown) {
        const apiErr = err as {
          message?: string;
          errors?: Array<{
            field?: string;
            code?: string;
            message?: string;
          }>;
        };

        // Map API field errors back to form. The API returns an array of
        // field-level problem details rather than a dictionary.
        if (Array.isArray(apiErr.errors)) {
          const mapped: GoalFormErrors = {};
          const msgs: string[] = [];

          for (const fieldError of apiErr.errors) {
            const msg = fieldError.message?.trim();
            if (!msg) {
              continue;
            }

            if (fieldError.field) {
              const key = fieldError.field.charAt(0).toLowerCase() + fieldError.field.slice(1);
              mapped[key as keyof GoalFormErrors] = msg;
            }

            msgs.push(msg);
          }

          setErrors(mapped);
          setSummaryErrors(
            msgs.length > 0 ? msgs : [apiErr.message ?? 'An unexpected error occurred.'],
          );
        } else {
          setSummaryErrors([apiErr.message ?? 'An unexpected error occurred.']);
        }

        setTimeout(() => summaryRef.current?.focus(), 50);
      } finally {
        setIsSaving(false);
      }
    },
    [form, savedGoal, validate, onSaved],
  );

  // ── Input class helper ─────────────────────────────────────────────────────
  const inputClass = (field: keyof GoalFormValues) =>
    cn(
      'w-full rounded-md border px-3 py-2 text-sm font-body text-on-surface bg-surface-container-lowest',
      'placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors',
      errors[field]
        ? 'border-error focus:ring-error/30'
        : 'border-outline-variant/50 hover:border-outline',
    );

  // ── Render ─────────────────────────────────────────────────────────────────

  // Show a loading skeleton while the goal is being fetched client-side.
  if (isLoadingGoal) {
    return (
      <div
        role="status"
        aria-label="Loading goal"
        className="bg-surface-container animate-pulse rounded-xl p-8 text-center"
      >
        <p className="text-on-surface-variant font-body text-sm">Loading goal…</p>
      </div>
    );
  }

  // Show an error if the client-side goal fetch failed.
  if (goalLoadError) {
    return (
      <div
        role="alert"
        className="bg-error-container text-on-error-container font-body rounded-xl p-6 text-sm"
      >
        {goalLoadError}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} noValidate aria-label="Goal editor form">
      {/* Validation summary */}
      {summaryErrors.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="bg-error-container text-on-error-container font-body mb-6 rounded-xl p-4 text-sm"
        >
          <p className="font-headline mb-1 font-semibold">Please fix the following errors:</p>
          <ul className="list-inside list-disc space-y-1">
            {summaryErrors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success banner */}
      {saveSuccess && (
        <div
          role="status"
          className="bg-success-container font-body text-on-surface mb-6 rounded-xl p-4 text-sm"
        >
          ✓ Goal draft saved successfully.
        </div>
      )}

      <div className="space-y-6">
        {/* ── Goal Details section ─────────────────────────────────── */}
        <section
          aria-labelledby="section-goal-details"
          className="bg-surface-container-lowest space-y-5 rounded-xl p-6 shadow-sm"
        >
          <h2
            id="section-goal-details"
            className="font-headline text-on-surface text-base font-semibold"
          >
            Goal Details
          </h2>

          {/* Title */}
          <Field label="Goal Title" htmlFor="title" required error={errors.title}>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Improve deployment reliability to 99.5% uptime"
              className={inputClass('title')}
              maxLength={500}
              aria-required="true"
              aria-invalid={!!errors.title}
            />
          </Field>

          {/* Description */}
          <Field
            label="Description"
            htmlFor="description"
            error={errors.description}
            hint="Provide context about why this goal matters and how it aligns to your role."
          >
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your goal in more detail…"
              className={cn(inputClass('description'), 'min-h-[96px] resize-y')}
              maxLength={4000}
              aria-invalid={!!errors.description}
            />
          </Field>

          {/* Category + Weight row */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Goal Category"
              htmlFor="goalCategory"
              required
              error={errors.goalCategory}
            >
              <select
                id="goalCategory"
                name="goalCategory"
                value={form.goalCategory}
                onChange={handleChange}
                className={cn(inputClass('goalCategory'), 'cursor-pointer')}
                aria-required="true"
                aria-invalid={!!errors.goalCategory}
              >
                <option value="">Select a category…</option>
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Weight (%)"
              htmlFor="weightPercent"
              error={errors.weightPercent}
              hint="0–100. Leave blank if unweighted."
            >
              <input
                id="weightPercent"
                name="weightPercent"
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.weightPercent}
                onChange={handleChange}
                placeholder="e.g. 25"
                className={inputClass('weightPercent')}
                aria-invalid={!!errors.weightPercent}
              />
            </Field>
          </div>

          {/* Target date + Stretch */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Target Date" htmlFor="targetDate" error={errors.targetDate}>
              <input
                id="targetDate"
                name="targetDate"
                type="date"
                value={form.targetDate}
                onChange={handleChange}
                className={inputClass('targetDate')}
                aria-invalid={!!errors.targetDate}
              />
            </Field>

            <div className="flex flex-col justify-end">
              <label className="flex cursor-pointer items-center gap-3 select-none">
                <input
                  id="isStretchGoal"
                  name="isStretchGoal"
                  type="checkbox"
                  checked={form.isStretchGoal}
                  onChange={handleChange}
                  className="border-outline-variant/50 text-primary focus:ring-primary/30 h-4 w-4 rounded"
                />
                <span className="text-on-surface font-body text-sm font-medium">Stretch Goal</span>
                <span className="text-on-surface-variant font-body text-xs">
                  (aspirational — beyond base expectation)
                </span>
              </label>
            </div>
          </div>

          {/* Success Criteria */}
          <Field
            label="Success Criteria"
            htmlFor="successCriteria"
            error={errors.successCriteria}
            hint="Enter each criterion on a new line."
          >
            <textarea
              id="successCriteria"
              name="successCriteria"
              value={form.successCriteria}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Deployment failure rate reduced below 0.5%"
              className={cn(inputClass('successCriteria'), 'min-h-[72px] resize-y')}
              aria-invalid={!!errors.successCriteria}
            />
          </Field>
        </section>

        {/* ── Role Expectation picker ──────────────────────────────── */}
        <section
          aria-labelledby="section-role-expectation"
          className="bg-surface-container-lowest space-y-4 rounded-xl p-6 shadow-sm"
        >
          <div>
            <h2
              id="section-role-expectation"
              className="font-headline text-on-surface text-base font-semibold"
            >
              Role Expectation
            </h2>
            <p className="text-on-surface-variant font-body mt-0.5 text-xs">
              Optional — link this goal to a role expectation from your active cycle.
            </p>
          </div>

          <Field
            label="Role Expectation"
            htmlFor="roleExpectationCode"
            error={errors.roleExpectationCode}
          >
            <select
              id="roleExpectationCode"
              name="roleExpectationCode"
              value={form.roleExpectationCode}
              onChange={handleChange}
              disabled={!form.goalCategory || isLoadingExpectations}
              className={cn(
                inputClass('roleExpectationCode'),
                'cursor-pointer disabled:opacity-50',
              )}
            >
              <option value="">
                {isLoadingExpectations
                  ? 'Loading expectations…'
                  : form.goalCategory
                    ? 'None selected'
                    : 'Select a category first'}
              </option>
              {roleExpectations.map((re) => (
                <option key={re.expectationCode} value={re.expectationCode}>
                  {re.title}
                </option>
              ))}
            </select>
          </Field>

          {/* Show expectation detail when one is selected */}
          {form.roleExpectationCode &&
            (() => {
              const selected = roleExpectations.find(
                (re) => re.expectationCode === form.roleExpectationCode,
              );
              return selected ? (
                <div className="bg-surface-container font-body space-y-1 rounded-lg p-4 text-sm">
                  <p className="text-on-surface font-medium">{selected.title}</p>
                  <p className="text-on-surface-variant">{selected.expectationText}</p>
                  {selected.exampleMeasures && selected.exampleMeasures.length > 0 && (
                    <ul className="text-on-surface-variant mt-2 list-inside list-disc space-y-0.5">
                      {selected.exampleMeasures.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null;
            })()}
        </section>

        {/* ── SMART Fields section ─────────────────────────────────── */}
        <section
          aria-labelledby="section-smart"
          className="bg-surface-container-lowest space-y-5 rounded-xl p-6 shadow-sm"
        >
          <div>
            <h2
              id="section-smart"
              className="font-headline text-on-surface text-base font-semibold"
            >
              SMART Fields
            </h2>
            <p className="text-on-surface-variant font-body mt-0.5 text-xs">
              Capture how this goal meets each SMART criterion.
            </p>
          </div>

          {(
            [
              { name: 'smartSpecific', label: 'Specific', hint: 'What exactly will be achieved?' },
              {
                name: 'smartMeasurable',
                label: 'Measurable',
                hint: 'How will success be quantified?',
              },
              {
                name: 'smartAchievable',
                label: 'Achievable',
                hint: 'Is this realistic given available resources?',
              },
              {
                name: 'smartRelevant',
                label: 'Relevant',
                hint: 'Why does this matter to your role and the organisation?',
              },
              {
                name: 'smartTimeBound',
                label: 'Time-bound',
                hint: 'What is the deadline or milestone timeline?',
              },
            ] as const
          ).map(({ name, label, hint }) => (
            <Field key={name} label={label} htmlFor={name} hint={hint}>
              <textarea
                id={name}
                name={name}
                value={form[name]}
                onChange={handleChange}
                rows={2}
                className={cn(inputClass(name), 'min-h-[56px] resize-y')}
              />
            </Field>
          ))}
        </section>

        {/* ── Action bar ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-on-surface-variant font-body text-xs">
            {savedGoal
              ? `Last saved: ${new Date(savedGoal.updatedAt).toLocaleString()}`
              : 'Not yet saved'}
          </p>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : savedGoal ? 'Update Draft' : 'Save Draft'}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function mapGoalToForm(goal: Goal, cycleCode: string): GoalFormValues {
  return {
    cycleCode,
    title: goal.title,
    description: goal.description ?? '',
    goalCategory: goal.goalCategory,
    successCriteria: goal.successCriteria?.join('\n') ?? '',
    targetDate: goal.targetDate ?? '',
    smartSpecific: goal.smart?.specific ?? '',
    smartMeasurable: goal.smart?.measurable ?? '',
    smartAchievable: goal.smart?.achievable ?? '',
    smartRelevant: goal.smart?.relevant ?? '',
    smartTimeBound: goal.smart?.timeBound ?? '',
    roleExpectationCode: goal.roleExpectationCode ?? '',
    weightPercent: goal.weightPercent != null ? String(goal.weightPercent) : '',
    isStretchGoal: goal.isStretchGoal,
  };
}
