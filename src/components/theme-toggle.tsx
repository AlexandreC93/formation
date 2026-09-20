'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:text-slate-300 dark:hover:bg-white/5 transition-all text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" />
          <span>Thème</span>
        </div>
      </button>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:text-slate-300 dark:hover:bg-white/5 transition-all text-sm"
      >
        <div className="flex items-center gap-2">
          {theme === 'light' ? (
            <Sun className="w-4 h-4" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Laptop className="w-4 h-4" />
          )}
          <span>Thème</span>
        </div>
        <span className="text-xs opacity-60 capitalize">{theme === 'system' ? 'Système' : theme === 'light' ? 'Clair' : 'Sombre'}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden z-50">
          <button
            onClick={() => { setTheme('light'); setIsOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${theme === 'light' ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700/50 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
          >
            <Sun className="w-4 h-4" /> Clair
          </button>
          <button
            onClick={() => { setTheme('dark'); setIsOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${theme === 'dark' ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700/50 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
          >
            <Moon className="w-4 h-4" /> Sombre
          </button>
          <button
            onClick={() => { setTheme('system'); setIsOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${theme === 'system' ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700/50 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
          >
            <Laptop className="w-4 h-4" /> Système
          </button>
        </div>
      )}
    </div>
  );
}
