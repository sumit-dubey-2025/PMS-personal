import { type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

function FieldLabel({ required, className, children, ...props }: FieldLabelProps) {
  return (
    <label
      className={cn(
        'block text-[10px] font-bold tracking-[0.07em] uppercase',
        'text-on-surface-variant mb-1.5',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

export { FieldLabel };
export type { FieldLabelProps };
