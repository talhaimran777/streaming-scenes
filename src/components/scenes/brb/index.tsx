"use client";

import type { BrbSettings, GlobalSettings } from "@/lib/settings/schema";
import {
  BrandMark,
  ScanlineOverlay,
  SocialRail,
  verticalSafeAreaStyle,
} from "@/components/parts";

type Props = {
  global: GlobalSettings;
  settings: BrbSettings;
};

export function BrbHorizontal({ global, settings }: Props) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070a" }}>
      {settings.showGlow && (
        <div
          className="teye-glow"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1100px 800px at 50% 50%,rgba(232,25,44,.20),transparent 70%)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <ScanlineOverlay show={settings.showScanlines} />

      <div style={{ position: "absolute", left: 56, top: 56 }}>
        <BrandMark
          brand={global.brand}
          handle={global.handle}
          brandSize={38}
          handleSize={20}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        {settings.showPulseRing && (
          <div
            style={{
              position: "relative",
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="teye-ring"
              style={{
                position: "absolute",
                inset: 0,
                border: "2px solid rgba(232,25,44,.9)",
              }}
            />
            <div
              className="teye-ring"
              style={{
                position: "absolute",
                inset: 0,
                border: "2px solid rgba(232,25,44,.6)",
                animationDelay: "1.3s",
              }}
            />
            <div
              className="teye-pulse"
              style={{ width: 26, height: 26, background: "#E8192C" }}
            />
          </div>
        )}
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 26,
            letterSpacing: "0.36em",
            color: "#E8192C",
          }}
        >
          {settings.kicker}
        </div>
        <div
          style={{
            fontSize: 196,
            fontWeight: 700,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            textAlign: "center",
            textShadow: "0 0 70px rgba(232,25,44,.35)",
          }}
        >
          {settings.headlineLine1}
          <br />
          {settings.headlineLine2}
        </div>
        <div style={{ fontSize: 40, color: "#B4B4BC" }}>{settings.subtext}</div>
        {settings.showSweepBar && (
          <div
            style={{
              width: 620,
              height: 6,
              background: "rgba(255,255,255,.08)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              className="teye-sweep"
              style={{
                position: "absolute",
                inset: 0,
                width: "30%",
                background:
                  "linear-gradient(90deg,transparent,#E8192C,transparent)",
              }}
            />
          </div>
        )}
      </div>

      {settings.showSocials && (
        <div style={{ position: "absolute", left: 56, bottom: 52 }}>
          <SocialRail items={global.socials} maxWidth={1000} />
        </div>
      )}
      {settings.showCornerNote && (
        <div
          style={{
            position: "absolute",
            right: 56,
            bottom: 52,
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 22,
            letterSpacing: "0.2em",
            color: "#8A8A93",
          }}
        >
          {settings.cornerNote}
        </div>
      )}
    </div>
  );
}

export function BrbVertical({ global, settings }: Props) {
  const safe = global.verticalSafeAreaPx;
  const topSafe = global.verticalTopSafeAreaPx;
  const sidePad = global.verticalSidePaddingPx;

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070a" }}>
      {settings.showGlow && (
        <div
          className="teye-glow"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(760px 900px at 50% 46%,rgba(232,25,44,.22),transparent 70%)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <ScanlineOverlay show={settings.showScanlines} />

      <div style={verticalSafeAreaStyle(topSafe, safe, sidePad)}>
        <div style={{ position: "absolute", left: 72, top: 110 }}>
          <BrandMark
            brand={global.brand}
            handle={global.handle}
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
            top: "52%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
          }}
        >
          {settings.showPulseRing && (
            <div
              style={{
                position: "relative",
                width: 110,
                height: 110,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="teye-ring"
                style={{
                  position: "absolute",
                  inset: 0,
                  border: "2px solid rgba(232,25,44,.9)",
                }}
              />
              <div
                className="teye-pulse"
                style={{ width: 24, height: 24, background: "#E8192C" }}
              />
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 24,
              letterSpacing: "0.34em",
              color: "#E8192C",
            }}
          >
            {settings.kicker}
          </div>
          <div
            style={{
              fontSize: 150,
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              textAlign: "center",
              textShadow: "0 0 60px rgba(232,25,44,.35)",
            }}
          >
            {settings.headlineVerticalLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
          <div style={{ fontSize: 38, color: "#B4B4BC", textAlign: "center" }}>
            {settings.subtextVertical}
          </div>
          {settings.showSweepBar && (
            <div
              style={{
                width: 520,
                height: 6,
                background: "rgba(255,255,255,.08)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                className="teye-sweep"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "30%",
                  background:
                    "linear-gradient(90deg,transparent,#E8192C,transparent)",
                }}
              />
            </div>
          )}
        </div>

        {settings.showSocials && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 110,
              borderTop: "1px solid rgba(255,255,255,.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SocialRail
              items={global.socials}
              fontSize={24}
              maxWidth={1000}
            />
          </div>
        )}
      </div>
    </div>
  );
}
