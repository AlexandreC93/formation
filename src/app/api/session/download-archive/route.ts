import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/redis';
import { getTraining } from '@/lib/trainings';
import JSZip from 'jszip';
import { readdir, readFile } from 'fs/promises';
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
  const trainingDir = join(process.cwd(), 'content', 'trainings', trainingId);

  try {
    const segments = await readdir(trainingDir, { withFileTypes: true });

    for (const segment of segments) {
      if (segment.isDirectory()) {
        const segmentDir = join(trainingDir, segment.name);
        const files = await readdir(segmentDir);
        
        for (const file of files) {
          if (file.endsWith('.mdx')) {
            const filePath = join(segmentDir, file);
            const content = await readFile(filePath, 'utf-8');
            // Remove frontmatter for a cleaner raw markdown
            const cleanContent = content.replace(/^---[\s\S]*?---\n*/, '');
            const markdownFileName = file.replace('.mdx', '.md');
            zip.file(`${segment.name}/${markdownFileName}`, cleanContent);
          }
        }
      }
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
