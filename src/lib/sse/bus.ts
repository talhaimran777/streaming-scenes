type Listener = (payload: unknown) => void;

export type BusEvent =
  | "settings"
  | "live"
  | "quota"
  | "youtube-status"
  | "clients";

class EventBus {
  private listeners = new Map<BusEvent | "*", Set<Listener>>();

  on(event: BusEvent | "*", listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: BusEvent | "*", listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: BusEvent, payload: unknown) {
    for (const listener of this.listeners.get(event) ?? []) {
      try {
        listener(payload);
      } catch (err) {
        console.error(`[bus] listener error on ${event}`, err);
      }
    }
    for (const listener of this.listeners.get("*") ?? []) {
      try {
        listener({ event, payload });
      } catch (err) {
        console.error(`[bus] wildcard listener error`, err);
      }
    }
  }
}

const globalForBus = globalThis as unknown as { __teyeBus?: EventBus };

export const bus = globalForBus.__teyeBus ?? new EventBus();
if (!globalForBus.__teyeBus) {
  globalForBus.__teyeBus = bus;
}

export type LiveChatMessage = {
  id: string;
  author: string;
  message: string;
  publishedAt: string;
  isModerator?: boolean;
  isOwner?: boolean;
  isMember?: boolean;
};

export type LiveBroadcastInfo = {
  id: string;
  title: string;
  liveChatId: string | null;
  actualStartTime: string | null;
  concurrentViewers: number;
  orientationHint: "horizontal" | "vertical" | "unknown";
};

export type LiveData = {
  isLive: boolean;
  /** Manual go-live session; polls only run while this is true. */
  sessionActive: boolean;
  broadcasts: LiveBroadcastInfo[];
  viewers: number;
  uptimeSeconds: number | null;
  uptimeStartedAt: string | null;
  streamTitle: string | null;
  latestSubscriber: string | null;
  chat: LiveChatMessage[];
  updatedAt: string;
  error: string | null;
};

export type QuotaState = {
  usedToday: number;
  dailyLimit: number;
  estimatedHourlyBurn: number;
  hoursRemaining: number | null;
  chatIntervalMs: number;
  lastResetDay: string;
};

export function defaultLiveData(): LiveData {
  return {
    isLive: false,
    sessionActive: false,
    broadcasts: [],
    viewers: 0,
    uptimeSeconds: null,
    uptimeStartedAt: null,
    streamTitle: null,
    latestSubscriber: null,
    chat: [],
    updatedAt: new Date().toISOString(),
    error: null,
  };
}

export function defaultQuotaState(): QuotaState {
  return {
    usedToday: 0,
    dailyLimit: 10000,
    estimatedHourlyBurn: 0,
    hoursRemaining: null,
    chatIntervalMs: 15000,
    lastResetDay: new Date().toISOString().slice(0, 10),
  };
}
