import { redirect } from 'next/navigation';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
import { getTraining, generateSegments } from '@/lib/trainings';

export default async function ModulesIndexPage() {
  const code = await getSessionCode();
  if (!code) redirect('/login');

  const session = await getSession(code);
  if (!session) redirect('/login');

  const trainingId = session.training_id || 'administration-linux';
  const config = await getTraining(trainingId);

  if (config) {
    const segments = await generateSegments(config);
    const activeSegment = segments.find((s) => s.index === session.active_segment);
    if (activeSegment) {
      redirect(`/modules/${activeSegment.day}/${activeSegment.seg}`);
    }
  }

  redirect('/modules/1/1');
}
