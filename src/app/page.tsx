"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { SCENE_IDS, SCENE_META } from "@/lib/scenes";
import { useLiveFeed, formatUptime, useUptimeSeconds } from "@/lib/hooks/useLiveFeed";

export default function DashboardPage() {
  const { data, connected, ready } = useLiveFeed();
  const [copied, setCopied] = useState<string | null>(null);
  const uptimeSeconds = useUptimeSeconds(
    data.live.uptimeStartedAt,
    data.live.uptimeSeconds,
  );

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "http://localhost:3000";
    return window.location.origin;
  }, []);

  const copy = async (url: string, key: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="admin-shell">
      <AdminNav current="home" />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 8,
                height: 48,
                background: "linear-gradient(180deg,#FF3B3B,#8B5CF6)",
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 13,
                  letterSpacing: "0.28em",
                  color: "#FF3B3B",
                }}
              >
                TEYE / STREAM PACKAGE v1
              </div>
              <h1
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  margin: "4px 0 0",
                }}
              >
                Broadcast scenes — horizontal & vertical
              </h1>
            </div>
          </div>
          <p
            style={{
              marginTop: 16,
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 13,
              color: "#8A8A93",
              letterSpacing: "0.06em",
            }}
          >
            1920×1080 & 1080×1920 · capture each URL as an OBS browser source
          </p>
        </section>

        <section
          className="admin-card"
          style={{
            padding: 20,
            marginBottom: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 16,
          }}
        >
          <Stat
            label="SSE"
            value={connected ? "CONNECTED" : "…"}
            accent={connected}
          />
          <Stat
            label="YouTube"
            value={
              !ready
                ? "…"
                : data.youtube.connected
                  ? "CONNECTED"
                  : data.youtube.configured
                    ? "READY"
                    : "SETUP"
            }
          />
          <Stat
            label="Broadcast"
            value={
              !ready ? "…" : data.live.isLive ? `${data.live.viewers} VIEWERS` : "OFFLINE"
            }
            accent={data.live.isLive}
          />
          <Stat
            label="Uptime"
            value={formatUptime(uptimeSeconds)}
          />
          <Stat
            label="Quota"
            value={
              ready
                ? `${data.quota.usedToday}/${data.quota.dailyLimit}`
                : "…"
            }
          />
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 16,
          }}
        >
          {SCENE_IDS.map((id) => {
            const meta = SCENE_META[id];
            const hUrl = `${origin}/scene/${id}?o=h`;
            const vUrl = `${origin}/scene/${id}?o=v`;
            return (
              <article key={id} className="admin-card" style={{ padding: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{ width: 4, height: 18, background: "#E8192C" }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 12,
                      letterSpacing: "0.22em",
                      color: "#8A8A93",
                    }}
                  >
                    {meta.number}
                  </div>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                  {meta.label}
                </h2>
                <p style={{ color: "#8A8A93", fontSize: 14, marginTop: 8 }}>
                  {meta.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  <button
                    className="admin-btn"
                    onClick={() => copy(hUrl, `${id}-h`)}
                  >
                    {copied === `${id}-h` ? "Copied!" : "Copy 16:9 URL"}
                  </button>
                  <button
                    className="admin-btn secondary"
                    onClick={() => copy(vUrl, `${id}-v`)}
                  >
                    {copied === `${id}-v` ? "Copied!" : "Copy 9:16 URL"}
                  </button>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Link
                      className="admin-btn secondary"
                      href={`/scene/${id}?o=h`}
                      target="_blank"
                      style={{ flex: 1, textAlign: "center" }}
                    >
                      Open
                    </Link>
                    <Link
                      className="admin-btn secondary"
                      href={`/settings/${id}`}
                      style={{ flex: 1, textAlign: "center" }}
                    >
                      Settings
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <section className="admin-card" style={{ padding: 20, marginTop: 28 }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 12,
              letterSpacing: "0.22em",
              color: "#E8192C",
              marginBottom: 12,
            }}
          >
            OBS SETUP
          </div>
          <ol
            style={{
              margin: 0,
              paddingLeft: 20,
              color: "#B4B4BC",
              lineHeight: 1.7,
            }}
          >
            <li>
              Run <code>npm run dev</code> (or <code>npm run build && npm start</code>).
            </li>
            <li>
              In OBS, add a <strong>Browser</strong> source. Width/Height: 1920×1080
              (or 1080×1920 for vertical).
            </li>
            <li>Paste the copied scene URL. Check “Shutdown source when not visible” off for overlays.</li>
            <li>
              For the Live scene, leave the page transparent and place it above
              your game capture.
            </li>
            <li>
              Edit settings at <Link href="/settings/global">/settings/global</Link>{" "}
              or mid-stream from <Link href="/control">/control</Link> on your phone.
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "#8A8A93",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 16,
          fontWeight: 700,
          color: accent ? "#FF3B3B" : "#F2F2F4",
        }}
      >
        {value}
      </div>
    </div>
  );
}
