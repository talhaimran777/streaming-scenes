import {
  bus,
  defaultLiveData,
  type LiveBroadcastInfo,
  type LiveData,
  type LiveChatMessage,
} from "../sse/bus";
import { readSettings } from "../settings/store";
import {
  STORAGE_KEYS,
  storageAcquireLease,
  storageDel,
  storageGetJson,
  storageRenewLease,
  storageSetJson,
} from "../storage/redis";
import { getYouTubeStatus } from "./oauth";
import {
  fetchChatMessages,
  fetchLatestSubscriber,
  fetchViewerCounts,
  listActiveBroadcasts,
} from "./client";
import { getQuota } from "./quota";

const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const VERIFY_FRESH_MS = 5 * 60 * 1000;
const OWNER_LEASE_TTL_S = 90;

type StoredLiveSession = {
  broadcasts: LiveBroadcastInfo[];
  uptimeStartedAt: string | null;
  streamTitle: string | null;
  viewers: number;
  latestSubscriber: string | null;
  startedAt: string;
  lastVerifiedAt: string;
  updatedAt: string;
};

type PollerState = {
  sessionActive: boolean;
  /** True when this process owns the YouTube poll loops. */
  ownsPolling: boolean;
  clientCount: number;
  live: LiveData;
  chatPageToken: string | null;
  sessionStartedAt: string | null;
  lastVerifiedAt: string | null;
  ownerId: string;
  timers: {
    viewers?: NodeJS.Timeout;
    chat?: NodeJS.Timeout;
    subs?: NodeJS.Timeout;
  };
  chatPollingFloorMs: number;
};

export type SessionResult = {
  ok: boolean;
  live: LiveData;
  sessionActive: boolean;
  error?: string;
};

const globalForPoller = globalThis as unknown as {
  __teyePoller?: PollerState;
  __teyeRestoreInflight?: Promise<void> | null;
};

function newOwnerId() {
  return `owner-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function state(): PollerState {
  if (!globalForPoller.__teyePoller) {
    globalForPoller.__teyePoller = {
      sessionActive: false,
      ownsPolling: false,
      clientCount: 0,
      live: defaultLiveData(),
      chatPageToken: null,
      sessionStartedAt: null,
      lastVerifiedAt: null,
      ownerId: newOwnerId(),
      chatPollingFloorMs: 15000,
      timers: {},
    };
  }
  const s = globalForPoller.__teyePoller;
  // Hot-reload may leave a pre-session poller shape in globalThis.
  if (typeof s.sessionActive !== "boolean") s.sessionActive = false;
  if (typeof s.ownsPolling !== "boolean") s.ownsPolling = false;
  if (typeof s.live.sessionActive !== "boolean") s.live.sessionActive = false;
  if (!s.ownerId) s.ownerId = newOwnerId();
  if (s.sessionStartedAt === undefined) s.sessionStartedAt = null;
  if (s.lastVerifiedAt === undefined) s.lastVerifiedAt = null;
  return s;
}

function emitLive() {
  const s = state();
  s.live.sessionActive = s.sessionActive;
  s.live.updatedAt = new Date().toISOString();
  if (s.live.uptimeStartedAt) {
    s.live.uptimeSeconds = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(s.live.uptimeStartedAt).getTime()) / 1000,
      ),
    );
  }
  bus.emit("live", { ...s.live, chat: [...s.live.chat] });
}

function computeViewers(
  mode: string,
  broadcasts: LiveData["broadcasts"],
): number {
  if (broadcasts.length === 0) return 0;
  if (mode === "sum") {
    return broadcasts.reduce((sum, b) => sum + b.concurrentViewers, 0);
  }
  if (mode === "horizontal") {
    const h = broadcasts.find((b) => b.orientationHint === "horizontal");
    return (h ?? broadcasts[0]).concurrentViewers;
  }
  if (mode === "vertical") {
    const v = broadcasts.find((b) => b.orientationHint === "vertical");
    return (v ?? broadcasts[0]).concurrentViewers;
  }
  return [...broadcasts].sort((a, b) => b.concurrentViewers - a.concurrentViewers)[0]
    .concurrentViewers;
}

function pickChatId(broadcasts: LiveData["broadcasts"]): string | null {
  const withChat = broadcasts.find((b) => b.liveChatId);
  return withChat?.liveChatId ?? null;
}

function pickStartTime(broadcasts: LiveData["broadcasts"]): string | null {
  const times = broadcasts
    .map((b) => b.actualStartTime)
    .filter((t): t is string => Boolean(t))
    .map((t) => new Date(t).getTime());
  if (times.length === 0) return null;
  return new Date(Math.min(...times)).toISOString();
}

function buildStoredSession(now = new Date().toISOString()): StoredLiveSession {
  const s = state();
  return {
    broadcasts: s.live.broadcasts,
    uptimeStartedAt: s.live.uptimeStartedAt,
    streamTitle: s.live.streamTitle,
    viewers: s.live.viewers,
    latestSubscriber: s.live.latestSubscriber,
    startedAt: s.sessionStartedAt ?? now,
    lastVerifiedAt: s.lastVerifiedAt ?? now,
    updatedAt: now,
  };
}

async function persistSession(opts?: { verified?: boolean }) {
  const s = state();
  if (!s.sessionActive || !s.live.isLive || s.live.broadcasts.length === 0) {
    return;
  }
  const now = new Date().toISOString();
  if (!s.sessionStartedAt) s.sessionStartedAt = now;
  if (opts?.verified) s.lastVerifiedAt = now;
  if (!s.lastVerifiedAt) s.lastVerifiedAt = now;

  const record = buildStoredSession(now);
  try {
    await storageSetJson(STORAGE_KEYS.liveSession, record);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[poller] persist session failed: ${msg}`);
  }
}

async function clearStoredSession() {
  await storageDel(STORAGE_KEYS.liveSession);
  await storageDel(STORAGE_KEYS.liveSessionOwner);
}

function applyStoredToLive(record: StoredLiveSession) {
  const s = state();
  s.live.broadcasts = record.broadcasts;
  s.live.isLive = record.broadcasts.length > 0;
  s.live.uptimeStartedAt = record.uptimeStartedAt;
  s.live.streamTitle = record.streamTitle;
  s.live.viewers = record.viewers;
  s.live.latestSubscriber = record.latestSubscriber;
  s.live.error = null;
  s.sessionStartedAt = record.startedAt;
  s.lastVerifiedAt = record.lastVerifiedAt;
  if (s.live.uptimeStartedAt) {
    s.live.uptimeSeconds = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(s.live.uptimeStartedAt).getTime()) / 1000,
      ),
    );
  }
}

function isStructurallyValid(record: StoredLiveSession): boolean {
  if (!record.broadcasts?.length) return false;
  if (!record.startedAt || Number.isNaN(new Date(record.startedAt).getTime())) {
    return false;
  }
  if (record.uptimeStartedAt) {
    const t = new Date(record.uptimeStartedAt).getTime();
    if (Number.isNaN(t)) return false;
  }
  const age = Date.now() - new Date(record.startedAt).getTime();
  if (age < 0 || age > SESSION_MAX_AGE_MS) return false;
  return true;
}

function isVerificationFresh(record: StoredLiveSession): boolean {
  if (!record.lastVerifiedAt) return false;
  const t = new Date(record.lastVerifiedAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < VERIFY_FRESH_MS;
}

async function tryAcquireOwnerLease(): Promise<boolean> {
  const s = state();
  const won = await storageAcquireLease(
    STORAGE_KEYS.liveSessionOwner,
    s.ownerId,
    OWNER_LEASE_TTL_S,
  );
  if (won) {
    s.ownsPolling = true;
    return true;
  }
  // Already ours? Renew.
  const renewed = await storageRenewLease(
    STORAGE_KEYS.liveSessionOwner,
    s.ownerId,
    OWNER_LEASE_TTL_S,
  );
  s.ownsPolling = renewed;
  return renewed;
}

async function renewOwnerLease() {
  const s = state();
  if (!s.ownsPolling) return;
  const ok = await storageRenewLease(
    STORAGE_KEYS.liveSessionOwner,
    s.ownerId,
    OWNER_LEASE_TTL_S,
  );
  if (!ok) {
    s.ownsPolling = false;
    clearTimers();
  }
}

/** One-shot liveBroadcasts.list — never on a timer. */
async function discover(): Promise<boolean> {
  const s = state();
  try {
    const status = await getYouTubeStatus();
    if (!status.connected) {
      s.live.error = "YouTube not connected";
      s.live.isLive = false;
      emitLive();
      return false;
    }
    const broadcasts = await listActiveBroadcasts();
    s.live.broadcasts = broadcasts;
    s.live.isLive = broadcasts.length > 0;
    s.live.uptimeStartedAt = pickStartTime(broadcasts);
    s.live.streamTitle = broadcasts[0]?.title ?? null;
    if (!s.live.isLive) {
      s.live.viewers = 0;
      s.live.chat = [];
      s.chatPageToken = null;
      s.live.error = "No active broadcast found";
    } else {
      s.live.error = null;
      s.lastVerifiedAt = new Date().toISOString();
    }
    emitLive();
    return s.live.isLive;
  } catch (err) {
    s.live.error = err instanceof Error ? err.message : String(err);
    emitLive();
    return false;
  }
}

async function pollViewers() {
  const s = state();
  if (!s.sessionActive || !s.ownsPolling || !s.live.isLive || s.live.broadcasts.length === 0) {
    return;
  }
  try {
    await renewOwnerLease();
    if (!s.ownsPolling) return;
    const settings = await readSettings();
    const ids = s.live.broadcasts.map((b) => b.id);
    const counts = await fetchViewerCounts(ids);
    s.live.broadcasts = s.live.broadcasts.map((b) => ({
      ...b,
      concurrentViewers: counts[b.id] ?? b.concurrentViewers,
    }));
    s.live.viewers = computeViewers(
      settings.global.viewerMode,
      s.live.broadcasts,
    );
    s.live.error = null;
    emitLive();
    await persistSession();
  } catch (err) {
    s.live.error = err instanceof Error ? err.message : String(err);
    emitLive();
  }
}

async function pollChat() {
  const s = state();
  const chatId = pickChatId(s.live.broadcasts);
  if (!s.sessionActive || !s.ownsPolling || !s.live.isLive || !chatId) return;
  try {
    const settings = await readSettings();
    const result = await fetchChatMessages(chatId, s.chatPageToken);
    s.chatPageToken = result.nextPageToken;
    s.chatPollingFloorMs = Math.max(result.pollingIntervalMillis, 5000);

    let messages = result.messages;
    if (settings.scenes["just-chatting"].hideCommandMessages) {
      messages = messages.filter((m) => !m.message.trim().startsWith("!"));
    }
    if (settings.scenes["just-chatting"].hideBotMessages) {
      messages = messages.filter(
        (m) =>
          !/bot$/i.test(m.author) &&
          !m.author.toLowerCase().includes("nightbot"),
      );
    }

    const merged = new Map<string, LiveChatMessage>();
    for (const m of [...s.live.chat, ...messages]) {
      merged.set(m.id, m);
    }
    const max = settings.scenes["just-chatting"].maxMessages;
    s.live.chat = [...merged.values()]
      .sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      )
      .slice(-Math.max(max, 20));
    s.live.error = null;
    emitLive();

    if (!s.sessionActive || !s.ownsPolling) return;
    if (s.timers.chat) clearTimeout(s.timers.chat);
    const interval = Math.max(
      settings.global.chatPollIntervalMs,
      s.chatPollingFloorMs,
    );
    s.timers.chat = setTimeout(() => {
      void pollChat();
    }, interval);
  } catch (err) {
    s.live.error = err instanceof Error ? err.message : String(err);
    emitLive();
    if (!s.sessionActive || !s.ownsPolling) return;
    const settings = await readSettings();
    if (s.timers.chat) clearTimeout(s.timers.chat);
    s.timers.chat = setTimeout(() => {
      void pollChat();
    }, settings.global.chatPollIntervalMs);
  }
}

async function pollSubs() {
  const s = state();
  if (!s.sessionActive || !s.ownsPolling) return;
  try {
    const status = await getYouTubeStatus();
    if (!status.connected) return;
    const name = await fetchLatestSubscriber();
    if (name) s.live.latestSubscriber = name;
    emitLive();
    await persistSession();
  } catch (err) {
    s.live.error = err instanceof Error ? err.message : String(err);
    emitLive();
  }
}

function clearTimers() {
  const s = state();
  for (const key of Object.keys(s.timers) as (keyof typeof s.timers)[]) {
    const t = s.timers[key];
    if (t) clearTimeout(t);
    if (t) clearInterval(t as NodeJS.Timeout);
    s.timers[key] = undefined;
  }
}

async function scheduleIntervalLoops() {
  const s = state();
  if (!s.sessionActive || !s.ownsPolling) return;
  const settings = await readSettings();

  if (s.timers.viewers) clearInterval(s.timers.viewers);
  if (s.timers.subs) clearInterval(s.timers.subs);

  s.timers.viewers = setInterval(() => {
    void pollViewers();
  }, settings.global.viewersPollIntervalMs);

  s.timers.subs = setInterval(() => {
    void pollSubs();
  }, settings.global.subscribersPollIntervalMs);
}

async function resumeSessionLoops() {
  const s = state();
  if (!s.sessionActive || !s.ownsPolling) return;
  await pollViewers();
  void pollChat();
  void pollSubs();
  await scheduleIntervalLoops();
  const quota = await getQuota();
  bus.emit("quota", quota);
}

function ensureSettingsWatcher() {
  const g = globalForPoller as typeof globalForPoller & {
    __teyeSettingsWatch?: boolean;
  };
  if (g.__teyeSettingsWatch) return;
  g.__teyeSettingsWatch = true;
  bus.on("settings", () => {
    const s = state();
    if (!s.sessionActive || !s.ownsPolling || s.clientCount === 0) return;
    void scheduleIntervalLoops();
  });
}

async function restoreLiveSession(): Promise<void> {
  const s = state();
  if (s.sessionActive) return;

  const record = await storageGetJson<StoredLiveSession>(
    STORAGE_KEYS.liveSession,
  );
  if (!record) return;

  if (!isStructurallyValid(record)) {
    await clearStoredSession();
    return;
  }

  if (isVerificationFresh(record)) {
    applyStoredToLive(record);
    s.sessionActive = true;
    const owns = await tryAcquireOwnerLease();
    if (owns) {
      await resumeSessionLoops();
    }
    emitLive();
    return;
  }

  // Revalidate against YouTube.
  try {
    const status = await getYouTubeStatus();
    if (!status.connected) {
      await clearStoredSession();
      return;
    }
    const active = await listActiveBroadcasts();
    const storedIds = new Set(record.broadcasts.map((b) => b.id));
    const stillLive = active.filter((b) => storedIds.has(b.id));
    if (stillLive.length === 0) {
      await clearStoredSession();
      return;
    }

    const now = new Date().toISOString();
    applyStoredToLive({
      ...record,
      broadcasts: stillLive.map((b) => {
        const prev = record.broadcasts.find((x) => x.id === b.id);
        return {
          ...b,
          concurrentViewers: prev?.concurrentViewers ?? b.concurrentViewers,
        };
      }),
      uptimeStartedAt: pickStartTime(stillLive) ?? record.uptimeStartedAt,
      streamTitle: stillLive[0]?.title ?? record.streamTitle,
      lastVerifiedAt: now,
      updatedAt: now,
    });
    s.sessionActive = true;
    s.lastVerifiedAt = now;
    await persistSession({ verified: true });
    const owns = await tryAcquireOwnerLease();
    if (owns) {
      await resumeSessionLoops();
    }
    emitLive();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[poller] restore revalidation failed: ${msg}`);
    // Keep the cached session for display if verification failed transiently
    // and it is not past the hard age ceiling (already checked).
    applyStoredToLive(record);
    s.sessionActive = true;
    emitLive();
  }
}

async function ensureRestored(): Promise<void> {
  const s = state();
  if (s.sessionActive) return;
  if (!globalForPoller.__teyeRestoreInflight) {
    globalForPoller.__teyeRestoreInflight = restoreLiveSession().finally(() => {
      globalForPoller.__teyeRestoreInflight = null;
    });
  }
  await globalForPoller.__teyeRestoreInflight;
}

export async function startLiveSession(): Promise<SessionResult> {
  const s = state();
  const status = await getYouTubeStatus();
  if (!status.connected) {
    s.live.error = "YouTube not connected";
    emitLive();
    return {
      ok: false,
      live: getLiveSnapshot(),
      sessionActive: false,
      error: s.live.error,
    };
  }

  const found = await discover();
  if (!found) {
    s.sessionActive = false;
    s.ownsPolling = false;
    emitLive();
    return {
      ok: false,
      live: getLiveSnapshot(),
      sessionActive: false,
      error: s.live.error ?? "No active broadcast found",
    };
  }

  const now = new Date().toISOString();
  s.sessionActive = true;
  s.sessionStartedAt = now;
  s.lastVerifiedAt = now;
  await persistSession({ verified: true });
  const owns = await tryAcquireOwnerLease();
  emitLive();
  if (owns) {
    await resumeSessionLoops();
  }
  return { ok: true, live: getLiveSnapshot(), sessionActive: true };
}

export async function endLiveSession(): Promise<SessionResult> {
  const s = state();
  clearTimers();
  s.sessionActive = false;
  s.ownsPolling = false;
  s.chatPageToken = null;
  s.sessionStartedAt = null;
  s.lastVerifiedAt = null;
  s.live = defaultLiveData();
  s.live.sessionActive = false;
  await clearStoredSession();
  emitLive();
  return { ok: true, live: getLiveSnapshot(), sessionActive: false };
}

export async function refreshBroadcast(): Promise<SessionResult> {
  const s = state();
  if (!s.sessionActive) {
    return {
      ok: false,
      live: getLiveSnapshot(),
      sessionActive: false,
      error: "No active session. Click I'm live first.",
    };
  }
  const found = await discover();
  if (!found) {
    return {
      ok: false,
      live: getLiveSnapshot(),
      sessionActive: true,
      error: s.live.error ?? "No active broadcast found",
    };
  }
  s.lastVerifiedAt = new Date().toISOString();
  await persistSession({ verified: true });
  if (s.ownsPolling) {
    await pollViewers();
  }
  return { ok: true, live: getLiveSnapshot(), sessionActive: true };
}

export async function addLiveClient(): Promise<LiveData> {
  ensureSettingsWatcher();
  await ensureRestored();
  const s = state();
  s.clientCount += 1;
  bus.emit("clients", { count: s.clientCount });
  // Connecting must not start YouTube work unless we own the poll lease.
  if (s.clientCount === 1 && s.sessionActive && s.ownsPolling) {
    void resumeSessionLoops();
  } else if (s.clientCount === 1 && s.sessionActive && !s.ownsPolling) {
    // Try to take over if the previous owner died.
    const owns = await tryAcquireOwnerLease();
    if (owns) {
      void resumeSessionLoops();
    }
  }
  return getLiveSnapshot();
}

export function removeLiveClient() {
  const s = state();
  s.clientCount = Math.max(0, s.clientCount - 1);
  bus.emit("clients", { count: s.clientCount });
  if (s.clientCount === 0) {
    // Pause API polls; keep sessionActive so reconnect can resume.
    clearTimers();
  }
}

export function getLiveSnapshot(): LiveData {
  const s = state();
  return {
    ...s.live,
    sessionActive: s.sessionActive,
    chat: [...s.live.chat],
  };
}

export function isSessionActive() {
  return state().sessionActive;
}

export function getClientCount() {
  return state().clientCount;
}

/** Hook for future liveChatMessages.streamList low-latency transport */
export function streamListReady(): boolean {
  return false;
}
