import type { CSSProperties } from "react";
import type { GlobalSettings } from "@/lib/settings/schema";

/** Mirrors SIZES.vertical in SceneCanvas. */
export const VERTICAL_CANVAS = { width: 1080, height: 1920 } as const;

type VerticalPaddingScene = {
  verticalExtraTopPx: number;
  verticalExtraSidePx: number;
  /** When true (Live only), content extends to the canvas bottom. */
  ignoreGlobalBottomSafeArea?: boolean;
};

export type VerticalLayout = {
  topPx: number;
  bottomPx: number;
  sidePx: number;
  boxStyle: CSSProperties;
  /** Usable width inside the safe-area box after an additional inner inset on each side. */
  contentWidth: (innerInsetPx?: number) => number;
  /**
   * Clamp a fixed frame to the available width (after side padding + inner inset).
   * Configured width is the maximum; height scales proportionally when clamped.
   */
  frameSize: (
    width: number,
    height: number,
    innerInsetPx?: number,
  ) => { width: number; height: number };
};

/**
 * Resolve global + per-scene vertical padding into a safe-area box and frame clamp helpers.
 * Total top/side = global + scene extra (additive). Height shrinks so the bottom chat
 * safe strip is always respected.
 */
export function resolveVerticalLayout(
  global: GlobalSettings,
  scene: VerticalPaddingScene,
): VerticalLayout {
  const topPx = global.verticalTopSafeAreaPx + scene.verticalExtraTopPx;
  const sidePx = global.verticalSidePaddingPx + scene.verticalExtraSidePx;
  const bottomPx = scene.ignoreGlobalBottomSafeArea
    ? 0
    : global.verticalSafeAreaPx;
  const heightPx = Math.max(0, VERTICAL_CANVAS.height - topPx - bottomPx);

  const contentWidth = (innerInsetPx = 0) =>
    Math.max(0, VERTICAL_CANVAS.width - 2 * sidePx - 2 * innerInsetPx);

  const frameSize = (width: number, height: number, innerInsetPx = 0) => {
    const avail = contentWidth(innerInsetPx);
    if (width <= 0 || avail >= width) return { width, height };
    const scale = avail / width;
    return { width: avail, height: Math.round(height * scale) };
  };

  return {
    topPx,
    bottomPx,
    sidePx,
    boxStyle: {
      position: "absolute",
      left: sidePx,
      right: sidePx,
      top: topPx,
      height: heightPx,
    },
    contentWidth,
    frameSize,
  };
}
