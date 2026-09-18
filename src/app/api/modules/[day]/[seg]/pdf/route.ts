import { NextRequest, NextResponse } from 'next/server';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
import { getTraining, getSegmentBySlug, checkPdfExists } from '@/lib/trainings';
import { createReadStream } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ day: string; seg: string }> }
) {
  const { day, seg } = await params;
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  if (type !== 'cours' && type !== 'tp' && type !== 'corrige') {
    return new NextResponse('Type invalide', { status: 400 });
  }

  // 1. Auth
  const code = await getSessionCode();
  if (!code) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  // 2. Session
  const session = await getSession(code);
  if (!session) {
    return new NextResponse('Session invalide ou expirée', { status: 401 });
  }

  const trainingId = session.training_id || 'administration-linux';
  const config = await getTraining(trainingId);
  if (!config) {
    return new NextResponse('Formation introuvable', { status: 404 });
  }

  // 3. Segment
  const segment = getSegmentBySlug(config, day, seg);
  if (!segment) {
    return new NextResponse('Segment introuvable', { status: 404 });
  }

  // 4. Contrôle d'accès : segment libéré ?
  if (segment.index > session.active_segment) {
    return new NextResponse('Segment verrouillé', { status: 403 });
  }

  // 5. Contrôle d'accès : corrigé libéré ?
  if (type === 'corrige' && !session.unlocked_solutions.includes(segment.index)) {
    return new NextResponse('Corrigé verrouillé', { status: 403 });
  }

  // 6. Fichier existe ?
  const exists = await checkPdfExists(trainingId, segment.slug, type);
  if (!exists) {
    return new NextResponse('Fichier introuvable', { status: 404 });
  }

  // 7. Envoi du flux
  const filePath = join(process.cwd(), 'content', 'trainings', trainingId, segment.slug, `${type}.pdf`);
  const stream = createReadStream(filePath);
  
  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${type}-${segment.slug}.pdf"`,
    },
  });
}
