import { notFound, redirect } from 'next/navigation';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
import { getTraining, getSegmentBySlug } from '@/lib/trainings';
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

  const trainingId = session.training_id || 'administration-linux';
  const config = await getTraining(trainingId);
  if (!config) notFound();

  // 3. Résolution du segment demandé
  const segment = getSegmentBySlug(config, day, seg);
  if (!segment) notFound();

  // 4. Contrôle d'accès strict côté serveur
  if (segment.index > session.active_segment) {
    return (
      <div className="h-full flex items-center justify-center">
        <LockedScreen segmentName={segment.title} />
      </div>
    );
  }

  // 5. Chargement des contenus MDX
  const [coursResult, tpResult] = await Promise.all([
    loadMDX(trainingId, segment.slug, 'cours'),
    loadMDX(trainingId, segment.slug, 'tp'),
  ]);

  if (!coursResult || !tpResult) notFound();

  // 6. Corrigé uniquement si explicitement libéré
  const solutionUnlocked = session.unlocked_solutions.includes(segment.index);
  const corrigeResult = solutionUnlocked
    ? await loadMDX(trainingId, segment.slug, 'corrige')
    : null;

  // On peut récupérer le titre depuis le frontmatter du cours si présent
  const segmentTitle = (coursResult.frontmatter?.title as string) || segment.title;

  return (
    <div className="h-full">
      <SegmentTabs
        coursContent={coursResult.content}
        tpContent={tpResult.content}
        corrigeContent={corrigeResult?.content ?? null}
        segmentTitle={`${segment.dayLabel} — S${segment.seg} : ${segmentTitle}`}
      />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  // On ne peut pas facilement fetcher le titre dynamique sans tout re-parser ici.
  // Un titre générique suffit.
  return {
    title: 'Module | Formation Technique',
  };
}
