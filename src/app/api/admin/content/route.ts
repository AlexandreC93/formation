import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { loadMDX, MdxType } from '@/lib/mdx';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return new NextResponse('Non autorisé', { status: 401 });

  const trainingId = request.nextUrl.searchParams.get('trainingId');
  const slug = request.nextUrl.searchParams.get('slug');
  const tab = request.nextUrl.searchParams.get('tab') as MdxType;

  if (!trainingId || !slug || !tab) {
    return new NextResponse('Paramètres manquants', { status: 400 });
  }

  if (!(['cours', 'tp', 'corrige'] as MdxType[]).includes(tab)) {
    return new NextResponse('Type invalide', { status: 400 });
  }

  const result = await loadMDX(trainingId, slug, tab);

  if (!result) {
    return NextResponse.json({
      rawContent: null,
      isOverridden: false,
      error: 'Aucun fichier MDX trouvé pour cet onglet.',
      title: null,
    });
  }

  return NextResponse.json({
    rawContent: result.rawContent ?? null,
    isOverridden: result.isOverridden ?? false,
    error: result.error ?? null,
    title: result.frontmatter?.title ?? null,
  });
}
