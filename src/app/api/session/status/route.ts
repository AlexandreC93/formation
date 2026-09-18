import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCode = cookieStore.get('session_code')?.value;

  if (!sessionCode) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const session = await getSession(sessionCode);
  if (!session) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }

  return NextResponse.json({
    active_segment: session.active_segment,
    unlocked_solutions: session.unlocked_solutions,
  });
}
