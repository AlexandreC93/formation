'use server';

import { redirect } from 'next/navigation';
import { sessionExists } from '@/lib/redis';
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

  const exists = await sessionExists(code);
  if (!exists) {
    return { error: 'Code de session invalide ou expiré.' };
  }

  await setSessionCookie(code);
  redirect('/modules');
}
