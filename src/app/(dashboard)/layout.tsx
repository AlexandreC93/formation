import { redirect } from 'next/navigation';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
import { getTraining, generateSegments } from '@/lib/trainings';
import { Sidebar } from '@/components/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const code = await getSessionCode();
  if (!code) redirect('/login');

  const session = await getSession(code);
  if (!session) {
    redirect('/login');
  }

  // Si on a d'anciennes sessions sans training_id, on fallback sur administration-linux
  const trainingId = session.training_id || 'administration-linux';
  const config = await getTraining(trainingId);
  if (!config) {
    return <div>Configuration de formation introuvable.</div>;
  }

  const segments = generateSegments(config);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar
        initialStatus={{
          active_segment: session.active_segment,
          unlocked_solutions: session.unlocked_solutions,
        }}
        sessionName={session.name}
        trainingConfig={config}
        segments={segments}
        allowArchiveDownload={session.allow_archive_download ?? false}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
