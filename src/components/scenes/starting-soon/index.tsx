"use client";

import { useEffect, useState } from "react";
import type { GlobalSettings, StartingSoonSettings } from "@/lib/settings/schema";
import { resolveGameLabel } from "@/lib/settings/schema";
import { formatCountdown } from "@/lib/hooks/useLiveFeed";
import { resolveVerticalLayout } from "@/lib/layout/vertical";
import {
  BrandMark,
  CountdownCard,
  GlowOverlay,
  GridOverlay,
  ScanlineOverlay,
  Ticker,
} from "@/components/parts";

type Props = {
  global: GlobalSettings;
  settings: StartingSoonSettings;
};

function useTick(target: string | null) {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setN((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [target]);
}

export function StartingSoonHorizontal({ global, settings }: Props) {
  useTick(settings.countdownTarget);
  const gameLabel = settings.overrideGameLabel ?? resolveGameLabel(global);
  const countdown = formatCountdown(
    settings.countdownTarget,
    settings.countdownFallback,
  );

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070a" }}>
      <GlowOverlay show={settings.showGlow} horizontal />
      <GridOverlay show={settings.showGrid} size={96} />
      <ScanlineOverlay show={settings.showScanlines} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: "linear-gradient(180deg,#E8192C,rgba(139,92,246,.6))",
        }}
      />

      <div style={{ position: "absolute", left: 96, top: 76 }}>
        <BrandMark brand={global.brand} handle={global.handle} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 330,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          maxWidth: 1080,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 2, background: "#E8192C" }} />
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 26,
              letterSpacing: "0.3em",
              color: "#E8192C",
            }}
          >
            {gameLabel}
          </div>
        </div>
        <div
          style={{
            fontSize: 184,
            fontWeight: 700,
            lineHeight: 0.88,
            letterSpacing: "-0.035em",
            textShadow: "0 0 60px rgba(232,25,44,.35)",
          }}
        >
          {settings.headlineLine1}
          <br />
          {settings.headlineLine2}
        </div>
        <div
          style={{
            fontSize: 38,
            color: "#B4B4BC",
            lineHeight: 1.4,
            maxWidth: 820,
          }}
        >
          {settings.tagline}
        </div>
      </div>

      {settings.showCountdown && (
        <div style={{ position: "absolute", right: 96, top: 330 }}>
          <CountdownCard
            value={countdown}
            infoRows={settings.infoRows}
            showInfoRows={settings.showInfoRows}
            countdownLabel={settings.countdownLabel}
          />
        </div>
      )}

      {settings.showTicker && (
        <Ticker
          items={settings.tickerItems}
          badge={settings.standbyText}
          height={96}
        />
      )}
    </div>
  );
}

export function StartingSoonVertical({ global, settings }: Props) {
  useTick(settings.countdownTarget);
  const gameLabel = settings.overrideGameLabel ?? resolveGameLabel(global);
  const countdown = formatCountdown(
    settings.countdownTarget,
    settings.countdownFallback,
  );
  const layout = resolveVerticalLayout(global, settings);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070a" }}>
      <GlowOverlay show={settings.showGlow} horizontal={false} />
      <GridOverlay show={settings.showGrid} size={90} />
      <ScanlineOverlay show={settings.showScanlines} />

      <div style={layout.boxStyle}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 8,
            background: "linear-gradient(90deg,#E8192C,rgba(139,92,246,.6))",
          }}
        />

        <div style={{ position: "absolute", left: 72, top: 120 }}>
          <BrandMark
            brand={global.brand}
            handle={global.handle}
            brandSize={52}
            handleSize={24}
            row={false}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 72,
            right: 72,
            top: "26.7%",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 2, background: "#E8192C" }} />
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 26,
                letterSpacing: "0.28em",
                color: "#E8192C",
              }}
            >
              {gameLabel}
            </div>
          </div>
          <div
            style={{
              fontSize: 158,
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
              textShadow: "0 0 60px rgba(232,25,44,.35)",
            }}
          >
            {settings.headlineLine1}
            <br />
            {settings.headlineLine2}
          </div>
          <div style={{ fontSize: 40, color: "#B4B4BC", lineHeight: 1.35 }}>
            {settings.taglineVertical}
          </div>
          {settings.showCountdown && (
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(14,14,18,0.85)",
                padding: "36px 40px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 20,
                      letterSpacing: "0.28em",
                      color: "#8A8A93",
                    }}
                  >
                    {settings.countdownLabel}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 112,
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {countdown}
                  </div>
                </div>
                <div
                  style={{
                    width: 6,
                    height: 120,
                    background: "linear-gradient(180deg,#E8192C,#8B5CF6)",
                  }}
                />
              </div>
              {settings.showInfoRows && settings.infoRows.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                    paddingTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 22,
                  }}
                >
                  {settings.infoRows.map((row) => (
                    <div
                      key={`${row.label}-${row.value}`}
                      style={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <span style={{ color: "#8A8A93" }}>{row.label}</span>
                      <span style={{ color: row.accent ? "#FF3B3B" : undefined }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {settings.showTicker && (
          <Ticker
            items={settings.tickerItems}
            badge={settings.standbyText}
            height={120}
            fast
          />
        )}
      </div>
    </div>
  );
}
