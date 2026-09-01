import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl backdrop-blur-xl transition-all duration-300
        bg-white/70 dark:bg-slate-900/50 
        border border-black/5 dark:border-white/10
        shadow-sm dark:shadow-2xl dark:shadow-black/40
        ${hoverEffect ? 'hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
