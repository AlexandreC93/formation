'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  updateActiveSegment,
  toggleSolution,
  createSession,
  resetSession,
  deleteSession,
} from '@/lib/redis';
import { clearAdminCookie } from '@/lib/auth';

export async function activateSegmentAction(formData: FormData) {
  const sessionCode = formData.get('sessionCode') as string;
  const segmentIndex = parseInt(formData.get('segmentIndex') as string, 10);
  await updateActiveSegment(sessionCode, segmentIndex);
  revalidatePath('/admin');
}

export async function toggleSolutionAction(formData: FormData) {
  const sessionCode = formData.get('sessionCode') as string;
  const segmentIndex = parseInt(formData.get('segmentIndex') as string, 10);
  await toggleSolution(sessionCode, segmentIndex);
  revalidatePath('/admin');
}

export async function createSessionAction(formData: FormData): Promise<void> {
  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const name = (formData.get('name') as string)?.trim();
  if (!code || !name) return;
  await createSession(code, name);
  revalidatePath('/admin');
}

export async function resetSessionAction(formData: FormData) {
  const sessionCode = formData.get('sessionCode') as string;
  await resetSession(sessionCode);
  revalidatePath('/admin');
}

export async function deleteSessionAction(formData: FormData) {
  const sessionCode = formData.get('sessionCode') as string;
  await deleteSession(sessionCode);
  revalidatePath('/admin');
}

export async function adminLogoutAction() {
  await clearAdminCookie();
  redirect('/admin/login');
}
