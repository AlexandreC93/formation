import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/redis';
import { getTraining, generateSegments, resolveSegmentFiles } from '@/lib/trainings';
import JSZip from 'jszip';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCode = cookieStore.get('session_code')?.value;

  if (!sessionCode) {
    return new NextResponse('Non authentifié', { status: 401 });
  }

  const session = await getSession(sessionCode);
  if (!session) {
    return new NextResponse('Session introuvable', { status: 404 });
  }

  if (!session.allow_archive_download) {
    return new NextResponse('Téléchargement non autorisé', { status: 403 });
  }

  const trainingId = session.training_id || 'administration-linux';
  const config = await getTraining(trainingId);
  if (!config) {
    return new NextResponse('Formation introuvable', { status: 404 });
  }

  const zip = new JSZip();
  const segments = await generateSegments(config);
  const trainingDir = join(process.cwd(), 'content', 'trainings', trainingId);

  const rootFolder = zip.folder(`Formation-${config.title.replace(/[^a-zA-Z0-9-]/g, '_')}`);
  if (!rootFolder) {
    return new NextResponse('Erreur ZIP', { status: 500 });
  }

  try {
    for (const segment of segments) {
      const jourFolderName = `Jour-${segment.day}`;
      const segmentFolderName = `Segment-${String(segment.index).padStart(2, '0')}-${segment.title.replace(/[^a-zA-Z0-9-]/g, '_')}`;
      const segmentFolder = rootFolder.folder(jourFolderName)?.folder(segmentFolderName);
      
      if (!segmentFolder) continue;

      const segmentDir = join(trainingDir, segment.slug);

      const files = await resolveSegmentFiles(trainingId, segment.slug);

      const addFile = async (type: 'cours' | 'tp' | 'corrige', niceName: string) => {
        // Skip if corrigé is locked
        if (type === 'corrige' && !session.unlocked_solutions.includes(segment.index)) {
          return;
        }

        const pdfFile = files[type].pdf;
        const mdxFile = files[type].mdx;
        
        if (pdfFile) {
          const pdfContent = await readFile(join(segmentDir, pdfFile));
          segmentFolder.file(`${niceName}.pdf`, pdfContent);
        } else if (mdxFile) {
          try {
            const mdxContent = await readFile(join(segmentDir, mdxFile), 'utf-8');
            const cleanContent = mdxContent.replace(/^---[\s\S]*?---\n*/, '');
            segmentFolder.file(`${niceName}.md`, cleanContent);
          } catch {
            // Fichier MDX manquant (ex: pas de corrigé)
          }
        }
      };

      await addFile('cours', 'Support-Cours');
      await addFile('tp', 'Sujet-TP');
      await addFile('corrige', 'Corrige-TP');
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    return new NextResponse(zipContent as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="formation-${trainingId}.zip"`,
      },
    });
  } catch (error) {
    console.error('ZIP generation error:', error);
    return new NextResponse('Erreur lors de la génération de l\'archive', { status: 500 });
  }
}
