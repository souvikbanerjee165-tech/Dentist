import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  dot = false,
  onClick,
}) => {
  const variantStyles = {
    primary: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
    neutral: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
    purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  const dotColors = {
    primary: 'bg-blue-500',
    success: 'bg-emerald-500 animate-pulse',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
    purple: 'bg-purple-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
