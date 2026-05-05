import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-container-lowest',
        'rounded-2xl',
        'border border-outline-variant/30',
        'shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('px-6 py-4 border-b border-outline-variant/20', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('px-6 py-4 border-t border-outline-variant/20', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter };
export type { CardProps };
