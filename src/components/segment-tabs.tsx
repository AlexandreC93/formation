'use client';

import { useState } from 'react';
import { BookOpen, FlaskConical, Lock, CheckCircle, FileText } from 'lucide-react';
import { MdxContent } from './mdx-content';
import { HighlightWrapper } from './highlight-wrapper';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { JSX } from 'react';
import type { MdxResult } from '@/lib/mdx';

type Tab = 'cours' | 'tp' | 'corrige';

interface SegmentTabsProps {
  coursResult: MdxResult;
  tpResult: MdxResult;
  corrigeResult: MdxResult | null; // null = non libéré
  segmentTitle: string;
  hasPdf: { cours: boolean; tp: boolean; corrige: boolean };
  pdfUrlBase: string;
}

function RenderMdxOrError({ result }: { result: MdxResult }) {
  if (result.error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl my-6">
        <h3 className="text-red-400 font-bold mb-2">Erreur de rendu MDX</h3>
        <p className="text-red-300 text-sm font-mono whitespace-pre-wrap">{result.error}</p>
      </div>
    );
  }
  if (result.content) {
    return (
      <HighlightWrapper>
        <MdxContent content={result.content} />
      </HighlightWrapper>
    );
  }
  return null;
}

export function SegmentTabs({
  coursResult,
  tpResult,
  corrigeResult,
  segmentTitle,
  hasPdf,
  pdfUrlBase,
}: SegmentTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const initialTab = (searchParams.get('tab') as Tab) || 'cours';
  const [activeTab, setActiveTab] = useState<Tab>(
    ['cours', 'tp', 'corrige'].includes(initialTab) ? initialTab : 'cours'
  );

  const handleTabChange = (id: Tab) => {
    setActiveTab(id);
    const params = new URLSearchParams(searchParams);
    params.set('tab', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const tabs: Array<{ id: Tab; label: string; icon: typeof BookOpen }> = [
    { id: 'cours', label: 'Cours', icon: BookOpen },
    { id: 'tp', label: 'TP', icon: FlaskConical },
    { id: 'corrige', label: 'Corrigé', icon: corrigeResult ? CheckCircle : Lock },
  ];

  const currentHasPdf = hasPdf[activeTab] && (activeTab !== 'corrige' || corrigeResult);

  return (
    <div className="flex flex-col h-full relative min-w-0">
      {/* En-tête (Titres) */}
      <div className="px-4 md:px-6 pt-6 pb-2">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1 leading-tight">{segmentTitle}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-4">Formation Technique</p>
      </div>

      {/* Onglets - Sticky sur mobile */}
      <div className="sticky top-0 z-20 px-4 md:px-6 pt-2 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar w-full">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`
                  flex items-center justify-center gap-2 px-4 py-3 min-w-[100px] min-h-[44px] text-sm font-medium rounded-t-lg transition-all duration-200 relative whitespace-nowrap
                  ${
                    activeTab === id
                      ? 'text-slate-900 bg-white border-t border-l border-r border-slate-200 shadow-sm z-10 -mb-[1px] dark:text-white dark:bg-white/5 dark:border-white/10 dark:shadow-none'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 border-b border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/3'
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    id === 'corrige' && !corrigeResult
                      ? 'text-slate-600'
                      : activeTab === id
                      ? 'text-indigo-400'
                      : 'text-slate-500'
                  }`}
                />
                <span className={id === 'corrige' && !corrigeResult ? 'text-slate-600' : ''}>
                  {label}
                </span>
                {activeTab === id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Bouton PDF si disponible */}
          {currentHasPdf && (
            <a
               href={`${pdfUrlBase}?type=${activeTab}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 mb-1 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 transition-all text-xs font-semibold whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              Télécharger PDF
            </a>
          )}
        </div>
      </div>

      {/* Bouton PDF mobile (sous les onglets si on est sur très petit écran) */}
      {currentHasPdf && (
        <div className="sm:hidden px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50">
          <a
            href={`${pdfUrlBase}?type=${activeTab}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 transition-all text-sm font-semibold"
          >
            <FileText className="w-4 h-4" />
            Télécharger le support PDF
          </a>
        </div>
      )}

      {/* Contenu de l'onglet */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 px-4 md:px-6 py-6 pb-20 md:pb-6">
        {activeTab === 'cours' && (
          <div className="animate-fade-in">
            <RenderMdxOrError result={coursResult} />
          </div>
        )}
        {activeTab === 'tp' && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <FlaskConical className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-indigo-300 text-sm font-semibold">Travaux Pratiques</p>
                <p className="text-slate-500 text-xs">Réalisez cet exercice avant de consulter le corrigé</p>
              </div>
            </div>
            <RenderMdxOrError result={tpResult} />
          </div>
        )}
        {activeTab === 'corrige' && (
          <div className="animate-fade-in">
            {corrigeResult ? (
              <>
                <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-300 text-sm font-semibold">Correction officielle</p>
                    <p className="text-slate-500 text-xs">Solution validée par le formateur</p>
                  </div>
                </div>
                <RenderMdxOrError result={corrigeResult} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center px-4">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl scale-150" />
                  <div className="relative flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
                    <Lock className="w-9 h-9 text-amber-500 dark:text-amber-400/70" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Correction non disponible</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
                  Le formateur n&apos;a pas encore partagé la correction de ce TP.{' '}
                  Elle sera débloquée à sa discrétion.
                </p>
                <div className="mt-6 flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 rounded-full px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                  <span className="text-slate-600 dark:text-slate-400 text-xs">En attente de déblocage</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
