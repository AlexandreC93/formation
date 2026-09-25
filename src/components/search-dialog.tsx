'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, BookOpen, FlaskConical, CheckCircle } from 'lucide-react';

interface SearchResult {
  day: number;
  seg: number;
  tab: 'cours' | 'tp' | 'corrige';
  title: string;
  snippet: string;
  url: string;
}

export function SearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus and reset when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Debounce API call
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
            setSelectedIndex(0);
          }
        } catch {
          // Silent fail
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        const url = results[selectedIndex].url;
        router.push(url);
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[70vh]">
        
        {/* Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-white/10">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-base"
            placeholder="Rechercher un concept, une commande..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0 ml-3" />}
          <div className="hidden sm:flex items-center gap-1 ml-3">
            <kbd className="px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-white/10">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {query.trim().length > 0 && query.trim().length < 2 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              Tapez au moins 2 caractères pour rechercher...
            </div>
          )}
          
          {query.trim().length >= 2 && results.length === 0 && !loading && (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              Aucun résultat trouvé pour &quot;{query}&quot;.<br/>
              <span className="text-xs text-slate-400 mt-2 block">La recherche s&apos;effectue uniquement sur les supports débloqués.</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => {
                const isSelected = index === selectedIndex;
                let Icon = BookOpen;
                let tabLabel = 'Cours';
                let iconColor = 'text-indigo-400';
                
                if (result.tab === 'tp') {
                  Icon = FlaskConical;
                  tabLabel = 'TP';
                  iconColor = 'text-amber-400';
                } else if (result.tab === 'corrige') {
                  Icon = CheckCircle;
                  tabLabel = 'Corrigé';
                  iconColor = 'text-emerald-400';
                }

                return (
                  <button
                    key={`${result.day}-${result.seg}-${result.tab}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      router.push(result.url);
                      onClose();
                    }}
                    className={`
                      w-full text-left px-4 py-3 flex items-start gap-3 transition-colors
                      ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}
                    `}
                  >
                    <div className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shrink-0 shadow-sm ${isSelected ? 'border-indigo-200 dark:border-indigo-500/30' : ''}`}>
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          J{result.day} S{result.seg}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {result.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                          {tabLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate opacity-90">
                        {result.snippet}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-white/5 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 font-medium bg-slate-200 dark:bg-slate-800 rounded">↑</kbd>
            <kbd className="px-1.5 py-0.5 font-medium bg-slate-200 dark:bg-slate-800 rounded">↓</kbd>
            <span>Naviguer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 font-medium bg-slate-200 dark:bg-slate-800 rounded">↵</kbd>
            <span>Ouvrir</span>
          </div>
        </div>

      </div>
    </div>
  );
}
