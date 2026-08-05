"use client";

import type { GlobalSettings, LiveSettings } from "@/lib/settings/schema";
import { resolveStreamTitle } from "@/lib/settings/schema";
import { formatUptime, useUptimeSeconds } from "@/lib/hooks/useLiveFeed";
import { resolveVerticalLayout } from "@/lib/layout/vertical";
import {
  AudioBars,
  CornerFrame,
  LiveBadge,
  SocialBlock,
  StatCard,
} from "@/components/parts";

const TOP_BAR_BG =
  "linear-gradient(180deg,rgba(7,7,10,.96),rgba(7,7,10,.62))";
const TOP_BAR_BORDER = "1px solid rgba(255,255,255,.10)";

type Props = {
  global: GlobalSettings;
  settings: LiveSettings;
  uptimeSeconds: number | null;
  uptimeStartedAt?: string | null;
  streamTitle?: string | null;
};

export function LiveHorizontal({
  global,
  settings,
  uptimeSeconds,
  uptimeStartedAt = null,
  streamTitle,
}: Props) {
  const title =
    settings.overrideTitle ?? streamTitle ?? resolveStreamTitle(global);
  const uptime = formatUptime(
    useUptimeSeconds(uptimeStartedAt, uptimeSeconds),
  );

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
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              flex: settings.showStreamerName ? 1 : "0 0 auto",
              display: "flex",
              alignItems: "stretch",
              background: TOP_BAR_BG,
              borderBottom: TOP_BAR_BORDER,
            }}
          >
            {settings.showLiveBadge && (
              <LiveBadge clip text={settings.liveBadgeText} />
            )}
            <div
              style={{
                flex: settings.showStreamerName ? 1 : "0 0 auto",
                display: "flex",
                alignItems: "center",
                gap: 28,
                paddingLeft: 44,
                paddingRight: settings.showStreamerName ? 0 : 44,
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
                  {settings.uptimePrefix} {uptime}
                </div>
              )}
            </div>
          </div>
          {settings.showStreamerName && (
            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                gap: 22,
                paddingRight: 44,
                background: TOP_BAR_BG,
                borderBottom: TOP_BAR_BORDER,
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
              label={settings.ratingLabel}
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
                <StatCard label={settings.kdLabel} value={settings.kd} compact />
              )}
              {settings.showHs && (
                <StatCard label={settings.hsLabel} value={settings.hs} compact />
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
                {settings.sessionHeading}
              </div>
              {[
                [settings.killsLabel, settings.kills, false],
                [settings.deathsLabel, settings.deaths, false],
                [settings.wlLabel, settings.wl, true],
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
            label={settings.facecamLabel}
            showLabel={settings.showFacecamLabel}
            fill={!settings.transparentBackground}
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
            <SocialBlock
              items={global.socials}
              layout="inline"
              gap={36}
              fontSize={22}
              maxWidth={1200}
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
  uptimeStartedAt = null,
  streamTitle,
}: Props) {
  const title =
    settings.overrideTitle ?? streamTitle ?? resolveStreamTitle(global);
  const uptime = formatUptime(
    useUptimeSeconds(uptimeStartedAt, uptimeSeconds),
  );
  const layout = resolveVerticalLayout(global, settings);
  const game = layout.frameSize(
    settings.gameCaptureWidthVertical,
    settings.gameCaptureHeightVertical,
    36,
  );
  const cam = layout.frameSize(
    settings.facecamWidthVertical,
    settings.facecamHeightVertical,
    36,
  );

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

      <div style={layout.boxStyle}>
        {settings.showTopBar && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 132,
              background:
                "linear-gradient(180deg,rgba(7,7,10,.96),rgba(7,7,10,.6))",
              borderBottom: "1px solid rgba(255,255,255,.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 36px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {settings.showLiveBadge && (
                <LiveBadge size="sm" text={settings.liveBadgeText} />
              )}
              {settings.showBrand && (
                <>
                  <div
                    style={{
                      fontSize: 36,
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
            {settings.showUptime && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    letterSpacing: "0.2em",
                    color: "#8A8A93",
                  }}
                >
                  {settings.uptimePrefix}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {uptime}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 172,
            padding: "0 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
          }}
        >
          {settings.showGameCapture && (
            <div
              style={{
                position: "relative",
                width: game.width,
                height: game.height,
                flexShrink: 0,
              }}
            >
              <CornerFrame
                label={settings.gameCaptureLabel}
                showLabel={settings.showGameCaptureGuide}
                fill={
                  settings.showGameCaptureGuide &&
                  !settings.transparentBackground
                }
                size={52}
                thick={6}
              />
              {settings.showTitle && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: 48,
                    padding: "0 22px",
                    background: "rgba(7,7,10,.92)",
                    borderRight: "3px solid #E8192C",
                    display: "flex",
                    alignItems: "center",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 20,
                      letterSpacing: "0.2em",
                      color: "#DDDDE2",
                    }}
                  >
                    {title}
                  </div>
                </div>
              )}
            </div>
          )}

          {settings.showFacecam && (
            <div
              style={{
                position: "relative",
                width: cam.width,
                height: cam.height,
                flexShrink: 0,
              }}
            >
              <CornerFrame
                label={settings.facecamLabel}
                showLabel={settings.showFacecamLabel}
                fill={!settings.transparentBackground}
                size={52}
                thick={6}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  height: 52,
                  padding: "0 22px",
                  background: "#E8192C",
                  zIndex: 2,
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

          {settings.showStatsRail && (
            <div
              style={{
                alignSelf: "stretch",
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 1fr",
                gap: 16,
                flexShrink: 0,
              }}
            >
              {settings.showRating && (
                <StatCard
                  label={settings.ratingLabelVertical}
                  value={settings.rating}
                  accentBar
                  compact
                />
              )}
              {settings.showKd && (
                <StatCard label={settings.kdLabel} value={settings.kd} compact />
              )}
              {settings.showHs && (
                <StatCard label={settings.hsLabel} value={settings.hs} compact />
              )}
            </div>
          )}

          {settings.showBottomBar && (
            <div
              style={{
                alignSelf: "stretch",
                minHeight: 86,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 22,
                letterSpacing: "0.14em",
                color: "#B4B4BC",
                flexShrink: 0,
              }}
            >
              {settings.showSocials ? (
                <SocialBlock
                  items={global.socials}
                  layout={global.socialsLayout}
                />
              ) : (
                <div />
              )}
              <div style={{ color: "#8A8A93" }}>
                {settings.commandsTextVertical}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
