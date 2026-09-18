'use client';

import { useActionState } from 'react';
import { adminLoginAction } from './actions';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';

type ActionState = { error?: string } | undefined;

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    adminLoginAction,
    undefined
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(234,179,8,0.3) 0%, transparent 70%)`,
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium tracking-wide">
              Accès Formateur
            </span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-2xl mb-4 border border-amber-500/30">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Administration</h1>
            <p className="text-slate-400 text-sm">
              Panneau de contrôle réservé au formateur
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Mot de passe maître
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 transition-all"
              />
            </div>

            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Authentification...</>
              ) : (
                'Accéder au panneau'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">
          <a href="/login" className="text-slate-600 hover:text-slate-500 transition-colors">← Retour accès stagiaires</a>
        </p>
      </div>
    </div>
  );
}
