import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3',
          'bg-surface-container-low',
          'border border-outline-variant/40',
          'rounded-lg',
          'text-on-surface text-sm font-medium',
          'outline-none transition-all',
          'placeholder:text-on-surface-muted',
          'focus:ring-2 focus:ring-secondary focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'read-only:bg-surface-container-high read-only:cursor-default',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
