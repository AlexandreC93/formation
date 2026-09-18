'use server';

import { redirect } from 'next/navigation';
import { setAdminCookie } from '@/lib/auth';

type ActionState = { error?: string } | undefined;

export async function adminLoginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = formData.get('password') as string;

  if (!password || password !== process.env.ADMIN_SECRET_KEY) {
    return { error: 'Mot de passe incorrect.' };
  }

  await setAdminCookie();
  redirect('/admin');
}
