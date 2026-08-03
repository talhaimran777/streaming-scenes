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

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");

let writeChain: Promise<void> = Promise.resolve();
let cache: AppSettings | null = null;

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readSettings(): Promise<AppSettings> {
  if (cache) return cache;
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf8");
    const parsed = appSettingsSchema.parse(JSON.parse(raw));
    cache = parsed;
    return parsed;
  } catch {
    const defaults = defaultSettings();
    cache = defaults;
    await writeSettings(defaults, false);
    return defaults;
  }
}

export async function writeSettings(
  next: AppSettings,
  emit = true,
): Promise<AppSettings> {
  const validated = appSettingsSchema.parse(next);
  writeChain = writeChain.then(async () => {
    await ensureDataDir();
    const tmp = `${SETTINGS_PATH}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(validated, null, 2), "utf8");
    await fs.rename(tmp, SETTINGS_PATH);
  });
  await writeChain;
  cache = validated;
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
