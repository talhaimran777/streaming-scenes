"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  Field,
  SaveBar,
  Section,
  TextArea,
  TextInput,
} from "@/components/admin/Form";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import type { GlobalSettings } from "@/lib/settings/schema";

function parseInterval(
  raw: string,
  label: string,
  min: number,
  max: number,
): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: `${label} must be a whole number (ms).` };
  }
  const value = Number(trimmed);
  if (value < min || value > max) {
    return {
      ok: false,
      error: `${label} must be between ${min} and ${max} ms.`,
    };
  }
  return { ok: true, value };
}

export default function GlobalSettingsPage() {
  const { data, ready, patchSettings } = useLiveFeed();
  const [draft, setDraft] = useState<GlobalSettings | null>(null);
  const [chatInterval, setChatInterval] = useState("");
  const [viewersInterval, setViewersInterval] = useState("");
  const [subsInterval, setSubsInterval] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const search = useSearchParams();
  const yt = search.get("yt");

  useEffect(() => {
    if (!ready || dirty) return;
    const global = data.settings.global;
    setDraft(structuredClone(global));
    setChatInterval(String(global.chatPollIntervalMs));
    setViewersInterval(String(global.viewersPollIntervalMs));
    setSubsInterval(String(global.subscribersPollIntervalMs));
  }, [ready, dirty, data.settings.global]);

  const update = <K extends keyof GlobalSettings>(
    key: K,
    value: GlobalSettings[K],
  ) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
    setSaved(false);
    setError(null);
  };

  const onIntervalChange = (
    setter: (v: string) => void,
    value: string,
  ) => {
    if (value === "" || /^\d+$/.test(value)) {
      setter(value);
      setDirty(true);
      setSaved(false);
      setError(null);
    }
  };

  const onSave = async () => {
    if (!draft) return;

    const chat = parseInterval(chatInterval, "Chat poll interval", 5000, 60000);
    if (!chat.ok) {
      setError(chat.error);
      return;
    }
    const viewers = parseInterval(
      viewersInterval,
      "Viewers poll interval",
      5000,
      60000,
    );
    if (!viewers.ok) {
      setError(viewers.error);
      return;
    }
    const subs = parseInterval(
      subsInterval,
      "Subscribers poll interval",
      15000,
      300000,
    );
    if (!subs.ok) {
      setError(subs.error);
      return;
    }

    const next: GlobalSettings = {
      ...draft,
      chatPollIntervalMs: chat.value,
      viewersPollIntervalMs: viewers.value,
      subscribersPollIntervalMs: subs.value,
    };

    setSaving(true);
    setError(null);
    try {
      await patchSettings({ global: next });
      setDraft(next);
      setChatInterval(String(next.chatPollIntervalMs));
      setViewersInterval(String(next.viewersPollIntervalMs));
      setSubsInterval(String(next.subscribersPollIntervalMs));
      setDirty(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    await fetch("/api/youtube/status", { method: "DELETE" });
  };

  return (
    <div className="admin-shell">
      <AdminNav current="global" />
      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: 24,
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
            GLOBAL
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 0" }}>
            Brand & YouTube
          </h1>
        </div>

        {yt === "connected" && (
          <div className="admin-card" style={{ padding: 14, color: "#8B5CF6" }}>
            YouTube connected successfully.
          </div>
        )}
        {yt === "error" && (
          <div className="admin-card" style={{ padding: 14, color: "#FF3B3B" }}>
            YouTube auth error: {search.get("msg")}
          </div>
        )}

        <Section title="YouTube connection">
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 13,
                color: data.youtube.connected ? "#8B5CF6" : "#8A8A93",
              }}
            >
              {data.youtube.connected
                ? "CONNECTED"
                : data.youtube.configured
                  ? "NOT CONNECTED"
                  : "CREDENTIALS MISSING"}
            </div>
            {data.youtube.configured && !data.youtube.connected && (
              <a className="admin-btn" href="/api/youtube/auth">
                Connect YouTube
              </a>
            )}
            {data.youtube.connected && (
              <button className="admin-btn secondary" onClick={disconnect}>
                Disconnect
              </button>
            )}
          </div>
          <p style={{ color: "#4E4E58", fontSize: 13, margin: 0 }}>
            Copy <code>.env.example</code> to <code>.env.local</code>, fill in your
            Google OAuth client ID/secret, and add redirect URI{" "}
            <code>{data.youtube.redirectUri}</code>.
          </p>
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 12,
              color: "#B4B4BC",
            }}
          >
            Quota {data.quota.usedToday} / {data.quota.dailyLimit}
            {data.quota.hoursRemaining != null
              ? ` · ~${data.quota.hoursRemaining}h remaining at current burn`
              : ""}
            {` · chat every ${Math.round(data.quota.chatIntervalMs / 1000)}s`}
          </div>
        </Section>

        {!draft || !ready ? (
          <div style={{ color: "#8A8A93" }}>Loading…</div>
        ) : (
          <>
            <Section title="Brand">
              <Field label="Brand name">
                <TextInput
                  value={draft.brand}
                  onChange={(v) => update("brand", v)}
                />
              </Field>
              <Field label="Handle">
                <TextInput
                  value={draft.handle}
                  onChange={(v) => update("handle", v)}
                />
              </Field>
              <Field label="Game mode">
                <select
                  className="admin-select"
                  value={draft.gameMode}
                  onChange={(e) =>
                    update(
                      "gameMode",
                      e.target.value as GlobalSettings["gameMode"],
                    )
                  }
                >
                  <option value="CS2">CS2</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </Field>
              <Field label="Game label (CS2)">
                <TextInput
                  value={draft.gameLabelCs2}
                  onChange={(v) => update("gameLabelCs2", v)}
                />
              </Field>
              <Field label="Game label (Neutral)">
                <TextInput
                  value={draft.gameLabelNeutral}
                  onChange={(v) => update("gameLabelNeutral", v)}
                />
              </Field>
              <Field label="Stream title (CS2)">
                <TextInput
                  value={draft.streamTitleCs2}
                  onChange={(v) => update("streamTitleCs2", v)}
                />
              </Field>
              <Field label="Stream title (Neutral)">
                <TextInput
                  value={draft.streamTitleNeutral}
                  onChange={(v) => update("streamTitleNeutral", v)}
                />
              </Field>
              <Field label="Socials (LABEL|value per line)">
                <TextArea
                  rows={5}
                  value={draft.socials
                    .map((s) => `${s.label}|${s.value}`)
                    .join("\n")}
                  onChange={(v) =>
                    update(
                      "socials",
                      v
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                          const [label, ...rest] = line.split("|");
                          return {
                            label: label.trim(),
                            value: rest.join("|").trim() || label.trim(),
                          };
                        }),
                    )
                  }
                />
              </Field>
            </Section>

            <Section title="Live data">
              <Field label="Viewer mode (multi-broadcast)">
                <select
                  className="admin-select"
                  value={draft.viewerMode}
                  onChange={(e) =>
                    update(
                      "viewerMode",
                      e.target.value as GlobalSettings["viewerMode"],
                    )
                  }
                >
                  <option value="sum">Sum all active broadcasts</option>
                  <option value="primary">Highest viewers</option>
                  <option value="horizontal">Prefer horizontal</option>
                  <option value="vertical">Prefer vertical</option>
                </select>
              </Field>
              <Field
                label="Chat poll interval (ms)"
                hint="5000–60000. Floor is also set by YouTube."
              >
                <TextInput
                  value={chatInterval}
                  onChange={(v) => onIntervalChange(setChatInterval, v)}
                />
              </Field>
              <Field
                label="Viewers poll interval (ms)"
                hint="5000–60000"
              >
                <TextInput
                  value={viewersInterval}
                  onChange={(v) => onIntervalChange(setViewersInterval, v)}
                />
              </Field>
              <Field
                label="Subscribers poll interval (ms)"
                hint="15000–300000"
              >
                <TextInput
                  value={subsInterval}
                  onChange={(v) => onIntervalChange(setSubsInterval, v)}
                />
              </Field>
            </Section>

            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={onSave}
            />
          </>
        )}
      </main>
    </div>
  );
}
