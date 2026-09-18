import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { listSessions } from '@/lib/redis';
import { DAYS, DAY_TITLES, getSegmentsByDay } from '@/lib/segments';
import {
  activateSegmentAction,
  toggleSolutionAction,
  createSessionAction,
  resetSessionAction,
  deleteSessionAction,
  adminLogoutAction,
} from './actions';
import {
  Lock,
  Unlock,
  CheckCircle,
  Plus,
  RotateCcw,
  Trash2,
  LogOut,
  ShieldCheck,
  Users,
  BookOpen,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/admin/login');

  const sessions = await listSessions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-amber-600/20 border border-amber-500/30 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Panneau Formateur</h1>
              <p className="text-slate-500 text-xs">Contrôle des sessions de formation</p>
            </div>
          </div>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-indigo-400" />
              <span className="text-slate-400 text-sm">Sessions actives</span>
            </div>
            <p className="text-3xl font-bold text-white">{sessions.length}</p>
          </div>
          <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-400 text-sm">Total segments</span>
            </div>
            <p className="text-3xl font-bold text-white">20</p>
          </div>
          <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-amber-400" />
              <span className="text-slate-400 text-sm">Jours de formation</span>
            </div>
            <p className="text-3xl font-bold text-white">5</p>
          </div>
        </div>

        {/* Créer une nouvelle session */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            Créer une nouvelle session
          </h2>
          <form action={createSessionAction} className="flex gap-3">
            <input
              name="code"
              placeholder="Code session (ex: MININT-2026)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
              required
            />
            <input
              name="name"
              placeholder="Intitulé de la formation"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              Créer
            </button>
          </form>
        </div>

        {/* Aucune session */}
        {sessions.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Aucune session de formation créée.</p>
            <p className="text-sm mt-1">Utilisez le formulaire ci-dessus pour en créer une.</p>
          </div>
        )}

        {/* Sessions */}
        {sessions.map(({ code, data }) => (
          <div key={code} className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
            {/* En-tête session */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white font-bold tracking-wider">{code}</span>
                    <span className="bg-indigo-500/15 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
                      Segment actif : {data.active_segment}/20
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">{data.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={resetSessionAction}>
                  <input type="hidden" name="sessionCode" value={code} />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Réinitialiser
                  </button>
                </form>
                <form action={deleteSessionAction}>
                  <input type="hidden" name="sessionCode" value={code} />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10 transition-all text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </form>
              </div>
            </div>

            {/* Grille des 5 jours */}
            <div className="p-6 space-y-6">
              {DAYS.map((day) => (
                <div key={day}>
                  <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Jour {day} — {DAY_TITLES[day]}
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {getSegmentsByDay(day).map((segment) => {
                      const isActive = segment.index <= data.active_segment;
                      const isCurrent = segment.index === data.active_segment;
                      const solutionUnlocked = data.unlocked_solutions?.includes(segment.index);

                      return (
                        <div
                          key={segment.slug}
                          className={`
                            relative p-4 rounded-xl border transition-all
                            ${
                              isCurrent
                                ? 'bg-indigo-500/10 border-indigo-500/30'
                                : isActive
                                ? 'bg-white/3 border-white/10'
                                : 'bg-white/1 border-white/5 opacity-60'
                            }
                          `}
                        >
                          {/* Badge état */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500">S{segment.seg}</span>
                            {isActive ? (
                              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-700" />
                            )}
                          </div>

                          <p className="text-xs text-slate-300 leading-snug mb-4 line-clamp-2">
                            {segment.title}
                          </p>

                          <div className="space-y-2">
                            {/* Activer jusqu'à ce segment */}
                            <form action={activateSegmentAction}>
                              <input type="hidden" name="sessionCode" value={code} />
                              <input type="hidden" name="segmentIndex" value={segment.index} />
                              <button
                                type="submit"
                                className={`
                                  w-full text-xs py-1.5 px-2 rounded-lg font-medium transition-all
                                  ${
                                    isCurrent
                                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 cursor-default'
                                      : 'bg-white/5 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30'
                                  }
                                `}
                                disabled={isCurrent}
                              >
                                {isCurrent ? 'En cours ✓' : `Activer jusqu'à S${segment.seg}`}
                              </button>
                            </form>

                            {/* Toggle corrigé */}
                            {isActive && (
                              <form action={toggleSolutionAction}>
                                <input type="hidden" name="sessionCode" value={code} />
                                <input type="hidden" name="segmentIndex" value={segment.index} />
                                <button
                                  type="submit"
                                  className={`
                                    w-full text-xs py-1.5 px-2 rounded-lg font-medium transition-all border
                                    ${
                                      solutionUnlocked
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                        : 'bg-white/3 text-slate-500 border-white/5 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20'
                                    }
                                  `}
                                >
                                  {solutionUnlocked ? '🔓 Masquer corrigé' : '🔒 Révéler corrigé'}
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
