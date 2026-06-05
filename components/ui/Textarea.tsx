import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3',
          'bg-surface-container-low',
          'border border-outline-variant/40',
          'rounded-lg',
          'text-on-surface text-sm font-medium',
          'outline-none transition-all resize-none',
          'placeholder:text-on-surface-muted',
          'focus:ring-2 focus:ring-secondary focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
