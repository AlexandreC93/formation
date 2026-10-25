'use server';

import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';
import { isAdmin } from '@/lib/auth';

function contentOverrideKey(trainingId: string, segmentSlug: string, type: string) {
  return `content_override:${trainingId}:${segmentSlug}:${type}`;
}

export async function saveMdxOverride(
  trainingId: string,
  segmentSlug: string,
  type: string,
  newContent: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Non autorisé' };

  const key = contentOverrideKey(trainingId, segmentSlug, type);
  await redis.set(key, newContent);
  revalidatePath('/admin');
  revalidatePath(`/modules/${segmentSlug.replace('j', '').replace('-s', '/')}`);
  return { success: true };
}

export async function resetMdxToOriginal(
  trainingId: string,
  segmentSlug: string,
  type: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: 'Non autorisé' };

  const key = contentOverrideKey(trainingId, segmentSlug, type);
  await redis.del(key);
  revalidatePath('/admin');
  revalidatePath(`/modules/${segmentSlug.replace('j', '').replace('-s', '/')}`);
  return { success: true };
}
