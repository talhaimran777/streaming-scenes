import {
  bus,
  defaultLiveData,
  type LiveData,
  type LiveChatMessage,
} from "../sse/bus";
import { readSettings } from "../settings/store";
import { getYouTubeStatus } from "./oauth";
import {
  fetchChatMessages,
  fetchLatestSubscriber,
  fetchViewerCounts,
  listActiveBroadcasts,
} from "./client";
import { getQuota } from "./quota";

type PollerState = {
  sessionActive: boolean;
  clientCount: number;
  live: LiveData;
  chatPageToken: string | null;
  timers: {
    viewers?: NodeJS.Timeout;
    chat?: NodeJS.Timeout;
    subs?: NodeJS.Timeout;
    uptime?: NodeJS.Timeout;
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
};

function state(): PollerState {
  if (!globalForPoller.__teyePoller) {
    globalForPoller.__teyePoller = {
      sessionActive: false,
      clientCount: 0,
      live: defaultLiveData(),
      chatPageToken: null,
      chatPollingFloorMs: 15000,
      timers: {},
    };
  }
  const s = globalForPoller.__teyePoller;
  // Hot-reload may leave a pre-session poller shape in globalThis.
  if (typeof s.sessionActive !== "boolean") s.sessionActive = false;
  if (typeof s.live.sessionActive !== "boolean") s.live.sessionActive = false;
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
  if (!s.sessionActive || !s.live.isLive || s.live.broadcasts.length === 0) {
    return;
  }
  try {
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
  } catch (err) {
    s.live.error = err instanceof Error ? err.message : String(err);
    emitLive();
  }
}

async function pollChat() {
  const s = state();
  const chatId = pickChatId(s.live.broadcasts);
  if (!s.sessionActive || !s.live.isLive || !chatId) return;
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

    if (!s.sessionActive) return;
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
    if (!s.sessionActive) return;
    const settings = await readSettings();
    if (s.timers.chat) clearTimeout(s.timers.chat);
    s.timers.chat = setTimeout(() => {
      void pollChat();
    }, settings.global.chatPollIntervalMs);
  }
}

async function pollSubs() {
  const s = state();
  if (!s.sessionActive) return;
  try {
    const status = await getYouTubeStatus();
    if (!status.connected) return;
    const name = await fetchLatestSubscriber();
    if (name) s.live.latestSubscriber = name;
    emitLive();
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
  if (!s.sessionActive) return;
  const settings = await readSettings();

  if (s.timers.viewers) clearInterval(s.timers.viewers);
  if (s.timers.subs) clearInterval(s.timers.subs);
  if (s.timers.uptime) clearInterval(s.timers.uptime);

  s.timers.viewers = setInterval(() => {
    void pollViewers();
  }, settings.global.viewersPollIntervalMs);

  s.timers.subs = setInterval(() => {
    void pollSubs();
  }, settings.global.subscribersPollIntervalMs);

  s.timers.uptime = setInterval(() => {
    if (s.live.uptimeStartedAt) emitLive();
  }, 1000);
}

async function resumeSessionLoops() {
  const s = state();
  if (!s.sessionActive) return;
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
    if (!s.sessionActive || s.clientCount === 0) return;
    void scheduleIntervalLoops();
  });
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
    emitLive();
    return {
      ok: false,
      live: getLiveSnapshot(),
      sessionActive: false,
      error: s.live.error ?? "No active broadcast found",
    };
  }

  s.sessionActive = true;
  emitLive();
  await resumeSessionLoops();
  return { ok: true, live: getLiveSnapshot(), sessionActive: true };
}

export async function endLiveSession(): Promise<SessionResult> {
  const s = state();
  clearTimers();
  s.sessionActive = false;
  s.chatPageToken = null;
  s.live = defaultLiveData();
  s.live.sessionActive = false;
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
  await pollViewers();
  return { ok: true, live: getLiveSnapshot(), sessionActive: true };
}

export function addLiveClient() {
  ensureSettingsWatcher();
  const s = state();
  s.clientCount += 1;
  bus.emit("clients", { count: s.clientCount });
  // Connecting must not start YouTube work unless a session is already active.
  if (s.clientCount === 1 && s.sessionActive) {
    void resumeSessionLoops();
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
