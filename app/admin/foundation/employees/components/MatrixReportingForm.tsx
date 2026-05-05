'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Person, RemoveCircle } from '@/components/ui/Icons';

export function MatrixReportingForm() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'matrixManagers' });

  return (
    <div className="border-outline-variant/15 bg-primary/[0.04] -mx-6 border-t px-6 pt-5 pb-6">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-headline text-primary text-[10px] font-bold tracking-[0.08em] uppercase">
          Matrix Reporting
        </h3>
        <button
          type="button"
          onClick={() => append({ name: '', role: '', weight: 0 })}
          className="text-secondary hover:text-secondary/70 text-[10px] font-bold tracking-wide uppercase transition-colors"
        >
          + Add Manager
        </button>
      </div>

      {/* Manager rows */}
      <div className="flex flex-col gap-2.5">
        {fields.length === 0 && (
          <p className="text-on-surface-variant/60 text-xs italic">No matrix managers assigned.</p>
        )}

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border-outline-variant/15 bg-surface-container-lowest shadow-ambient flex items-center gap-3 rounded-lg border p-2.5"
          >
            {/* Avatar */}
            <div className="bg-surface-container-high flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <Person size={16} className="text-on-surface-variant" />
            </div>

            {/* Name + role inputs */}
            <div className="min-w-0 flex-1">
              <input
                {...register(`matrixManagers.${index}.name`)}
                placeholder="Manager Name"
                className="text-primary placeholder:text-outline/50 w-full border-none bg-transparent p-0 text-xs font-bold focus:ring-0 focus:outline-none"
              />
              <input
                {...register(`matrixManagers.${index}.role`)}
                placeholder="Role"
                className="text-outline placeholder:text-outline/40 mt-0.5 w-full border-none bg-transparent p-0 text-[10px] focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Weight */}
            <div className="w-14 shrink-0 text-right">
              <label className="text-outline block text-[8px] font-bold tracking-wider uppercase">
                Weight
              </label>
              <input
                type="number"
                {...register(`matrixManagers.${index}.weight`, { valueAsNumber: true })}
                className="text-on-surface w-full border-none bg-transparent p-0 text-center text-[11px] font-bold focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() => remove(index)}
              title="Remove manager"
              className="text-error/40 hover:text-error shrink-0 transition-colors"
            >
              <RemoveCircle size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
