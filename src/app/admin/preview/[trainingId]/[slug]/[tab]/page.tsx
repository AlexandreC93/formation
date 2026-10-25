import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { loadMDX, MdxType } from '@/lib/mdx';
import { MdxContent } from '@/components/mdx-content';

export const dynamic = 'force-dynamic';

interface PreviewProps {
  params: Promise<{ trainingId: string; slug: string; tab: string }>;
}

export default async function AdminPreviewPage({ params }: PreviewProps) {
  const { trainingId, slug, tab } = await params;
  const admin = await isAdmin();
  if (!admin) redirect('/admin/login');

  const validTabs: MdxType[] = ['cours', 'tp', 'corrige'];
  if (!validTabs.includes(tab as MdxType)) {
    return <div className="p-4 text-red-500">Type invalide</div>;
  }

  const result = await loadMDX(trainingId, slug, tab as MdxType);

  const isDark = true; // le viewer admin est en dark

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/preview.css" />
        <style>{`
          body { 
            margin: 0; padding: 24px; 
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            background: transparent;
            color: #e2e8f0;
          }
          .prose h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #f1f5f9; }
          .prose h2 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.75rem; color: #e2e8f0; }
          .prose h3 { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem; color: #cbd5e1; }
          .prose p { margin-bottom: 0.75rem; line-height: 1.7; color: #94a3b8; }
          .prose code { background: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 0.875em; color: #7dd3fc; }
          .prose pre { background: #0f172a; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
          .prose pre code { background: none; padding: 0; color: inherit; }
          .prose ul, .prose ol { padding-left: 1.5rem; margin-bottom: 0.75rem; color: #94a3b8; }
          .prose li { margin-bottom: 0.25rem; }
          .prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
          .prose th { background: #1e293b; color: #e2e8f0; padding: 8px 12px; text-align: left; border: 1px solid #334155; }
          .prose td { padding: 8px 12px; border: 1px solid #334155; color: #94a3b8; }
          .prose blockquote { border-left: 3px solid #6366f1; padding-left: 1rem; margin: 1rem 0; color: #94a3b8; font-style: italic; }
          .prose strong { color: #e2e8f0; }
          .prose a { color: #818cf8; text-decoration: underline; }
        `}</style>
      </head>
      <body>
        <div className="prose max-w-none">
          {!result && (
            <p style={{ color: '#f59e0b' }}>Aucun document trouvé pour cet onglet.</p>
          )}
          {result?.error && (
            <p style={{ color: '#f87171' }}>{result.error}</p>
          )}
          {result?.content && (
            <MdxContent content={result.content} />
          )}
        </div>
      </body>
    </html>
  );
}
