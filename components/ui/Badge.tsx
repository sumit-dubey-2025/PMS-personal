import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'active' | 'draft' | 'completed' | 'archived' | 'warning' | 'error';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:   'bg-surface-container-high text-on-surface-variant',
  active:    'bg-emerald-100 text-emerald-700',
  draft:     'bg-surface-container-high text-on-surface-variant',
  completed: 'bg-primary-container text-on-primary-container',
  archived:  'bg-surface-container-highest text-on-surface-muted',
  warning:   'bg-warning-container text-warning',
  error:     'bg-error-container text-error',
};

function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full',
        'text-[10px] font-bold uppercase tracking-wide',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
