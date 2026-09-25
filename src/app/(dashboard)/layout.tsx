import { redirect } from 'next/navigation';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
import { getTraining, generateSegments } from '@/lib/trainings';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';

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

  const segments = await generateSegments(config);

  const sidebarProps = {
    initialStatus: {
      active_segment: session.active_segment,
      unlocked_solutions: session.unlocked_solutions,
    },
    sessionName: session.name,
    trainingConfig: config,
    segments,
    allowArchiveDownload: session.allow_archive_download ?? false,
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden w-full max-w-full min-w-0">
      {/* Navigation Mobile (affichée uniquement < md) */}
      <MobileNav {...sidebarProps} />

      {/* Sidebar Desktop (masquée < md) */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Contenu Principal */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
