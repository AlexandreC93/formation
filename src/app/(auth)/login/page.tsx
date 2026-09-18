'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { Shield, KeyRound, Loader2 } from 'lucide-react';

type ActionState = { error?: string } | undefined;

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    loginAction,
    undefined
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Grid de fond */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Badge entité */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium tracking-wide">
              Plateforme Formation Sécurisée
            </span>
          </div>
        </div>

        {/* Card principale */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-2xl mb-4 border border-indigo-500/30">
              <KeyRound className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Accès Stagiaire</h1>
            <p className="text-slate-400 text-sm">
              Saisissez le code de session fourni par votre formateur
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Code de session
              </label>
              <input
                id="code"
                name="code"
                type="text"
                placeholder="ex : MININT-2026"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all"
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
              ) : (
                'Accéder à la formation'
              )}
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-6">
            Connexion sécurisée — Aucune donnée transmise hors du réseau
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-6">
          Formateur ? <a href="/admin/login" className="text-indigo-500 hover:text-indigo-400 transition-colors">Accès administration →</a>
        </p>
      </div>
    </div>
  );
}
