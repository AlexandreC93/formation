'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Unlock, ChevronDown, ChevronRight, GraduationCap, LogOut } from 'lucide-react';
import { SEGMENTS, DAYS, DAY_TITLES } from '@/lib/segments';

interface SessionStatus {
  active_segment: number;
  unlocked_solutions: number[];
}

interface SidebarProps {
  initialStatus: SessionStatus;
  sessionName: string;
}

export function Sidebar({ initialStatus, sessionName }: SidebarProps) {
  const pathname = usePathname();
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
      // Polling silencieux — pas d'alerte en cas d'erreur réseau
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(timer);
  }, [fetchStatus, pollInterval]);

  // Ouvrir automatiquement le jour du segment actif
  useEffect(() => {
    const activeSegment = SEGMENTS.find((s) => s.index === status.active_segment);
    if (activeSegment) {
      setOpenDays((prev) => ({ ...prev, [activeSegment.day]: true }));
    }
  }, [status.active_segment]);

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

  return (
    <aside className="flex flex-col w-72 h-screen bg-slate-950/80 border-r border-white/5 overflow-y-auto flex-shrink-0">
      {/* Logo / Titre */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Formation Technique</p>
            <p className="text-slate-500 text-xs truncate max-w-[160px]">{sessionName}</p>
          </div>
        </div>
      </div>

      {/* Navigation des segments */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Navigation des modules">
        {DAYS.map((day) => {
          const daySegments = SEGMENTS.filter((s) => s.day === day);
          const isOpen = openDays[day] ?? false;
          const hasAccessible = daySegments.some((s) => s.index <= status.active_segment);

          return (
            <div key={day}>
              {/* En-tête du jour */}
              <button
                onClick={() => toggleDay(day)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
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
                    className={`text-xs font-medium truncate max-w-[150px] ${
                      hasAccessible ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {DAY_TITLES[day]}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                )}
              </button>

              {/* Liste des segments du jour */}
              {isOpen && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {daySegments.map((segment) => {
                    const isLocked = segment.index > status.active_segment;
                    const isCurrent = pathname === `/modules/${segment.day}/${segment.seg}`;

                    return (
                      <Link
                        key={segment.slug}
                        href={`/modules/${segment.day}/${segment.seg}`}
                        className={`
                          flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200
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
                          <Lock className="w-3 h-3 text-slate-700 flex-shrink-0" />
                        ) : (
                          <Unlock className="w-3 h-3 text-indigo-500 flex-shrink-0" />
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

      {/* Pied de sidebar */}
      <div className="p-3 border-t border-white/5">
        <form action="/api/logout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
