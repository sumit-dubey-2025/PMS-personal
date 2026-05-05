import React from 'react';
import { cn } from '@/lib/utils';

interface MicrosoftLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const MicrosoftLoginButton = ({ className, ...props }: MicrosoftLoginButtonProps) => {
  return (
    <button
      className={cn(
        'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container-low group shadow-ambient flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border px-6 py-3.5 transition-all duration-200',
        className,
      )}
      {...props}
    >
      <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0H0V10H10V0Z" fill="#F25022"></path>
        <path d="M21 0H11V10H21V0Z" fill="#7FBA00"></path>
        <path d="M10 11H0V21H10V11Z" fill="#00A4EF"></path>
        <path d="M21 11H11V21H21V11Z" fill="#FFB900"></path>
      </svg>
      <span className="text-on-surface font-body font-semibold tracking-tight">
        Sign in with Microsoft
      </span>
    </button>
  );
};
