import { NextRequest, NextResponse } from 'next/server';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
import { getTraining, generateSegments, resolveSegmentFiles } from '@/lib/trainings';
import { readFile } from 'fs/promises';
import { join } from 'path';

function cleanFilenameToTitle(filename: string): string {
  return filename
    .replace(/\.(cours|tp|corrige)\.mdx?$/, '')
    .replace(/\.pdf$/, '')
    .replace(/\.mdx?$/, '')
    .replace(/^(\d+[\s_-]*)+/, '')
    .replace(/[-_]/g, ' ')
    .trim();
}

function stripMarkdown(md: string): string {
  // Suppression basique de la syntaxe Markdown
  return md
    .replace(/---[\s\S]*?---/g, '') // Frontmatter
    .replace(/#+\s+(.*)/g, '$1') // Titres
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Liens
    .replace(/[*_~`]/g, '') // Styles
    .replace(/<[^>]+>/g, '') // Balises HTML/JSX
    .replace(/\n+/g, ' ') // Sauts de ligne
    .trim();
}

function findSnippets(text: string, query: string, contextLength = 50): string[] {
  const snippets: string[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let startIndex = 0;
  while ((startIndex = lowerText.indexOf(lowerQuery, startIndex)) > -1) {
    const start = Math.max(0, startIndex - contextLength);
    const end = Math.min(text.length, startIndex + query.length + contextLength);
    snippets.push('...' + text.substring(start, end).trim() + '...');
    startIndex += query.length;
    // On se limite à un snippet par fichier pour éviter de surcharger
    break;
  }
  return snippets;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const code = await getSessionCode();
  if (!code) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const session = await getSession(code);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const trainingId = session.training_id || 'administration-linux';
  const config = await getTraining(trainingId);
  if (!config) {
    return new NextResponse('Training config not found', { status: 404 });
  }

  const segments = await generateSegments(config);
  const results = [];

  for (const segment of segments) {
    if (segment.index > session.active_segment) {
      continue;
    }

    const files = await resolveSegmentFiles(trainingId, segment.slug);
    const types: Array<'cours' | 'tp' | 'corrige'> = ['cours', 'tp', 'corrige'];

    for (const type of types) {
      if (type === 'corrige' && !session.unlocked_solutions.includes(segment.index)) {
        continue;
      }

      const mdxFilename = files[type].mdx;
      if (!mdxFilename) continue;

      try {
        const filePath = join(process.cwd(), 'content', 'trainings', trainingId, segment.slug, mdxFilename);
        const content = await readFile(filePath, 'utf-8');
        
        let title = segment.title;
        // On tente de récupérer le titre du H1
        const h1Match = content.match(/^\s*#\s+(.*)$/m);
        if (h1Match && h1Match[1]) {
          title = h1Match[1].trim();
        } else if (type === 'cours') {
          title = cleanFilenameToTitle(mdxFilename);
        }

        const plainText = stripMarkdown(content);
        const snippets = findSnippets(plainText, query);

        if (snippets.length > 0) {
          results.push({
            day: segment.day,
            seg: segment.seg,
            tab: type,
            title: title,
            snippet: snippets[0],
            url: `/modules/${segment.day}/${segment.seg}?tab=${type}`
          });
        }
      } catch {
        // Erreur de lecture du fichier
      }
    }
  }

  return NextResponse.json(results);
}
