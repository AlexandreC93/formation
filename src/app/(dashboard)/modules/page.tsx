import { redirect } from 'next/navigation';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
import { getSegmentByIndex } from '@/lib/segments';

export default async function ModulesIndexPage() {
  const code = await getSessionCode();
  if (!code) redirect('/login');

  const session = await getSession(code);
  if (!session) redirect('/login');

  // Rediriger vers le segment actif
  const activeSegment = getSegmentByIndex(session.active_segment);
  if (activeSegment) {
    redirect(`/modules/${activeSegment.day}/${activeSegment.seg}`);
  }

  redirect('/modules/1/1');
}
