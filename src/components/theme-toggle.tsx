'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:text-slate-300 dark:hover:bg-white/5 transition-all text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" />
          <span>Thème</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:text-slate-300 dark:hover:bg-white/5 transition-all text-sm"
    >
      <div className="flex items-center gap-2">
        {currentTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-indigo-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
        <span>{currentTheme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}</span>
      </div>
    </button>
  );
}
