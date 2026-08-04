"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppSettings } from "../settings/schema";
import type { LiveData, QuotaState } from "../sse/bus";
import { defaultLiveData, defaultQuotaState } from "../sse/bus";
import { defaultSettings } from "../settings/schema";

export type LiveEnvelope = {
  settings: AppSettings;
  live: LiveData;
  quota: QuotaState;
  youtube: {
    configured: boolean;
    connected: boolean;
    expiryDate: number | null;
    redirectUri: string;
  };
  clients: number;
  storage: "redis" | "filesystem";
};

const defaultEnvelope = (): LiveEnvelope => ({
  settings: defaultSettings(),
  live: defaultLiveData(),
  quota: defaultQuotaState(),
  youtube: {
    configured: false,
    connected: false,
    expiryDate: null,
    redirectUri: "http://localhost:3000/api/youtube/oauth/callback",
  },
  clients: 0,
  storage: "filesystem",
});

export function useLiveFeed() {
  const [data, setData] = useState<LiveEnvelope>(defaultEnvelope);
  const [connected, setConnected] = useState(false);
  const [ready, setReady] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closed) return;
      const es = new EventSource("/api/live");
      esRef.current = es;

      es.addEventListener("snapshot", (ev) => {
        const payload = JSON.parse((ev as MessageEvent).data) as LiveEnvelope;
        setData(payload);
        setConnected(true);
        setReady(true);
      });

      es.addEventListener("settings", (ev) => {
        const settings = JSON.parse((ev as MessageEvent).data) as AppSettings;
        setData((prev) => ({ ...prev, settings }));
      });

      es.addEventListener("live", (ev) => {
        const live = JSON.parse((ev as MessageEvent).data) as LiveData;
        setData((prev) => ({ ...prev, live }));
      });

      es.addEventListener("quota", (ev) => {
        const quota = JSON.parse((ev as MessageEvent).data) as QuotaState;
        setData((prev) => ({ ...prev, quota }));
      });

      es.addEventListener("youtube-status", (ev) => {
        const youtube = JSON.parse((ev as MessageEvent).data) as LiveEnvelope["youtube"];
        setData((prev) => ({ ...prev, youtube }));
      });

      es.addEventListener("clients", (ev) => {
        const payload = JSON.parse((ev as MessageEvent).data) as { count: number };
        setData((prev) => ({ ...prev, clients: payload.count }));
      });

      es.onerror = () => {
        setConnected(false);
        es.close();
        retry = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      esRef.current?.close();
    };
  }, []);

  const patchSettings = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        let message = text || `Save failed (${res.status})`;
        try {
          const json = JSON.parse(text) as { error?: string };
          if (json.error) message = json.error;
        } catch {
          // keep raw text
        }
        throw new Error(message);
      }
      const settings = (await res.json()) as AppSettings;
      setData((prev) => ({ ...prev, settings }));
      return settings;
    },
    [],
  );

  const setLivePatch = useCallback(
    (
      live: LiveData,
      youtube?: LiveEnvelope["youtube"],
      quota?: QuotaState,
    ) => {
      setData((prev) => ({
        ...prev,
        live,
        ...(youtube ? { youtube } : {}),
        ...(quota ? { quota } : {}),
      }));
    },
    [],
  );

  return { data, connected, ready, patchSettings, setLivePatch };
}

export function formatUptime(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function useUptimeSeconds(
  startedAt: string | null,
  fallback: number | null,
): number | null {
  const [anchor, setAnchor] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt) {
      const t = new Date(startedAt).getTime();
      if (!Number.isNaN(t)) {
        setAnchor(t);
        return;
      }
    }
    if (fallback != null && fallback >= 0) {
      setAnchor((prev) => prev ?? Date.now() - fallback * 1000);
      return;
    }
    setAnchor(null);
  }, [startedAt, fallback]);

  useEffect(() => {
    if (anchor == null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [anchor]);

  if (anchor == null) return fallback;
  return Math.max(0, Math.floor((now - anchor) / 1000));
}

export function formatCountdown(targetIso: string | null, fallback: string): string {
  if (!targetIso) return fallback;
  const diff = Math.max(0, Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000));
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
