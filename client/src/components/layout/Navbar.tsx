import React from 'react';
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Bell, 
  Smartphone, 
  ChevronDown,
  Building2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../ui/Badge';

interface NavbarProps {
  businessName: string;
  isAIAutopilotEnabled: boolean;
  onToggleAI: () => void;
  onOpenTestChat: () => void;
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  businessName,
  isAIAutopilotEnabled,
  onToggleAI,
  onOpenTestChat,
  onOpenOnboarding,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full px-6 py-3.5 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-black/5 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Active Business Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {businessName}
            </span>
          </div>

          <Badge
            variant={isAIAutopilotEnabled ? 'success' : 'warning'}
            dot
            size="sm"
            className="cursor-pointer"
            onClick={onToggleAI}
          >
            <span className="hidden sm:inline">
              {isAIAutopilotEnabled ? 'AI Autopilot Live' : 'AI Paused (Manual Mode)'}
            </span>
            <span className="sm:hidden">{isAIAutopilotEnabled ? 'AI Live' : 'Paused'}</span>
          </Badge>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Setup Wizard Button */}
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Setup Wizard</span>
          </button>

          {/* Live Simulator Button */}
          <button
            onClick={onOpenTestChat}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Test AI Simulator</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all duration-200 active:scale-95"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all duration-200 active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
            </button>
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20 ring-2 ring-white dark:ring-slate-900">
              DR
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
