import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'forest' | 'gold' | 'charcoal' | 'outline' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    green:
      'dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80 bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium',
    forest:
      'dark:bg-[#21262D] dark:text-slate-200 dark:border-[#30363D] bg-slate-100 text-slate-800 border border-slate-300 font-medium',
    gold:
      'dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80 bg-amber-50 text-amber-800 border border-amber-200 font-medium',
    charcoal:
      'dark:bg-[#161B22] dark:text-slate-300 dark:border-[#30363D] bg-slate-100 text-slate-700 border border-slate-200',
    outline:
      'dark:border-[#30363D] dark:text-slate-200 border-slate-300 text-slate-700 bg-transparent',
    gray:
      'dark:bg-[#161B22] dark:text-slate-400 dark:border-[#21262D] bg-slate-50 text-slate-600 border border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-md font-medium',
    md: 'text-xs px-3 py-1 rounded-md font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
