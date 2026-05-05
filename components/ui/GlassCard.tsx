import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        'glass-card flex w-full max-w-[480px] flex-col items-center rounded-xl p-10 md:p-12',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
