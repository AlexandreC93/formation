import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface SessionData {
  name: string;
  active_segment: number;
  unlocked_solutions: number[];
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
  name: string
): Promise<void> {
  const session: SessionData = {
    name,
    active_segment: 1,
    unlocked_solutions: [],
    created_at: new Date().toISOString(),
  };
  await redis.set(sessionKey(code), session);
}

export async function updateActiveSegment(
  code: string,
  segmentIndex: number
): Promise<void> {
  const session = await getSession(code);
  if (!session) throw new Error('Session introuvable');
  await redis.set(sessionKey(code), {
    ...session,
    active_segment: Math.max(1, Math.min(20, segmentIndex)),
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

export async function resetSession(code: string): Promise<void> {
  const session = await getSession(code);
  if (!session) throw new Error('Session introuvable');
  await redis.set(sessionKey(code), {
    ...session,
    active_segment: 1,
    unlocked_solutions: [],
  });
}

export async function deleteSession(code: string): Promise<void> {
  await redis.del(sessionKey(code));
}

export async function listSessions(): Promise<Array<{ code: string; data: SessionData }>> {
  const keys = await redis.keys('session:*');
  if (!keys.length) return [];
  const pipeline = redis.pipeline();
  keys.forEach((k) => pipeline.get(k));
  const results = await pipeline.exec<SessionData[]>();
  return keys.map((key, i) => ({
    code: key.replace('session:', ''),
    data: results[i],
  }));
}
