"use client";

import type { GlobalSettings, LiveSettings } from "@/lib/settings/schema";
import { resolveStreamTitle } from "@/lib/settings/schema";
import { formatUptime } from "@/lib/hooks/useLiveFeed";
import {
  AudioBars,
  CornerFrame,
  LiveBadge,
  SocialRail,
  StatCard,
} from "@/components/parts";

type Props = {
  global: GlobalSettings;
  settings: LiveSettings;
  uptimeSeconds: number | null;
  streamTitle?: string | null;
};

export function LiveHorizontal({
  global,
  settings,
  uptimeSeconds,
  streamTitle,
}: Props) {
  const title =
    settings.overrideTitle ?? streamTitle ?? resolveStreamTitle(global);
  const uptime = formatUptime(uptimeSeconds);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: settings.transparentBackground ? "transparent" : "#0d0d11",
      }}
    >
      {!settings.transparentBackground && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(45deg,rgba(255,255,255,.02) 0 22px,transparent 22px 44px)",
          }}
        />
      )}

      {settings.showGameCaptureGuide && (
        <div
          style={{
            position: "absolute",
            left: 340,
            top: 150,
            right: 420,
            bottom: 150,
            border: "2px dashed rgba(255,255,255,.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 14,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 26,
              letterSpacing: "0.3em",
              color: "#4E4E58",
            }}
          >
            GAME CAPTURE
          </div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 18,
              letterSpacing: "0.2em",
              color: "#3A3A42",
            }}
          >
            TRANSPARENT IN OBS
          </div>
        </div>
      )}

      {settings.showTopBar && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 104,
            background:
              "linear-gradient(180deg,rgba(7,7,10,.96),rgba(7,7,10,.62))",
            borderBottom: "1px solid rgba(255,255,255,.10)",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {settings.showLiveBadge && <LiveBadge clip />}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 28,
              paddingLeft: 44,
            }}
          >
            {settings.showTitle && (
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                }}
              >
                {title}
              </div>
            )}
            {settings.showTitle && settings.showUptime && (
              <div
                style={{
                  width: 2,
                  height: 30,
                  background: "rgba(255,255,255,.16)",
                }}
              />
            )}
            {settings.showUptime && (
              <div
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 24,
                  letterSpacing: "0.16em",
                  color: "#8A8A93",
                }}
              >
                UPTIME {uptime}
              </div>
            )}
          </div>
          {settings.showBrand && (
            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                gap: 22,
                paddingRight: 44,
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                }}
              >
                {global.brand}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 22,
                  letterSpacing: "0.2em",
                  color: "#8A8A93",
                }}
              >
                {global.handle}
              </div>
            </div>
          )}
        </div>
      )}

      {settings.showStatsRail && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 104,
            width: 420,
            padding: "36px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            background:
              "linear-gradient(270deg,rgba(9,9,12,.94),rgba(9,9,12,.55))",
          }}
        >
          {settings.showRating && (
            <StatCard
              label="PREMIER RATING"
              value={settings.rating}
              delta={settings.ratingDelta}
              accentBar
            />
          )}
          {(settings.showKd || settings.showHs) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {settings.showKd && (
                <StatCard label="K / D" value={settings.kd} compact />
              )}
              {settings.showHs && (
                <StatCard label="HS %" value={settings.hs} compact />
              )}
            </div>
          )}
          {settings.showSession && (
            <div
              style={{
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(14,14,18,.9)",
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 16,
                  letterSpacing: "0.24em",
                  color: "#8A8A93",
                }}
              >
                SESSION
              </div>
              {[
                ["KILLS", settings.kills, false],
                ["DEATHS", settings.deaths, false],
                ["W / L", settings.wl, true],
              ].map(([label, value, accent]) => (
                <div
                  key={String(label)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 24,
                  }}
                >
                  <span style={{ color: "#8A8A93" }}>{label}</span>
                  <span style={{ color: accent ? "#FF3B3B" : undefined }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {settings.showFacecam && (
        <div
          style={{
            position: "absolute",
            left: 40,
            bottom: 132,
            width: settings.facecamWidth,
            height: settings.facecamHeight,
          }}
        >
          <CornerFrame
            label="FACECAM"
            showLabel={settings.showFacecamLabel}
            size={44}
            thick={5}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: -52,
              display: "flex",
              alignItems: "center",
              gap: 14,
              height: 44,
              padding: "0 22px",
              background: "#E8192C",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.24em",
              }}
            >
              {global.brand}
            </div>
            {settings.showAudioBars && <AudioBars />}
          </div>
        </div>
      )}

      {settings.showBottomBar && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 72,
            background: "rgba(7,7,10,.94)",
            borderTop: "1px solid rgba(255,255,255,.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
          }}
        >
          {settings.showSocials ? (
            <SocialRail
              items={global.socials
                .filter((s) => ["TWITCH", "TIKTOK", "INSTAGRAM"].includes(s.label) || s.label === "IG")
                .slice(0, 3)
                .map((s) => ({
                  label: s.label === "INSTAGRAM" ? "IG" : s.label,
                  value: s.value,
                }))}
              gap={36}
              fontSize={22}
            />
          ) : (
            <div />
          )}
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 22,
              letterSpacing: "0.18em",
              color: "#8A8A93",
            }}
          >
            {settings.commandsText}
          </div>
        </div>
      )}
    </div>
  );
}

export function LiveVertical({
  global,
  settings,
  uptimeSeconds,
  streamTitle,
}: Props) {
  const title =
    settings.overrideTitle ?? streamTitle ?? resolveStreamTitle(global);
  const uptime = formatUptime(uptimeSeconds);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: settings.transparentBackground ? "transparent" : "#0d0d11",
      }}
    >
      {settings.showTopBar && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 140,
            background:
              "linear-gradient(180deg,rgba(7,7,10,.96),rgba(7,7,10,.6))",
            borderBottom: "1px solid rgba(255,255,255,.10)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            padding: "0 40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {settings.showLiveBadge && <LiveBadge size="sm" />}
            {settings.showBrand && (
              <>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                  }}
                >
                  {global.brand}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 20,
                    letterSpacing: "0.2em",
                    color: "#8A8A93",
                  }}
                >
                  {global.handle}
                </div>
              </>
            )}
          </div>
          {(settings.showTitle || settings.showUptime) && (
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 22,
                letterSpacing: "0.1em",
                color: "#B4B4BC",
              }}
            >
              {settings.showTitle ? title : ""}
              {settings.showTitle && settings.showUptime ? " · " : ""}
              {settings.showUptime ? `UPTIME ${uptime}` : ""}
            </div>
          )}
        </div>
      )}

      {settings.showGameCaptureGuide && (
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 300,
            height: 900,
            border: "2px dashed rgba(255,255,255,.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 26,
              letterSpacing: "0.3em",
              color: "#4E4E58",
            }}
          >
            GAME CAPTURE
          </div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 18,
              letterSpacing: "0.2em",
              color: "#3A3A42",
            }}
          >
            CROP TO 9:16 SAFE AREA
          </div>
        </div>
      )}

      {settings.showStatsRail && (
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 1250,
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            gap: 16,
          }}
        >
          {settings.showRating && (
            <StatCard
              label="RATING"
              value={settings.rating}
              accentBar
              compact
            />
          )}
          {settings.showKd && (
            <StatCard label="K / D" value={settings.kd} compact />
          )}
          {settings.showHs && (
            <StatCard label="HS %" value={settings.hs} compact />
          )}
        </div>
      )}

      {settings.showFacecam && (
        <div
          style={{
            position: "absolute",
            left: 40,
            bottom: 180,
            width: 440,
            height: 248,
          }}
        >
          <CornerFrame
            label="FACECAM"
            showLabel={settings.showFacecamLabel}
            size={40}
            thick={5}
          />
        </div>
      )}

      {settings.showBottomBar && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 110,
            background: "rgba(7,7,10,.94)",
            borderTop: "1px solid rgba(255,255,255,.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
          }}
        >
          {settings.showSocials ? (
            <SocialRail
              items={global.socials.slice(0, 2).map((s) => ({
                label: s.label === "INSTAGRAM" ? "IG" : s.label,
                value: s.value,
              }))}
              gap={26}
              fontSize={24}
            />
          ) : (
            <div />
          )}
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 22,
              color: "#8A8A93",
            }}
          >
            {settings.commandsTextVertical}
          </div>
        </div>
      )}
    </div>
  );
}
