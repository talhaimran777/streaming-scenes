import { promises as fs } from "fs";
import path from "path";
import {
  bus,
  defaultQuotaState,
  type QuotaState,
} from "../sse/bus";

const DATA_DIR = path.join(process.cwd(), "data");
const QUOTA_PATH = path.join(DATA_DIR, "quota.json");

const COSTS = {
  liveBroadcastsList: 1,
  videosList: 1,
  liveChatMessagesList: 5,
  subscriptionsList: 1,
} as const;

export type QuotaOp = keyof typeof COSTS;

const globalForQuota = globalThis as unknown as {
  __teyeQuota?: QuotaState;
  __teyeQuotaHistory?: number[];
};

function todayKey() {
  // YouTube quota resets at midnight Pacific Time
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

async function load(): Promise<QuotaState> {
  if (globalForQuota.__teyeQuota) {
    const state = globalForQuota.__teyeQuota;
    if (state.lastResetDay !== todayKey()) {
      state.usedToday = 0;
      state.lastResetDay = todayKey();
      globalForQuota.__teyeQuotaHistory = [];
    }
    return state;
  }
  try {
    const raw = await fs.readFile(QUOTA_PATH, "utf8");
    const parsed = { ...defaultQuotaState(), ...JSON.parse(raw) } as QuotaState;
    if (parsed.lastResetDay !== todayKey()) {
      parsed.usedToday = 0;
      parsed.lastResetDay = todayKey();
    }
    globalForQuota.__teyeQuota = parsed;
    return parsed;
  } catch {
    const fresh = defaultQuotaState();
    fresh.lastResetDay = todayKey();
    globalForQuota.__teyeQuota = fresh;
    return fresh;
  }
}

async function persist(state: QuotaState) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${QUOTA_PATH}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
    await fs.rename(tmp, QUOTA_PATH);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[quota] persist failed (read-only or missing FS): ${msg}`);
  }
}

function recompute(state: QuotaState) {
  const history = globalForQuota.__teyeQuotaHistory ?? [];
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const recent = history.filter((t) => now - t < windowMs);
  globalForQuota.__teyeQuotaHistory = recent;
  const unitsInWindow = recent.length
    ? // approximate: we store timestamps per unit via pushCost
      recent.length
    : 0;
  const hourly =
    unitsInWindow > 0 ? (unitsInWindow / (windowMs / 1000)) * 3600 : state.estimatedHourlyBurn;
  state.estimatedHourlyBurn = Math.round(hourly);
  const remaining = Math.max(0, state.dailyLimit - state.usedToday);
  state.hoursRemaining =
    state.estimatedHourlyBurn > 0
      ? Math.round((remaining / state.estimatedHourlyBurn) * 10) / 10
      : null;
}

export async function getQuota(): Promise<QuotaState> {
  const state = await load();
  recompute(state);
  return { ...state };
}

export async function recordQuota(op: QuotaOp, chatIntervalMs?: number) {
  const state = await load();
  const cost = COSTS[op];
  state.usedToday += cost;
  if (chatIntervalMs) state.chatIntervalMs = chatIntervalMs;
  if (!globalForQuota.__teyeQuotaHistory) {
    globalForQuota.__teyeQuotaHistory = [];
  }
  for (let i = 0; i < cost; i++) {
    globalForQuota.__teyeQuotaHistory.push(Date.now());
  }
  recompute(state);
  globalForQuota.__teyeQuota = state;
  await persist(state);
  bus.emit("quota", { ...state });
  return state;
}

export { COSTS };
