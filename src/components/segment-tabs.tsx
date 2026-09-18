'use client';

import { useState } from 'react';
import { BookOpen, FlaskConical, Lock, CheckCircle } from 'lucide-react';
import { MdxContent } from './mdx-content';
import type { JSX } from 'react';

type Tab = 'cours' | 'tp' | 'corrige';

interface SegmentTabsProps {
  coursContent: JSX.Element;
  tpContent: JSX.Element;
  corrigeContent: JSX.Element | null; // null = non libéré
  segmentTitle: string;
}

export function SegmentTabs({
  coursContent,
  tpContent,
  corrigeContent,
  segmentTitle,
}: SegmentTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('cours');

  const tabs: Array<{ id: Tab; label: string; icon: typeof BookOpen }> = [
    { id: 'cours', label: 'Cours', icon: BookOpen },
    { id: 'tp', label: 'Travaux Pratiques', icon: FlaskConical },
    { id: 'corrige', label: 'Corrigé', icon: corrigeContent ? CheckCircle : Lock },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="px-6 pt-6 pb-0">
        <h1 className="text-2xl font-bold text-white mb-1">{segmentTitle}</h1>
        <p className="text-slate-500 text-sm mb-5">Formation Administration Système & Sécurité</p>

        {/* Onglets */}
        <div className="flex gap-1 border-b border-white/10">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 relative
                ${
                  activeTab === id
                    ? 'text-white bg-white/5 border-t border-l border-r border-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/3'
                }
              `}
            >
              <Icon
                className={`w-4 h-4 ${
                  id === 'corrige' && !corrigeContent
                    ? 'text-slate-600'
                    : activeTab === id
                    ? 'text-indigo-400'
                    : 'text-slate-500'
                }`}
              />
              <span className={id === 'corrige' && !corrigeContent ? 'text-slate-600' : ''}>
                {label}
              </span>
              {activeTab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu de l'onglet */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === 'cours' && (
          <div className="animate-fade-in">
            <MdxContent content={coursContent} />
          </div>
        )}
        {activeTab === 'tp' && (
          <div className="animate-fade-in">
            {/* Badge TP */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <FlaskConical className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-indigo-300 text-sm font-semibold">Travaux Pratiques</p>
                <p className="text-slate-500 text-xs">Réalisez cet exercice avant de consulter le corrigé</p>
              </div>
            </div>
            <MdxContent content={tpContent} />
          </div>
        )}
        {activeTab === 'corrige' && (
          <div className="animate-fade-in">
            {corrigeContent ? (
              <>
                {/* Badge corrigé disponible */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-300 text-sm font-semibold">Correction officielle</p>
                    <p className="text-slate-500 text-xs">Solution validée par le formateur</p>
                  </div>
                </div>
                <MdxContent content={corrigeContent} />
              </>
            ) : (
              /* Corrigé verrouillé par le formateur */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl scale-150" />
                  <div className="relative flex items-center justify-center w-20 h-20 bg-slate-800/80 border border-slate-700/60 rounded-2xl">
                    <Lock className="w-9 h-9 text-amber-400/70" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Correction non disponible</h3>
                <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                  Le formateur n&apos;a pas encore partagé la correction de ce TP.{' '}
                  Elle sera débloquée à sa discrétion.
                </p>
                <div className="mt-6 flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-full px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">En attente de déblocage</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
