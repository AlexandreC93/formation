import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = await cookies();
  const sessionCode = cookieStore.get('session_code')?.value;
  const adminToken = cookieStore.get('admin_token')?.value;

  if (adminToken === 'authenticated') {
    redirect('/admin');
  }

  if (sessionCode) {
    redirect('/modules');
  }

  redirect('/login');
}
