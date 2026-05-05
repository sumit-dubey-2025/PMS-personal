import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ExpandMore } from './Icons';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 pr-10',
            'bg-surface-container-low',
            'border border-outline-variant/40',
            'rounded-lg',
            'text-on-surface text-sm font-medium',
            'appearance-none outline-none transition-all',
            'focus:ring-2 focus:ring-secondary focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ExpandMore
          size={16}
          className="pointer-events-none absolute right-3 top-4 text-on-surface-variant"
        />
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps };
