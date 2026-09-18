import { CodeBlockWrapper } from './code-block';
import type { JSX } from 'react';

// Composants MDX personnalisés
export const mdxComponents = {
  // Bloc de code avec bouton copier
  pre: CodeBlockWrapper,
  // Titres avec ancres
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string'
      ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : undefined;
    return <h1 id={id} className="text-3xl font-bold text-white mb-6 mt-8 scroll-mt-20" {...props}>{children}</h1>;
  },
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string'
      ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : undefined;
    return <h2 id={id} className="text-2xl font-bold text-slate-100 mb-4 mt-8 pb-2 border-b border-white/10 scroll-mt-20" {...props}>{children}</h2>;
  },
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string'
      ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : undefined;
    return <h3 id={id} className="text-xl font-semibold text-slate-200 mb-3 mt-6 scroll-mt-20" {...props}>{children}</h3>;
  },
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-lg font-semibold text-slate-300 mb-2 mt-4" {...props}>{children}</h4>
  ),
  // Paragraphes
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4" {...props} />
  ),
  // Listes
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base text-slate-300 pl-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside space-y-1 mb-4 text-sm sm:text-base text-slate-300 pl-2" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-slate-300 leading-relaxed" {...props} />
  ),
  // Code inline
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded px-1.5 py-0.5 text-sm font-mono"
      {...props}
    >
      {children}
    </code>
  ),
  // Tableaux
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-slate-800/80" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3 text-left text-slate-200 font-semibold border-b border-white/10" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 text-slate-300 border-b border-white/5" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="hover:bg-white/3 transition-colors" {...props} />
  ),
  // Citation
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-indigo-500/60 pl-4 py-1 my-4 bg-indigo-500/5 rounded-r-lg text-slate-400 italic"
      {...props}
    />
  ),
  // Séparateur
  hr: () => <hr className="border-white/10 my-8" />,
  // Liens
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/40 hover:decoration-indigo-400 transition-colors"
      {...props}
    >
      {children}
    </a>
  ),
  // Callouts (strong dans blockquote)
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-white font-semibold" {...props} />
  ),
};

interface MdxContentProps {
  content: JSX.Element;
}

export function MdxContent({ content }: MdxContentProps) {
  return (
    <div className="mdx-content">
      {content}
    </div>
  );
}
