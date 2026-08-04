"use client";

import { SceneCanvas, useOrientation } from "@/components/SceneCanvas";
import type { SceneId } from "@/lib/scenes";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import {
  StartingSoonHorizontal,
  StartingSoonVertical,
} from "@/components/scenes/starting-soon";
import { LiveHorizontal, LiveVertical } from "@/components/scenes/live";
import { BrbHorizontal, BrbVertical } from "@/components/scenes/brb";
import {
  JustChattingHorizontal,
  JustChattingVertical,
} from "@/components/scenes/just-chatting";
import {
  EndingHorizontal,
  EndingVertical,
} from "@/components/scenes/ending";

export function SceneView({
  scene,
  forceOrientation,
  preview = false,
}: {
  scene: SceneId;
  forceOrientation?: string | null;
  preview?: boolean;
}) {
  const orientation = useOrientation(forceOrientation);
  const { data, ready } = useLiveFeed();

  if (!ready) {
    return (
      <div
        className={preview ? "" : "scene-root opaque"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: preview ? "100%" : undefined,
          height: preview ? "100%" : undefined,
          fontFamily: "var(--font-jetbrains), monospace",
          letterSpacing: "0.2em",
          color: "#8A8A93",
        }}
      >
        LOADING…
      </div>
    );
  }

  const { settings, live } = data;
  const transparent =
    !preview &&
    ((scene === "live" && settings.scenes.live.transparentBackground) ||
      (scene === "just-chatting" &&
        settings.scenes["just-chatting"].transparentBackground));

  const content =
    scene === "starting-soon" ? (
      orientation === "horizontal" ? (
        <StartingSoonHorizontal
          global={settings.global}
          settings={settings.scenes["starting-soon"]}
        />
      ) : (
        <StartingSoonVertical
          global={settings.global}
          settings={settings.scenes["starting-soon"]}
        />
      )
    ) : scene === "live" ? (
      orientation === "horizontal" ? (
        <LiveHorizontal
          global={settings.global}
          settings={settings.scenes.live}
          uptimeSeconds={live.uptimeSeconds}
          streamTitle={live.streamTitle}
        />
      ) : (
        <LiveVertical
          global={settings.global}
          settings={settings.scenes.live}
          uptimeSeconds={live.uptimeSeconds}
          streamTitle={live.streamTitle}
        />
      )
    ) : scene === "brb" ? (
      orientation === "horizontal" ? (
        <BrbHorizontal
          global={settings.global}
          settings={settings.scenes.brb}
        />
      ) : (
        <BrbVertical global={settings.global} settings={settings.scenes.brb} />
      )
    ) : scene === "just-chatting" ? (
      orientation === "horizontal" ? (
        <JustChattingHorizontal
          global={settings.global}
          settings={settings.scenes["just-chatting"]}
          viewers={live.viewers}
          latestSubscriber={live.latestSubscriber}
          chat={live.chat}
        />
      ) : (
        <JustChattingVertical
          global={settings.global}
          settings={settings.scenes["just-chatting"]}
          viewers={live.viewers}
          latestSubscriber={live.latestSubscriber}
          chat={live.chat}
        />
      )
    ) : orientation === "horizontal" ? (
      <EndingHorizontal
        global={settings.global}
        settings={settings.scenes.ending}
      />
    ) : (
      <EndingVertical
        global={settings.global}
        settings={settings.scenes.ending}
      />
    );

  if (preview) {
    return (
      <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
        <SceneCanvas
          orientation={orientation}
          transparent={false}
          fitContainer
        >
          {content}
        </SceneCanvas>
      </div>
    );
  }

  return (
    <SceneCanvas orientation={orientation} transparent={transparent}>
      {content}
    </SceneCanvas>
  );
}
