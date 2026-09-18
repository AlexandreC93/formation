'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/redis';
import { setSessionCookie } from '@/lib/auth';

type ActionState = { error?: string } | undefined;

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const code = (formData.get('code') as string)?.trim().toUpperCase();

  if (!code) {
    return { error: 'Veuillez saisir un code de session.' };
  }

  const session = await getSession(code);
  if (!session) {
    return { error: 'Code de session invalide ou introuvable.' };
  }

  const expiresAt = new Date(session.expires_at);
  if (isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
    return { error: 'Code de session expiré.' };
  }

  await setSessionCookie(code);
  redirect('/modules');
}
