"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  Field,
  SaveBar,
  Section,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/Form";
import { SceneView } from "@/components/SceneView";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import type { SceneId } from "@/lib/scenes";
import { SCENE_META } from "@/lib/scenes";
import type { SceneSettingsMap } from "@/lib/settings/schema";

export function SceneSettingsPage({ scene }: { scene: SceneId }) {
  const { data, ready, patchSettings } = useLiveFeed();
  const [draft, setDraft] = useState<SceneSettingsMap[SceneId] | null>(null);
  const [orientation, setOrientation] = useState<"h" | "v">("h");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDirty(false);
    setSaved(false);
    setError(null);
  }, [scene]);

  useEffect(() => {
    if (!ready || dirty) return;
    setDraft(structuredClone(data.settings.scenes[scene]));
  }, [ready, dirty, data.settings.scenes, scene]);

  const meta = SCENE_META[scene];

  const update = <K extends keyof SceneSettingsMap[SceneId]>(
    key: K,
    value: SceneSettingsMap[SceneId][K],
  ) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
    setSaved(false);
    setError(null);
  };

  const onSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await patchSettings({ scene, patch: draft });
      setDirty(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const fields = useMemo(() => {
    if (!draft) return null;
    return renderFields(scene, draft, update);
  }, [scene, draft]);

  return (
    <div className="admin-shell">
      <AdminNav current={scene} />
      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: 24,
          display: "grid",
          gridTemplateColumns: "minmax(320px, 420px) 1fr",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 12,
                letterSpacing: "0.24em",
                color: "#E8192C",
              }}
            >
              {meta.number} · SETTINGS
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 0" }}>
              {meta.label}
            </h1>
            <p style={{ color: "#8A8A93", marginTop: 8 }}>{meta.description}</p>
          </div>
          {!draft || !ready ? (
            <div style={{ color: "#8A8A93" }}>Loading settings…</div>
          ) : (
            <>
              {fields}
              <SaveBar
                saving={saving}
                saved={saved}
                error={error}
                onSave={onSave}
              />
            </>
          )}
        </div>

        <div className="admin-card" style={{ padding: 16, minHeight: 480 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 12,
                letterSpacing: "0.2em",
                color: "#8A8A93",
              }}
            >
              LIVE PREVIEW
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={`admin-btn secondary`}
                style={{
                  borderColor: orientation === "h" ? "#E8192C" : undefined,
                }}
                onClick={() => setOrientation("h")}
              >
                16:9
              </button>
              <button
                className="admin-btn secondary"
                style={{
                  borderColor: orientation === "v" ? "#E8192C" : undefined,
                }}
                onClick={() => setOrientation("v")}
              >
                9:16
              </button>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              aspectRatio: orientation === "h" ? "16 / 9" : "9 / 16",
              maxHeight: "70vh",
              margin: "0 auto",
              background: "#07070a",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <SceneView
              scene={scene}
              forceOrientation={orientation}
              preview
            />
          </div>
          <p
            style={{
              marginTop: 12,
              fontSize: 12,
              color: "#4E4E58",
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            Preview uses saved settings via SSE. Hit Save to push changes to OBS.
          </p>
        </div>
      </main>
    </div>
  );
}

function renderFields(
  scene: SceneId,
  draft: SceneSettingsMap[SceneId],
  update: (key: never, value: never) => void,
) {
  const u = update as (key: string, value: unknown) => void;
  const d = draft as Record<string, unknown>;

  if (scene === "starting-soon") {
    return (
      <>
        <Section title="Visibility">
          <Toggle label="Scanlines" checked={!!d.showScanlines} onChange={(v) => u("showScanlines", v)} />
          <Toggle label="Grid" checked={!!d.showGrid} onChange={(v) => u("showGrid", v)} />
          <Toggle label="Glow" checked={!!d.showGlow} onChange={(v) => u("showGlow", v)} />
          <Toggle label="Countdown card" checked={!!d.showCountdown} onChange={(v) => u("showCountdown", v)} />
          <Toggle label="Info rows" checked={!!d.showInfoRows} onChange={(v) => u("showInfoRows", v)} />
          <Toggle label="Ticker" checked={!!d.showTicker} onChange={(v) => u("showTicker", v)} />
        </Section>
        <Section title="Copy">
          <Field label="Headline line 1">
            <TextInput value={String(d.headlineLine1)} onChange={(v) => u("headlineLine1", v)} />
          </Field>
          <Field label="Headline line 2">
            <TextInput value={String(d.headlineLine2)} onChange={(v) => u("headlineLine2", v)} />
          </Field>
          <Field label="Tagline">
            <TextArea value={String(d.tagline)} onChange={(v) => u("tagline", v)} />
          </Field>
          <Field label="Tagline (vertical)">
            <TextArea value={String(d.taglineVertical)} onChange={(v) => u("taglineVertical", v)} />
          </Field>
          <Field label="Standby badge">
            <TextInput value={String(d.standbyText)} onChange={(v) => u("standbyText", v)} />
          </Field>
          <Field label="Countdown fallback (MM:SS)">
            <TextInput value={String(d.countdownFallback)} onChange={(v) => u("countdownFallback", v)} />
          </Field>
          <Field label="Countdown target (ISO datetime)" hint="Leave empty to use fallback. Set from Control panel for a live tick.">
            <TextInput
              value={d.countdownTarget ? String(d.countdownTarget) : ""}
              onChange={(v) => u("countdownTarget", v || null)}
              placeholder="2026-08-03T21:00:00.000Z"
            />
          </Field>
          <Field label="Override game label (optional)">
            <TextInput
              value={d.overrideGameLabel ? String(d.overrideGameLabel) : ""}
              onChange={(v) => u("overrideGameLabel", v || null)}
            />
          </Field>
          <Field label="Ticker items (one per line)">
            <TextArea
              value={(d.tickerItems as string[]).join("\n")}
              onChange={(v) =>
                u(
                  "tickerItems",
                  v.split("\n").map((s) => s.trim()).filter(Boolean),
                )
              }
              rows={5}
            />
          </Field>
        </Section>
      </>
    );
  }

  if (scene === "live") {
    return (
      <>
        <Section title="Layout">
          <Toggle label="Transparent background (OBS)" checked={!!d.transparentBackground} onChange={(v) => u("transparentBackground", v)} />
          <Toggle label="Top bar" checked={!!d.showTopBar} onChange={(v) => u("showTopBar", v)} />
          <Toggle label="LIVE badge" checked={!!d.showLiveBadge} onChange={(v) => u("showLiveBadge", v)} />
          <Toggle label="Title" checked={!!d.showTitle} onChange={(v) => u("showTitle", v)} />
          <Toggle label="Uptime" checked={!!d.showUptime} onChange={(v) => u("showUptime", v)} />
          <Toggle label="Brand" checked={!!d.showBrand} onChange={(v) => u("showBrand", v)} />
          <Toggle label="Facecam frame" checked={!!d.showFacecam} onChange={(v) => u("showFacecam", v)} />
          <Toggle label="Audio bars" checked={!!d.showAudioBars} onChange={(v) => u("showAudioBars", v)} />
          <Toggle label="Bottom bar" checked={!!d.showBottomBar} onChange={(v) => u("showBottomBar", v)} />
          <Toggle label="Socials" checked={!!d.showSocials} onChange={(v) => u("showSocials", v)} />
          <Toggle label="Game capture guide" checked={!!d.showGameCaptureGuide} onChange={(v) => u("showGameCaptureGuide", v)} />
        </Section>
        <Section title="Stats rail (default off)">
          <Toggle label="Show stats rail" checked={!!d.showStatsRail} onChange={(v) => u("showStatsRail", v)} />
          <Toggle label="Rating" checked={!!d.showRating} onChange={(v) => u("showRating", v)} />
          <Toggle label="K/D" checked={!!d.showKd} onChange={(v) => u("showKd", v)} />
          <Toggle label="HS%" checked={!!d.showHs} onChange={(v) => u("showHs", v)} />
          <Toggle label="Session" checked={!!d.showSession} onChange={(v) => u("showSession", v)} />
          <Field label="Rating"><TextInput value={String(d.rating)} onChange={(v) => u("rating", v)} /></Field>
          <Field label="Rating delta"><TextInput value={String(d.ratingDelta)} onChange={(v) => u("ratingDelta", v)} /></Field>
          <Field label="K/D"><TextInput value={String(d.kd)} onChange={(v) => u("kd", v)} /></Field>
          <Field label="HS%"><TextInput value={String(d.hs)} onChange={(v) => u("hs", v)} /></Field>
          <Field label="Kills"><TextInput value={String(d.kills)} onChange={(v) => u("kills", v)} /></Field>
          <Field label="Deaths"><TextInput value={String(d.deaths)} onChange={(v) => u("deaths", v)} /></Field>
          <Field label="W/L"><TextInput value={String(d.wl)} onChange={(v) => u("wl", v)} /></Field>
        </Section>
        <Section title="Copy">
          <Field label="Override title (optional)">
            <TextInput
              value={d.overrideTitle ? String(d.overrideTitle) : ""}
              onChange={(v) => u("overrideTitle", v || null)}
            />
          </Field>
          <Field label="Commands text">
            <TextInput value={String(d.commandsText)} onChange={(v) => u("commandsText", v)} />
          </Field>
          <Field label="Commands (vertical)">
            <TextInput value={String(d.commandsTextVertical)} onChange={(v) => u("commandsTextVertical", v)} />
          </Field>
        </Section>
      </>
    );
  }

  if (scene === "brb") {
    return (
      <>
        <Section title="Visibility">
          <Toggle label="Scanlines" checked={!!d.showScanlines} onChange={(v) => u("showScanlines", v)} />
          <Toggle label="Glow" checked={!!d.showGlow} onChange={(v) => u("showGlow", v)} />
          <Toggle label="Pulse ring" checked={!!d.showPulseRing} onChange={(v) => u("showPulseRing", v)} />
          <Toggle label="Sweep bar" checked={!!d.showSweepBar} onChange={(v) => u("showSweepBar", v)} />
          <Toggle label="Corner note" checked={!!d.showCornerNote} onChange={(v) => u("showCornerNote", v)} />
          <Toggle label="Socials" checked={!!d.showSocials} onChange={(v) => u("showSocials", v)} />
        </Section>
        <Section title="Copy">
          <Field label="Kicker"><TextInput value={String(d.kicker)} onChange={(v) => u("kicker", v)} /></Field>
          <Field label="Headline line 1"><TextInput value={String(d.headlineLine1)} onChange={(v) => u("headlineLine1", v)} /></Field>
          <Field label="Headline line 2"><TextInput value={String(d.headlineLine2)} onChange={(v) => u("headlineLine2", v)} /></Field>
          <Field label="Subtext"><TextArea value={String(d.subtext)} onChange={(v) => u("subtext", v)} /></Field>
          <Field label="Subtext (vertical)"><TextArea value={String(d.subtextVertical)} onChange={(v) => u("subtextVertical", v)} /></Field>
          <Field label="Corner note"><TextInput value={String(d.cornerNote)} onChange={(v) => u("cornerNote", v)} /></Field>
        </Section>
      </>
    );
  }

  if (scene === "just-chatting") {
    return (
      <>
        <Section title="Visibility">
          <Toggle label="Camera frame" checked={!!d.showCameraFrame} onChange={(v) => u("showCameraFrame", v)} />
          <Toggle label="Chat panel" checked={!!d.showChatPanel} onChange={(v) => u("showChatPanel", v)} />
          <Toggle label="Viewer count" checked={!!d.showViewerCount} onChange={(v) => u("showViewerCount", v)} />
          <Toggle label="Latest subscriber" checked={!!d.showLatestSubscriber} onChange={(v) => u("showLatestSubscriber", v)} />
          <Toggle label="Agenda bar" checked={!!d.showAgenda} onChange={(v) => u("showAgenda", v)} />
          <Toggle label="Socials" checked={!!d.showSocials} onChange={(v) => u("showSocials", v)} />
          <Toggle label="Hide bot messages" checked={!!d.hideBotMessages} onChange={(v) => u("hideBotMessages", v)} />
          <Toggle label="Hide !commands" checked={!!d.hideCommandMessages} onChange={(v) => u("hideCommandMessages", v)} />
        </Section>
        <Section title="Copy">
          <Field label="Badge text"><TextInput value={String(d.badgeText)} onChange={(v) => u("badgeText", v)} /></Field>
          <Field label="Agenda"><TextArea value={String(d.agendaText)} onChange={(v) => u("agendaText", v)} /></Field>
          <Field label="Max messages">
            <TextInput
              value={String(d.maxMessages)}
              onChange={(v) => u("maxMessages", Number(v) || 6)}
            />
          </Field>
        </Section>
      </>
    );
  }

  // ending
  return (
    <>
      <Section title="Visibility">
        <Toggle label="Scanlines" checked={!!d.showScanlines} onChange={(v) => u("showScanlines", v)} />
        <Toggle label="Next stream card" checked={!!d.showNextStream} onChange={(v) => u("showNextStream", v)} />
        <Toggle label="Session card" checked={!!d.showSession} onChange={(v) => u("showSession", v)} />
        <Toggle label="Socials" checked={!!d.showSocials} onChange={(v) => u("showSocials", v)} />
      </Section>
      <Section title="Copy">
        <Field label="Kicker"><TextInput value={String(d.kicker)} onChange={(v) => u("kicker", v)} /></Field>
        <Field label="Headline line 1"><TextInput value={String(d.headlineLine1)} onChange={(v) => u("headlineLine1", v)} /></Field>
        <Field label="Headline line 2"><TextInput value={String(d.headlineLine2)} onChange={(v) => u("headlineLine2", v)} /></Field>
        <Field label="Subtext"><TextArea value={String(d.subtext)} onChange={(v) => u("subtext", v)} /></Field>
        <Field label="Next stream value"><TextInput value={String(d.nextStreamValue)} onChange={(v) => u("nextStreamValue", v)} /></Field>
        <Field label="Session value"><TextInput value={String(d.sessionValue)} onChange={(v) => u("sessionValue", v)} /></Field>
        <Field label="Socials heading"><TextInput value={String(d.socialsHeading)} onChange={(v) => u("socialsHeading", v)} /></Field>
      </Section>
    </>
  );
}
