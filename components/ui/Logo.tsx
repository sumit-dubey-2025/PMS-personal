import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
}

export const Logo = ({ size = 'md', className, ...props }: LogoProps) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
    xl: 'h-32',
    '2xl': 'h-56',
    custom: 'h-16 max-w-full',
  };

  return (
    <div className={cn('flex items-center justify-center select-none', className)} {...props}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/PulsePerform_Logo.png"
        alt="PulsePerform Logo"
        className={cn(
          sizes[size],
          'w-auto object-contain transition-transform duration-500 hover:scale-[1.01]',
        )}
        draggable={false}
      />
    </div>
  );
};
