import { promises as fs } from "fs";
import path from "path";
import {
  appSettingsSchema,
  defaultSettings,
  type AppSettings,
  type SceneSettingsMap,
} from "./schema";
import type { SceneId } from "../scenes";
import { bus } from "../sse/bus";
import {
  isRemoteStorageConfigured,
  STORAGE_KEYS,
  storageGetJson,
  storageSetJson,
} from "../storage/redis";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");

let writeChain: Promise<void> = Promise.resolve();
let cache: AppSettings | null = null;

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function logFsWarning(op: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.warn(`[settings] ${op} failed (read-only or missing FS): ${msg}`);
}

async function readSettingsFromFs(): Promise<AppSettings | null> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf8");
    return appSettingsSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeSettingsToFs(validated: AppSettings) {
  try {
    await ensureDataDir();
    const tmp = `${SETTINGS_PATH}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(validated, null, 2), "utf8");
    await fs.rename(tmp, SETTINGS_PATH);
  } catch (err) {
    logFsWarning("persist settings", err);
  }
}

export async function readSettings(): Promise<AppSettings> {
  if (cache) return cache;

  if (isRemoteStorageConfigured()) {
    const remote = await storageGetJson<unknown>(STORAGE_KEYS.settings);
    if (remote != null) {
      const parsed = appSettingsSchema.parse(remote);
      cache = parsed;
      return parsed;
    }
    const defaults = defaultSettings();
    cache = defaults;
    return defaults;
  }

  const fromFs = await readSettingsFromFs();
  if (fromFs) {
    cache = fromFs;
    return fromFs;
  }
  const defaults = defaultSettings();
  cache = defaults;
  return defaults;
}

export async function writeSettings(
  next: AppSettings,
  emit = true,
): Promise<AppSettings> {
  const validated = appSettingsSchema.parse(next);
  cache = validated;

  writeChain = writeChain.then(async () => {
    if (isRemoteStorageConfigured()) {
      try {
        await storageSetJson(STORAGE_KEYS.settings, validated);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[settings] redis persist failed: ${msg}`);
      }
      return;
    }
    await writeSettingsToFs(validated);
  });
  await writeChain;

  if (emit) {
    bus.emit("settings", validated);
  }
  return validated;
}

export async function patchGlobal(
  patch: Partial<AppSettings["global"]>,
): Promise<AppSettings> {
  const current = await readSettings();
  return writeSettings({
    ...current,
    global: { ...current.global, ...patch },
  });
}

export async function patchScene<K extends SceneId>(
  scene: K,
  patch: Partial<SceneSettingsMap[K]>,
): Promise<AppSettings> {
  const current = await readSettings();
  return writeSettings({
    ...current,
    scenes: {
      ...current.scenes,
      [scene]: { ...current.scenes[scene], ...patch },
    },
  });
}

export function invalidateSettingsCache() {
  cache = null;
}
