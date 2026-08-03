export const SCENE_IDS = [
  "starting-soon",
  "live",
  "brb",
  "just-chatting",
  "ending",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export const SCENE_META: Record<
  SceneId,
  { label: string; number: string; description: string }
> = {
  "starting-soon": {
    label: "Starting Soon",
    number: "01",
    description: "Pre-stream countdown with social ticker",
  },
  live: {
    label: "Live / Gaming",
    number: "02",
    description: "Transparent in-game overlay",
  },
  brb: {
    label: "Be Right Back",
    number: "03",
    description: "Stream paused interstitial",
  },
  "just-chatting": {
    label: "Just Chatting",
    number: "04",
    description: "Camera + chat panel layout",
  },
  ending: {
    label: "Stream Ending",
    number: "05",
    description: "Thanks + next stream cards",
  },
};

export function isSceneId(value: string): value is SceneId {
  return (SCENE_IDS as readonly string[]).includes(value);
}
