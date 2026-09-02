import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'compact' | 'pill';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
          isDark
            ? 'bg-[#21262D] hover:bg-[#30363D] text-slate-200 border-[#30363D]'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
        } ${className}`}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Moon className="w-3.5 h-3.5 text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span>{isDark ? 'Dark' : 'Light'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative p-2 rounded-lg transition-colors cursor-pointer border ${
        isDark
          ? 'bg-[#21262D] hover:bg-[#30363D] text-slate-200 border-[#30363D]'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
      } ${className}`}
    >
      <div className="w-4 h-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Moon className="w-4 h-4 text-emerald-400" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sun className="w-4 h-4 text-amber-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};
