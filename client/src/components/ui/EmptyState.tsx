import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-blue-500 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all duration-200 rounded-xl shadow-lg shadow-blue-500/25"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
