import { redirect } from 'next/navigation';
import { getSessionCode } from '@/lib/auth';
import { getSession } from '@/lib/redis';
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

  // Redirection vers le premier segment accessible si on arrive sur /modules sans chemin
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar
        initialStatus={{
          active_segment: session.active_segment,
          unlocked_solutions: session.unlocked_solutions,
        }}
        sessionName={session.name}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
