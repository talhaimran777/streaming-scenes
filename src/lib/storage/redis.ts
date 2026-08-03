import { Redis } from "@upstash/redis";

export const STORAGE_KEYS = {
  settings: "teye:settings",
  youtubeToken: "teye:youtube-token",
  quota: "teye:quota",
} as const;

function resolveRedisEnv(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
  if (!url || !token) return null;
  return { url, token };
}

export function isRemoteStorageConfigured(): boolean {
  return resolveRedisEnv() !== null;
}

const globalForRedis = globalThis as unknown as {
  __teyeRedis?: Redis | null;
};

function getRedis(): Redis | null {
  if (globalForRedis.__teyeRedis !== undefined) {
    return globalForRedis.__teyeRedis;
  }
  const env = resolveRedisEnv();
  if (!env) {
    globalForRedis.__teyeRedis = null;
    return null;
  }
  globalForRedis.__teyeRedis = new Redis({ url: env.url, token: env.token });
  return globalForRedis.__teyeRedis;
}

export async function storageGetJson<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const value = await redis.get<T>(key);
    return value ?? null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[storage] get ${key} failed: ${msg}`);
    return null;
  }
}

export async function storageSetJson(key: string, value: unknown): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    throw new Error("Remote storage is not configured");
  }
  await redis.set(key, value);
}

export async function storageDel(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[storage] del ${key} failed: ${msg}`);
  }
}
