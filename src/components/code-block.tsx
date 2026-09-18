'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback pour les navigateurs sans clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copié !' : 'Copier le code'}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 transition-all duration-200 text-xs font-medium"
    >
      {copied ? (
        <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copié</>  
      ) : (
        <><Copy className="w-3.5 h-3.5" /> Copier</>
      )}
    </button>
  );
}

// Wrapper utilisé dans le MDX pour les blocs pre
export function CodeBlockWrapper({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  // Extraire le texte brut pour le bouton copier
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && typeof node === 'object' && 'props' in (node as React.ReactElement)) {
      return extractText(
        (node as React.ReactElement<{ children?: React.ReactNode }>).props.children
      );
    }
    return '';
  };


  const rawText = extractText(children);
  // Extraire le langage depuis la classe du premier enfant
  const langMatch =
    typeof children === 'object' &&
    children !== null &&
    'props' in (children as React.ReactElement)
      ? (
          (children as React.ReactElement<{ className?: string }>).props
            ?.className ?? ''
        ).match(/language-(\w+)/)
      : null;
  const lang = langMatch ? langMatch[1] : null;


  return (
    <div className="group relative my-6 rounded-xl overflow-hidden border border-white/5 shadow-xl">
      {/* Barre supérieure */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          {lang && (
            <span className="text-xs text-slate-500 font-mono ml-2 uppercase tracking-wider">
              {lang}
            </span>
          )}
        </div>
        <CopyButton text={rawText} />
      </div>
      {/* Code */}
      <pre
        {...props}
        className="overflow-x-auto p-4 bg-slate-950 text-sm leading-relaxed whitespace-pre"
        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
      >
        {children}
      </pre>
    </div>
  );
}
