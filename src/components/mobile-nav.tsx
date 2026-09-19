'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { Lock, Unlock, ChevronDown, ChevronRight, GraduationCap, LogOut, Download, Menu, X } from 'lucide-react';
import type { Segment, TrainingConfig } from '@/lib/trainings';

interface SessionStatus {
  active_segment: number;
  unlocked_solutions: number[];
}

interface MobileNavProps {
  initialStatus: SessionStatus;
  sessionName: string;
  trainingConfig: TrainingConfig;
  segments: Segment[];
  allowArchiveDownload: boolean;
}

export function MobileNav({
  initialStatus,
  sessionName,
  trainingConfig,
  segments,
  allowArchiveDownload,
}: MobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<SessionStatus>(initialStatus);
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({});

  const pollInterval = parseInt(
    process.env.NEXT_PUBLIC_SESSION_POLL_INTERVAL ?? '30000',
    10
  );

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/session/status', { cache: 'no-store' });
      if (res.ok) {
        const data: SessionStatus = await res.json();
        setStatus(data);
      }
    } catch {
      // Polling silencieux
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(timer);
  }, [fetchStatus, pollInterval]);

  // Ouvrir automatiquement le jour du segment actif
  useEffect(() => {
    const activeSegment = segments.find((s) => s.index === status.active_segment);
    if (activeSegment) {
      setOpenDays((prev) => ({ ...prev, [activeSegment.day]: true }));
    }
  }, [status.active_segment, segments]);

  // Ouvrir le jour de la page courante
  useEffect(() => {
    const match = pathname.match(/\/modules\/(\d+)\/(\d+)/);
    if (match) {
      setOpenDays((prev) => ({ ...prev, [parseInt(match[1])]: true }));
    }
  }, [pathname]);

  const toggleDay = (day: number) => {
    setOpenDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const DAYS = Array.from({ length: trainingConfig.totalDays }, (_, i) => i + 1);

  // Close drawer on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Get active segment details for the header
  const activeSegmentDetails = segments.find((s) => s.index === status.active_segment);

  return (
    <>
      {/* Barre d'en-tête mobile */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-slate-950/90 backdrop-blur border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-indigo-600/20 border border-indigo-500/30 rounded-lg">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-semibold truncate max-w-[150px]">{trainingConfig.title}</span>
            {activeSegmentDetails && (
              <span className="text-slate-400 text-[10px]">
                Actif : J{activeSegmentDetails.day}-S{activeSegmentDetails.seg}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Overlay et Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop (cliquable pour fermer) */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Tiroir */}
          <div className="relative w-4/5 max-w-sm flex flex-col h-full bg-slate-950 border-r border-white/5 shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Header du tiroir */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <p className="text-white text-sm font-semibold leading-tight truncate">{sessionName}</p>
                <p className="text-slate-500 text-xs">Navigation des modules</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Navigation des modules mobile">
              {DAYS.map((day) => {
                const daySegments = segments.filter((s) => s.day === day);
                const isDayOpen = openDays[day] ?? false;
                const hasAccessible = daySegments.some((s) => s.index <= status.active_segment);

                return (
                  <div key={day}>
                    <button
                      onClick={() => toggleDay(day)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            hasAccessible
                              ? 'bg-indigo-500/15 text-indigo-400'
                              : 'bg-slate-800 text-slate-600'
                          }`}
                        >
                          J{day}
                        </span>
                        <span
                          className={`text-sm font-medium truncate ${
                            hasAccessible ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          Jour {day}
                        </span>
                      </div>
                      {isDayOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                    </button>

                    {isDayOpen && (
                      <div className="ml-4 mt-1 mb-2 space-y-1">
                        {daySegments.map((segment) => {
                          const isLocked = segment.index > status.active_segment;
                          const isCurrent = pathname === `/modules/${segment.day}/${segment.seg}`;

                          return (
                            <Link
                              key={segment.slug}
                              href={`/modules/${segment.day}/${segment.seg}`}
                              className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                                ${
                                  isCurrent
                                    ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                                    : isLocked
                                    ? 'text-slate-600 cursor-default pointer-events-none'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }
                              `}
                              aria-disabled={isLocked}
                            >
                              {isLocked ? (
                                <Lock className="w-4 h-4 text-slate-700 flex-shrink-0" />
                              ) : (
                                <Unlock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                              )}
                              <span className="font-medium flex-shrink-0 text-slate-500">S{segment.seg}</span>
                              <span className="truncate">{segment.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Pied du tiroir */}
            <div className="p-4 border-t border-white/5 space-y-3 pb-8">
              {allowArchiveDownload && (
                <a
                  href="/api/session/download-archive"
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-all text-sm border border-emerald-500/30"
                >
                  <Download className="w-4 h-4" />
                  Télécharger (ZIP)
                </a>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
