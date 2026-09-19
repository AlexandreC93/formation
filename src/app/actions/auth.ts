'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.set('session_code', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  cookieStore.delete('session_code');

  redirect('/login');
}
