import { Lock } from 'lucide-react';

interface LockedScreenProps {
  segmentName?: string;
  message?: string;
}

export function LockedScreen({ segmentName, message }: LockedScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-slate-500/10 rounded-full blur-3xl scale-150" />
        <div className="relative flex items-center justify-center w-24 h-24 bg-slate-800/80 border border-slate-700/60 rounded-3xl">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-slate-200 mb-3">
        {segmentName ? `${segmentName} — Verrouillé` : 'Segment verrouillé'}
      </h2>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
        {message ??
          'Ce module n\'est pas encore disponible. Le formateur activera ce segment en temps voulu.'}
      </p>
      <div className="mt-8 flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-full px-4 py-2">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-slate-400 text-xs">En attente d&apos;activation par le formateur</span>
      </div>
    </div>
  );
}
