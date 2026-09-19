import { notFound, redirect } from 'next/navigation';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
import { getTraining, getSegmentBySlug, checkPdfExists } from '@/lib/trainings';
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
  
  if (!config) {
    console.error(`[Training Error] Folder not found: content/trainings/${trainingId}`);
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Erreur système</h1>
        <p>Formation introuvable sur le serveur : <code>{trainingId}</code></p>
      </div>
    );
  }

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

  // 5. Chargement des contenus MDX et détection PDF
  const [coursResult, tpResult, hasCoursPdf, hasTpPdf] = await Promise.all([
    loadMDX(trainingId, segment.slug, 'cours'),
    loadMDX(trainingId, segment.slug, 'tp'),
    checkPdfExists(trainingId, segment.slug, 'cours'),
    checkPdfExists(trainingId, segment.slug, 'tp'),
  ]);

  if (!coursResult || !tpResult) notFound();

  // 6. Corrigé uniquement si explicitement libéré
  const solutionUnlocked = session.unlocked_solutions.includes(segment.index);
  const [corrigeResult, hasCorrigePdf] = solutionUnlocked
    ? await Promise.all([
        loadMDX(trainingId, segment.slug, 'corrige'),
        checkPdfExists(trainingId, segment.slug, 'corrige')
      ])
    : [null, false];

  // On peut récupérer le titre depuis le frontmatter du cours si présent
  const segmentTitle = (coursResult.frontmatter?.title as string) || segment.title;

  return (
    <div className="h-full">
      <SegmentTabs
        coursContent={coursResult.content}
        tpContent={tpResult.content}
        corrigeContent={corrigeResult?.content ?? null}
        segmentTitle={`${segment.dayLabel} — S${segment.seg} : ${segmentTitle}`}
        hasPdf={{ cours: hasCoursPdf, tp: hasTpPdf, corrige: hasCorrigePdf }}
        pdfUrlBase={`/api/modules/${day}/${seg}/pdf`}
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
