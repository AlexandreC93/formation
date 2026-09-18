import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface SessionData {
  name: string;
  training_id: string;
  active_segment: number;
  unlocked_solutions: number[];
  allow_archive_download: boolean;
  expires_at: string;
  created_at: string;
}

const sessionKey = (code: string) => `session:${code.toUpperCase()}`;

export async function getSession(code: string): Promise<SessionData | null> {
  try {
    const data = await redis.get<SessionData>(sessionKey(code));
    return data;
  } catch {
    return null;
  }
}

export async function sessionExists(code: string): Promise<boolean> {
  const exists = await redis.exists(sessionKey(code));
  return exists === 1;
}

export async function createSession(
  code: string,
  name: string,
  training_id: string,
  expires_at: string
): Promise<void> {
  const session: SessionData = {
    name,
    training_id,
    active_segment: 1,
    unlocked_solutions: [],
    allow_archive_download: false,
    expires_at,
    created_at: new Date().toISOString(),
  };
  await redis.set(sessionKey(code), session);
  await redis.sadd('active_sessions', code.toUpperCase());
}

export async function updateActiveSegment(
  code: string,
  segmentIndex: number
): Promise<void> {
  const session = await getSession(code);
  if (!session) throw new Error('Session introuvable');
  await redis.set(sessionKey(code), {
    ...session,
    active_segment: Math.max(1, segmentIndex),
  });
}

export async function toggleSolution(
  code: string,
  segmentIndex: number
): Promise<void> {
  const session = await getSession(code);
  if (!session) throw new Error('Session introuvable');
  const current = session.unlocked_solutions ?? [];
  const updated = current.includes(segmentIndex)
    ? current.filter((i) => i !== segmentIndex)
    : [...current, segmentIndex];
  await redis.set(sessionKey(code), {
    ...session,
    unlocked_solutions: updated,
  });
}

export async function toggleArchiveDownload(code: string): Promise<void> {
  const session = await getSession(code);
  if (!session) throw new Error('Session introuvable');
  await redis.set(sessionKey(code), {
    ...session,
    allow_archive_download: !session.allow_archive_download,
  });
}

export async function resetSession(code: string): Promise<void> {
  const session = await getSession(code);
  if (!session) throw new Error('Session introuvable');
  await redis.set(sessionKey(code), {
    ...session,
    active_segment: 1,
    unlocked_solutions: [],
    allow_archive_download: false,
  });
}

export async function deleteSession(code: string): Promise<void> {
  const upperCode = code.toUpperCase();
  await redis.del(sessionKey(upperCode));
  await redis.srem('active_sessions', upperCode);
}

export async function listSessions(): Promise<Array<{ code: string; data: SessionData }>> {
  const activeKeys = await redis.smembers('active_sessions');
  if (!activeKeys || activeKeys.length === 0) return [];
  
  const pipeline = redis.pipeline();
  activeKeys.forEach((k) => pipeline.get(sessionKey(k as string)));
  const results = await pipeline.exec<SessionData[]>();
  
  return activeKeys.map((key, i) => ({
    code: key as string,
    data: results[i],
  }));
}
