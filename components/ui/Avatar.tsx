'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
};

export function Avatar({ initials, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full bg-primary flex items-center justify-center',
        'text-on-primary font-bold shrink-0 uppercase',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {initials.slice(0, 2)}
    </div>
  );
}
