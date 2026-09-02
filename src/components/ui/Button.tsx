import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'forest' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none whitespace-nowrap cursor-pointer rounded-lg';

  const variants = {
    primary:
      'dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-xs',
    forest:
      'dark:bg-[#21262D] dark:hover:bg-[#30363D] dark:text-slate-100 dark:border-[#30363D] bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs',
    secondary:
      'dark:bg-[#161B22] dark:hover:bg-[#21262D] dark:text-slate-200 dark:border-[#30363D] bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs',
    outline:
      'dark:border-[#30363D] dark:text-emerald-400 dark:hover:bg-[#161B22] dark:hover:border-emerald-500/50 border-slate-300 text-emerald-700 hover:bg-emerald-50/60 border shadow-xs',
    ghost:
      'dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#21262D] text-slate-700 hover:text-slate-950 hover:bg-slate-100',
    danger:
      'dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
