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
    return <h1 id={id} className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 pb-3 border-b border-slate-200 dark:border-white/10 scroll-mt-20 not-prose" {...props}>{children}</h1>;
  },
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string'
      ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : undefined;
    return <h2 id={id} className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-10 mb-4 pb-2 border-b border-slate-200 dark:border-white/5 flex items-center gap-2 scroll-mt-20 not-prose" {...props}>{children}</h2>;
  },
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string'
      ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : undefined;
    return <h3 id={id} className="text-lg font-semibold text-slate-900 dark:text-amber-400/90 mt-6 mb-3 scroll-mt-20 not-prose" {...props}>{children}</h3>;
  },
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-base font-semibold text-slate-800 dark:text-slate-300 mt-4 mb-2 not-prose" {...props}>{children}</h4>
  ),
  // Paragraphes
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed my-4 text-[15px] not-prose" {...props} />
  ),
  // Listes
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside ml-6 space-y-2 text-slate-700 dark:text-slate-300 my-4 not-prose" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside ml-6 space-y-2 text-slate-700 dark:text-slate-300 my-4 not-prose" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="pl-1 marker:text-slate-500 dark:marker:text-amber-500 not-prose" {...props} />
  ),
  // Code inline
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-slate-200 dark:bg-slate-800/80 text-slate-900 dark:text-amber-300 px-1.5 py-0.5 rounded-md font-mono text-sm border border-slate-300 dark:border-white/5 not-prose"
      {...props}
    >
      {children}
    </code>
  ),
  // Conteneur du tableau : fluide et ajusté
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/40">
      <table className="w-full border-collapse text-left table-auto" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} />
  ),
  // En-têtes : texte très compact sur smartphone, normal sur PC
  th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="bg-slate-100/90 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-tight
      px-2 py-1.5 text-[10px] leading-tight
      sm:px-3 sm:py-2 sm:text-xs
      md:px-4 md:py-2.5 md:text-sm" {...props}>
      {children}
    </th>
  ),
  // Cellules : espacements et police réduits sur smartphone pour éviter le débordement
  td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-b border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-300
      px-2 py-1 text-[10.5px] leading-snug
      sm:px-3 sm:py-2 sm:text-xs
      md:px-4 md:py-2.5 md:text-sm" {...props}>
      {children}
    </td>
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="hover:bg-slate-50 dark:hover:bg-white/3 transition-colors" {...props} />
  ),
  // Citation
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="bg-slate-100 dark:bg-slate-800/50 border-l-4 border-amber-500 rounded-r-lg p-4 my-6 text-slate-700 dark:text-slate-200 text-sm not-italic not-prose"
      {...props}
    />
  ),
  // Séparateur
  hr: () => <hr className="my-8 border-slate-200 dark:border-white/10 not-prose" />,
  // Liens
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline decoration-indigo-500/40 hover:decoration-indigo-600 dark:hover:decoration-indigo-400 transition-colors not-prose"
      {...props}
    >
      {children}
    </a>
  ),
  // Callouts (strong dans blockquote)
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-slate-900 dark:text-white font-semibold not-prose" {...props} />
  ),
};

interface MdxContentProps {
  content: JSX.Element;
}

export function MdxContent({ content }: MdxContentProps) {
  return (
    <div className="mdx-content prose prose-slate dark:prose-invert max-w-none">
      {content}
    </div>
  );
}
