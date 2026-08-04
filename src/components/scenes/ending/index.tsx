"use client";

import type { EndingSettings, GlobalSettings } from "@/lib/settings/schema";
import {
  BrandMark,
  ScanlineOverlay,
  verticalSafeAreaStyle,
} from "@/components/parts";

type Props = {
  global: GlobalSettings;
  settings: EndingSettings;
};

export function EndingHorizontal({ global, settings }: Props) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070a" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg,rgba(232,25,44,.26),transparent 55%),radial-gradient(900px 700px at 88% 90%,rgba(139,92,246,.20),transparent 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      />
      <ScanlineOverlay show={settings.showScanlines} />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: "linear-gradient(180deg,#8B5CF6,#E8192C)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 120,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{ fontSize: 42, fontWeight: 700, letterSpacing: "0.16em" }}
        >
          {global.brand}
        </div>
        <div
          style={{
            width: 2,
            height: 32,
            background: "rgba(255,255,255,.18)",
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 22,
            letterSpacing: "0.22em",
            color: "#8A8A93",
          }}
        >
          {settings.kicker}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 330,
          maxWidth: 1180,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div
          style={{
            fontSize: 150,
            fontWeight: 700,
            lineHeight: 0.9,
            letterSpacing: "-0.035em",
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
            lineHeight: 1.35,
            maxWidth: 900,
          }}
        >
          {settings.subtext}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          bottom: 120,
          display: "flex",
          gap: 20,
        }}
      >
        {settings.showNextStream && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(14,14,18,.88)",
              padding: "26px 34px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minWidth: 280,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 18,
                letterSpacing: "0.26em",
                color: "#8A8A93",
              }}
            >
              {settings.nextStreamLabel}
            </div>
            <div style={{ fontSize: 34, fontWeight: 600 }}>
              {settings.nextStreamValue}
            </div>
          </div>
        )}
        {settings.showSession && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(14,14,18,.88)",
              padding: "26px 34px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minWidth: 280,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 18,
                letterSpacing: "0.26em",
                color: "#8A8A93",
              }}
            >
              {settings.sessionLabel}
            </div>
            <div style={{ fontSize: 34, fontWeight: 600 }}>
              {settings.sessionValue}
            </div>
          </div>
        )}
      </div>

      {settings.showSocials && (
        <div
          style={{
            position: "absolute",
            right: 96,
            bottom: 120,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            alignItems: "flex-end",
            fontFamily: "var(--font-jetbrains), monospace",
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: "0.3em",
              color: "#E8192C",
            }}
          >
            {settings.socialsHeading}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              alignItems: "flex-end",
              fontSize: 30,
              letterSpacing: "0.1em",
              color: "#DDDDE2",
            }}
          >
            {global.socials.map((s) => (
              <div key={s.label}>
                {s.label} / {s.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function EndingVertical({ global, settings }: Props) {
  const safe = global.verticalSafeAreaPx;
  const topSafe = global.verticalTopSafeAreaPx;

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070a" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(160deg,rgba(232,25,44,.26),transparent 55%),radial-gradient(700px 700px at 85% 92%,rgba(139,92,246,.20),transparent 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "90px 90px",
        }}
      />
      <ScanlineOverlay show={settings.showScanlines} />

      <div style={verticalSafeAreaStyle(topSafe, safe)}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 8,
            background: "linear-gradient(90deg,#8B5CF6,#E8192C)",
          }}
        />

        <div style={{ position: "absolute", left: 72, top: 130 }}>
          <BrandMark
            brand={global.brand}
            handle={settings.kicker}
            brandSize={46}
            handleSize={22}
            row={false}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 72,
            right: 72,
            top: "24.9%",
            display: "flex",
            flexDirection: "column",
            gap: 30,
          }}
        >
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
            }}
          >
            {settings.headlineVerticalLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
          <div style={{ fontSize: 38, color: "#B4B4BC", lineHeight: 1.35 }}>
            {settings.subtextVertical}
          </div>
          {settings.showNextStream && (
            <div
              style={{
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(14,14,18,.88)",
                padding: "28px 32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 18,
                    letterSpacing: "0.26em",
                    color: "#8A8A93",
                  }}
                >
                  {settings.nextStreamLabel}
                </div>
                <div style={{ fontSize: 34, fontWeight: 600 }}>
                  {settings.nextStreamValue}
                </div>
              </div>
              <div style={{ width: 5, height: 70, background: "#E8192C" }} />
            </div>
          )}
        </div>

        {settings.showSocials && (
          <div
            style={{
              position: "absolute",
              left: 72,
              right: 72,
              top: "76.5%",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            <div
              style={{
                fontSize: 20,
                letterSpacing: "0.3em",
                color: "#E8192C",
              }}
            >
              {settings.socialsHeading}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 24px",
                fontSize: 30,
                letterSpacing: "0.08em",
                color: "#DDDDE2",
              }}
            >
              {global.socials.map((s) => (
                <div key={s.label}>
                  {s.label} / {s.value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
