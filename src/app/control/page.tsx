"use client";

import { useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Field, Section, TextInput, Toggle } from "@/components/admin/Form";
import { useLiveFeed, formatUptime, useUptimeSeconds } from "@/lib/hooks/useLiveFeed";
import type { LiveData, QuotaState } from "@/lib/sse/bus";

type SessionResponse = {
  ok: boolean;
  live: LiveData;
  sessionActive: boolean;
  error?: string;
  youtube?: {
    configured: boolean;
    connected: boolean;
    expiryDate: number | null;
    redirectUri: string;
  };
  quota?: QuotaState;
};

export default function ControlPage() {
  const { data, ready, patchSettings, connected, setLivePatch } = useLiveFeed();
  const [minutes, setMinutes] = useState("5");
  const [busy, setBusy] = useState(false);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const startCountdown = async () => {
    setBusy(true);
    try {
      const ms = (Number(minutes) || 5) * 60 * 1000;
      const target = new Date(Date.now() + ms).toISOString();
      await patchSettings({
        scene: "starting-soon",
        patch: { countdownTarget: target, showCountdown: true },
      });
    } finally {
      setBusy(false);
    }
  };

  const clearCountdown = async () => {
    setBusy(true);
    try {
      await patchSettings({
        scene: "starting-soon",
        patch: { countdownTarget: null },
      });
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (
    scene: "live" | "brb" | "just-chatting" | "starting-soon" | "ending",
    key: string,
    value: boolean,
  ) => {
    await patchSettings({ scene, patch: { [key]: value } });
  };

  const callSession = async (path: "start" | "end" | "refresh") => {
    setSessionBusy(true);
    setSessionError(null);
    try {
      const res = await fetch(`/api/youtube/session/${path}`, {
        method: "POST",
      });
      const body = (await res.json()) as SessionResponse;
      if (body.live) setLivePatch(body.live, body.youtube, body.quota);
      if (!body.ok) {
        setSessionError(body.error ?? "Request failed");
      }
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSessionBusy(false);
    }
  };

  const uptimeSeconds = useUptimeSeconds(
    data.live.uptimeStartedAt,
    data.live.uptimeSeconds,
  );

  if (!ready) {
    return (
      <div className="admin-shell">
        <AdminNav current="control" />
        <div style={{ padding: 40 }}>Connecting…</div>
      </div>
    );
  }

  const { live, quota, youtube, settings } = data;
  const sessionActive = live.sessionActive;

  return (
    <div className="admin-shell">
      <AdminNav current="control" />
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 12,
              letterSpacing: "0.24em",
              color: "#E8192C",
            }}
          >
            CONTROL
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0" }}>
            Mid-stream panel
          </h1>
          <p style={{ color: "#8A8A93", marginTop: 6 }}>
            SSE {connected ? "live" : "reconnecting"} ·{" "}
            {youtube.connected ? "YT connected" : "YT offline"} ·{" "}
            {sessionActive
              ? `SESSION · ${live.viewers} viewers`
              : "idle"}
            {sessionActive
              ? ` · uptime ${formatUptime(uptimeSeconds)}`
              : ""}
          </p>
        </div>

        <Section title="Stream session">
          <p style={{ color: "#8A8A93", fontSize: 13, margin: 0 }}>
            Go live on YouTube first, then click <strong>I&apos;m live</strong>{" "}
            once. That loads your broadcast (chat ID, title, start time) and
            starts viewer / chat / subscriber polling. Nothing hits YouTube
            until you do.
          </p>
          {!youtube.connected && (
            <p style={{ color: "#FF3B3B", fontSize: 13, margin: 0 }}>
              Connect YouTube under Global settings before starting a session.
            </p>
          )}
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 14,
              color: sessionActive ? "#8B5CF6" : "#8A8A93",
            }}
          >
            {sessionActive
              ? `LIVE${live.streamTitle ? ` · ${live.streamTitle}` : ""} · ${live.viewers} viewers · ${formatUptime(uptimeSeconds)}`
              : "IDLE · no YouTube polls"}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!sessionActive ? (
              <button
                className="admin-btn"
                disabled={sessionBusy || !youtube.connected}
                onClick={() => void callSession("start")}
              >
                {sessionBusy ? "Starting…" : "I'm live"}
              </button>
            ) : (
              <>
                <button
                  className="admin-btn secondary"
                  disabled={sessionBusy}
                  onClick={() => void callSession("refresh")}
                >
                  {sessionBusy ? "Working…" : "Refresh broadcast"}
                </button>
                <button
                  className="admin-btn"
                  disabled={sessionBusy}
                  onClick={() => void callSession("end")}
                >
                  End session
                </button>
              </>
            )}
          </div>
          {(sessionError || live.error) && (
            <div style={{ color: "#FF3B3B", fontSize: 13 }}>
              {sessionError ?? live.error}
            </div>
          )}
        </Section>

        <Section title="Countdown">
          <Field label="Minutes from now">
            <TextInput value={minutes} onChange={setMinutes} />
          </Field>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="admin-btn"
              disabled={busy}
              onClick={startCountdown}
            >
              Start countdown
            </button>
            <button
              className="admin-btn secondary"
              disabled={busy}
              onClick={clearCountdown}
            >
              Clear target
            </button>
          </div>
        </Section>

        <Section title="Quick toggles">
          <Toggle
            label="Starting Soon · countdown card"
            checked={settings.scenes["starting-soon"].showCountdown}
            onChange={(v) => toggle("starting-soon", "showCountdown", v)}
          />
          <Toggle
            label="Live · stats rail"
            checked={settings.scenes.live.showStatsRail}
            onChange={(v) => toggle("live", "showStatsRail", v)}
          />
          <Toggle
            label="Live · facecam"
            checked={settings.scenes.live.showFacecam}
            onChange={(v) => toggle("live", "showFacecam", v)}
          />
          <Toggle
            label="Just Chatting · chat panel"
            checked={settings.scenes["just-chatting"].showChatPanel}
            onChange={(v) => toggle("just-chatting", "showChatPanel", v)}
          />
          <Toggle
            label="Just Chatting · viewer count"
            checked={settings.scenes["just-chatting"].showViewerCount}
            onChange={(v) => toggle("just-chatting", "showViewerCount", v)}
          />
          <Toggle
            label="BRB · pulse ring"
            checked={settings.scenes.brb.showPulseRing}
            onChange={(v) => toggle("brb", "showPulseRing", v)}
          />
        </Section>

        <Section title="Quota">
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {quota.usedToday}
            <span style={{ color: "#8A8A93", fontSize: 16 }}>
              {" "}
              / {quota.dailyLimit}
            </span>
          </div>
          <div style={{ color: "#8A8A93", fontSize: 13 }}>
            Burn ≈ {quota.estimatedHourlyBurn}/hr
            {quota.hoursRemaining != null
              ? ` · ~${quota.hoursRemaining}h left`
              : ""}
          </div>
        </Section>
      </main>
    </div>
  );
}
