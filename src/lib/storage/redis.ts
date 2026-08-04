import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";

export const STORAGE_KEYS = {
  settings: "teye:settings",
  youtubeToken: "teye:youtube-token",
  quota: "teye:quota",
  liveSession: "teye:live-session",
  liveSessionOwner: "teye:live-session-owner",
} as const;

const DATA_DIR = path.join(process.cwd(), "data");
const FS_KEYS: Record<string, string> = {
  [STORAGE_KEYS.liveSession]: path.join(DATA_DIR, "live-session.json"),
};

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

async function fsGetJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function fsSetJson(filePath: string, value: unknown): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
    await fs.rename(tmp, filePath);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[storage] fs write ${filePath} failed: ${msg}`);
  }
}

async function fsDel(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // missing is fine
  }
}

export async function storageGetJson<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (redis) {
    try {
      const value = await redis.get<T>(key);
      return value ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[storage] get ${key} failed: ${msg}`);
      return null;
    }
  }
  const filePath = FS_KEYS[key];
  if (!filePath) return null;
  return fsGetJson<T>(filePath);
}

export async function storageSetJson(key: string, value: unknown): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(key, value);
    return;
  }
  const filePath = FS_KEYS[key];
  if (!filePath) {
    throw new Error("Remote storage is not configured");
  }
  await fsSetJson(filePath, value);
}

export async function storageDel(key: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[storage] del ${key} failed: ${msg}`);
    }
    return;
  }
  const filePath = FS_KEYS[key];
  if (filePath) await fsDel(filePath);
}

/** Acquire a short-lived exclusive lease. Filesystem mode always owns it. */
export async function storageAcquireLease(
  key: string,
  owner: string,
  ttlSeconds: number,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;
  try {
    const res = await redis.set(key, owner, { nx: true, ex: ttlSeconds });
    return res === "OK";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[storage] acquire lease ${key} failed: ${msg}`);
    return false;
  }
}

/** Renew a lease only if we still own it. Filesystem mode always succeeds. */
export async function storageRenewLease(
  key: string,
  owner: string,
  ttlSeconds: number,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;
  try {
    const current = await redis.get<string>(key);
    if (current !== owner) return false;
    await redis.set(key, owner, { ex: ttlSeconds });
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[storage] renew lease ${key} failed: ${msg}`);
    return false;
  }
}
