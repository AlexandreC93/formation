'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export function HighlightWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const query = searchParams.get('highlight');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query || !containerRef.current) return;

    const container = containerRef.current;
    const term = query.toLowerCase().trim();
    if (!term) return;

    // Fonction de nettoyage
    const clearHighlights = () => {
      const marks = container.querySelectorAll('mark.highlight-target');
      marks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
          parent.normalize();
        }
      });
    };

    clearHighlights();

    // Recherche et surlignage simple (Parcourt les noeuds textes)
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const nodesToReplace: { node: Node; matchIndex: number }[] = [];

    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      if (text && text.toLowerCase().includes(term)) {
        nodesToReplace.push({ node, matchIndex: text.toLowerCase().indexOf(term) });
      }
    }

    if (nodesToReplace.length > 0) {
      let firstMark: HTMLElement | null = null;

      nodesToReplace.forEach(({ node, matchIndex }) => {
        const text = node.nodeValue!;
        const before = text.substring(0, matchIndex);
        const match = text.substring(matchIndex, matchIndex + term.length);
        const after = text.substring(matchIndex + term.length);

        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        
        const mark = document.createElement('mark');
        mark.className = 'highlight-target bg-amber-400/30 text-amber-900 dark:text-amber-200 font-medium px-1 py-0.5 rounded ring-2 ring-amber-400/50 transition-all duration-500';
        mark.textContent = match;
        fragment.appendChild(mark);
        
        if (after) fragment.appendChild(document.createTextNode(after));

        if (!firstMark) firstMark = mark;
        node.parentNode?.replaceChild(fragment, node);
      });

      // Scroll and Pulse on first match
      if (firstMark) {
        setTimeout(() => {
          (firstMark as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstMark as HTMLElement).animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.15)', backgroundColor: 'rgba(251, 191, 36, 0.6)' },
            { transform: 'scale(1)' }
          ], { duration: 600, easing: 'ease-out' });
        }, 100);
      }
    }

    return () => {
      clearHighlights();
    };
  }, [query]);

  return (
    <div ref={containerRef} className="highlight-container">
      {children}
    </div>
  );
}
