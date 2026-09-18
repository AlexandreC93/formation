import { notFound, redirect } from 'next/navigation';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
import { getSegmentBySlug } from '@/lib/segments';
import { loadMDX } from '@/lib/mdx';
import { LockedScreen } from '@/components/locked-screen';
import { SegmentTabs } from '@/components/segment-tabs';

interface PageProps {
  params: Promise<{ day: string; seg: string }>;
}

export default async function ModulePage({ params }: PageProps) {
  const { day, seg } = await params;

  // 1. Auth
  const code = await getSessionCode();
  if (!code) redirect('/login');

  // 2. Session Redis
  const session = await getSession(code);
  if (!session) redirect('/login');

  // 3. Résolution du segment demandé
  const segment = getSegmentBySlug(day, seg);
  if (!segment) notFound();

  // 4. Contrôle d'accès strict côté serveur
  //    Si verrouillé : zéro contenu MDX dans le payload HTML
  if (segment.index > session.active_segment) {
    return (
      <div className="h-full flex items-center justify-center">
        <LockedScreen segmentName={segment.title} />
      </div>
    );
  }

  // 5. Chargement des contenus MDX
  const [coursResult, tpResult] = await Promise.all([
    loadMDX(segment.slug, 'cours'),
    loadMDX(segment.slug, 'tp'),
  ]);

  if (!coursResult || !tpResult) notFound();

  // 6. Corrigé uniquement si explicitement libéré par le formateur
  const solutionUnlocked = session.unlocked_solutions.includes(segment.index);
  const corrigeResult = solutionUnlocked
    ? await loadMDX(segment.slug, 'corrige')
    : null;

  return (
    <div className="h-full">
      <SegmentTabs
        coursContent={coursResult.content}
        tpContent={tpResult.content}
        corrigeContent={corrigeResult?.content ?? null}
        segmentTitle={`${segment.dayLabel} — S${segment.seg} : ${segment.title}`}
      />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { day, seg } = await params;
  const segment = getSegmentBySlug(day, seg);
  return {
    title: segment
      ? `${segment.title} | Formation Technique`
      : 'Module | Formation Technique',
  };
}
