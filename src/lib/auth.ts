import { cookies } from 'next/headers';

const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE ?? '86400', 10);

export async function getSessionCode(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('session_code')?.value ?? null;
}

export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_token')?.value ?? null;
}

export async function isAdmin(): Promise<boolean> {
  const token = await getAdminToken();
  return token === 'authenticated';
}

export async function setSessionCookie(code: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('session_code', code.toUpperCase(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin_token', 'authenticated', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session_code');
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}
