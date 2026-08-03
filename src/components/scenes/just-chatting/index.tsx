"use client";

import type {
  GlobalSettings,
  JustChattingSettings,
} from "@/lib/settings/schema";
import type { LiveChatMessage } from "@/lib/sse/bus";
import {
  ChatFeed,
  CornerFrame,
  LiveBadge,
  SocialRail,
} from "@/components/parts";

type Props = {
  global: GlobalSettings;
  settings: JustChattingSettings;
  viewers: number;
  latestSubscriber: string | null;
  chat: LiveChatMessage[];
};

export function JustChattingHorizontal({
  global,
  settings,
  viewers,
  latestSubscriber,
  chat,
}: Props) {
  const messages = chat.slice(-settings.maxMessages);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070a" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(900px 700px at 18% 20%,rgba(139,92,246,.16),transparent 72%),radial-gradient(800px 700px at 92% 88%,rgba(232,25,44,.20),transparent 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {settings.showCameraFrame && (
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 56,
            width: 1160,
            height: 780,
          }}
        >
          <CornerFrame
            label="CAMERA"
            showLabel={settings.showCameraLabel}
            size={56}
            thick={6}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: -1,
              display: "flex",
              alignItems: "center",
              gap: 14,
              height: 56,
              padding: "0 26px",
              background: "#E8192C",
              zIndex: 2,
            }}
          >
            <div
              className="teye-pulse"
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#fff",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.24em",
              }}
            >
              {settings.badgeText}
            </div>
          </div>
        </div>
      )}

      {settings.showChatPanel && (
        <div
          style={{
            position: "absolute",
            right: 56,
            top: 56,
            width: 600,
            bottom: 150,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(12,12,16,.88)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 6,
              background: "linear-gradient(90deg,#8B5CF6,#E8192C)",
            }}
          />
          <div
            style={{
              padding: "28px 32px",
              borderBottom: "1px solid rgba(255,255,255,.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 20,
                letterSpacing: "0.28em",
                color: "#8A8A93",
              }}
            >
              CHAT
            </div>
            {settings.showViewerCount && (
              <div
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 20,
                  color: "#FF3B3B",
                }}
              >
                {viewers} WATCHING
              </div>
            )}
          </div>
          <ChatFeed messages={messages} />
          {settings.showLatestSubscriber && (
            <div
              style={{
                padding: "26px 32px",
                borderTop: "1px solid rgba(255,255,255,.1)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
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
                LATEST FOLLOWER
              </div>
              <div style={{ fontSize: 30, fontWeight: 600 }}>
                {latestSubscriber ?? "nadeking"}
              </div>
            </div>
          )}
        </div>
      )}

      {settings.showAgenda && (
        <div
          style={{
            position: "absolute",
            left: 56,
            bottom: 56,
            width: 1160,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(12,12,16,.88)",
            padding: "26px 32px",
            display: "flex",
            alignItems: "center",
            gap: 36,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 20,
              letterSpacing: "0.26em",
              color: "#E8192C",
            }}
          >
            TODAY
          </div>
          <div
            style={{
              width: 2,
              height: 34,
              background: "rgba(255,255,255,.14)",
            }}
          />
          <div style={{ fontSize: 30, color: "#DDDDE2" }}>
            {settings.agendaText}
          </div>
        </div>
      )}
    </div>
  );
}

export function JustChattingVertical({
  global,
  settings,
  viewers,
  latestSubscriber,
  chat,
}: Props) {
  const messages = chat.slice(-Math.min(settings.maxMessages, 3));

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070a" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(700px 700px at 20% 16%,rgba(139,92,246,.16),transparent 72%),radial-gradient(700px 700px at 88% 90%,rgba(232,25,44,.20),transparent 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{ fontSize: 44, fontWeight: 700, letterSpacing: "0.16em" }}
        >
          {global.brand}
        </div>
        <LiveBadge text={settings.badgeText} size="sm" />
      </div>

      {settings.showCameraFrame && (
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 280,
            height: 920,
          }}
        >
          <CornerFrame
            label="CAMERA"
            showLabel={settings.showCameraLabel}
            size={48}
            thick={6}
          />
        </div>
      )}

      {settings.showChatPanel && (
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 1250,
            bottom: 150,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(12,12,16,.9)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 5,
              background: "linear-gradient(90deg,#8B5CF6,#E8192C)",
            }}
          />
          <div
            style={{
              padding: "22px 28px",
              borderBottom: "1px solid rgba(255,255,255,.1)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 20,
                letterSpacing: "0.26em",
                color: "#8A8A93",
              }}
            >
              CHAT
            </div>
            {settings.showViewerCount && (
              <div
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 20,
                  color: "#FF3B3B",
                }}
              >
                {viewers || 248} WATCHING
              </div>
            )}
          </div>
          <ChatFeed
            messages={messages}
            fallback={[
              { author: "smokecriminal", message: "that clutch was insane" },
              { author: "nadeking", message: "rank up when" },
              {
                author: "mirage_enjoyer",
                message: "drop the crosshair code",
              },
            ]}
          />
          {settings.showLatestSubscriber && latestSubscriber && (
            <div
              style={{
                padding: "18px 28px",
                borderTop: "1px solid rgba(255,255,255,.1)",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 18,
                color: "#8A8A93",
              }}
            >
              LATEST ·{" "}
              <span style={{ color: "#fff", fontWeight: 600 }}>
                {latestSubscriber}
              </span>
            </div>
          )}
        </div>
      )}

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
            items={global.socials
              .filter((s) => ["TWITCH", "TIKTOK"].includes(s.label))
              .slice(0, 2)}
            gap={28}
            fontSize={24}
          />
        </div>
      )}
    </div>
  );
}
