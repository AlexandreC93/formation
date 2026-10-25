import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getTraining, generateSegments } from '@/lib/trainings';

export async function GET(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return new NextResponse('Non autorisé', { status: 401 });

  const trainingId = request.nextUrl.searchParams.get('trainingId');
  if (!trainingId) return new NextResponse('trainingId manquant', { status: 400 });

  const config = await getTraining(trainingId);
  if (!config) return new NextResponse('Formation introuvable', { status: 404 });

  const segments = await generateSegments(config);
  return NextResponse.json({ segments });
}
