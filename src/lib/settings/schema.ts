import { z } from "zod";

const socialItemSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const globalSettingsSchema = z.object({
  brand: z.string().default("TEYE"),
  handle: z.string().default("@TEYEcs"),
  socials: z
    .array(socialItemSchema)
    .default([
      { label: "TWITCH", value: "TEYECS" },
      { label: "YOUTUBE", value: "@TEYECS" },
      { label: "TIKTOK", value: "@TEYECS" },
      { label: "INSTAGRAM", value: "@TEYECS" },
    ]),
  gameMode: z.enum(["CS2", "Neutral"]).default("CS2"),
  gameLabelCs2: z.string().default("// CS2 PREMIER — SEASON 5"),
  gameLabelNeutral: z.string().default("// TONIGHT — VARIETY"),
  streamTitleCs2: z.string().default("CS2 PREMIER GRIND — S5"),
  streamTitleNeutral: z.string().default("CHILL VARIETY NIGHT"),
  viewerMode: z.enum(["sum", "primary", "horizontal", "vertical"]).default("sum"),
  chatPollIntervalMs: z.number().int().min(5000).max(60000).default(15000),
  viewersPollIntervalMs: z.number().int().min(5000).max(60000).default(20000),
  subscribersPollIntervalMs: z.number().int().min(15000).max(300000).default(60000),
  broadcastDiscoveryIntervalMs: z.number().int().min(15000).max(300000).default(30000),
  verticalSafeAreaPx: z.number().int().min(0).max(700).default(312),
});

export const startingSoonSchema = z.object({
  showScanlines: z.boolean().default(true),
  showGrid: z.boolean().default(true),
  showGlow: z.boolean().default(true),
  headlineLine1: z.string().default("STARTING"),
  headlineLine2: z.string().default("SOON"),
  tagline: z
    .string()
    .default("settling in, checking audio — grab a drink, we go live in a moment ✌"),
  taglineVertical: z
    .string()
    .default("settling in, checking audio — we go live in a moment ✌"),
  showCountdown: z.boolean().default(true),
  countdownLabel: z.string().default("STARTING IN"),
  countdownTarget: z.string().nullable().default(null),
  countdownFallback: z.string().default("04:32"),
  showInfoRows: z.boolean().default(true),
  infoRows: z
    .array(z.object({ label: z.string(), value: z.string(), accent: z.boolean().default(false) }))
    .default([
      { label: "TONIGHT", value: "PREMIER GRIND", accent: false },
      { label: "GOAL", value: "20K RATING", accent: true },
    ]),
  showTicker: z.boolean().default(true),
  standbyText: z.string().default("STANDBY"),
  tickerItems: z
    .array(z.string())
    .default([
      "TWITCH / TEYECS",
      "YOUTUBE / @TEYECS",
      "TIKTOK / @TEYECS",
      "INSTAGRAM / @TEYECS",
    ]),
  overrideGameLabel: z.string().nullable().default(null),
});

export const liveSchema = z.object({
  transparentBackground: z.boolean().default(true),
  showTopBar: z.boolean().default(true),
  showLiveBadge: z.boolean().default(true),
  liveBadgeText: z.string().default("LIVE"),
  showTitle: z.boolean().default(true),
  showUptime: z.boolean().default(true),
  uptimePrefix: z.string().default("UPTIME"),
  showBrand: z.boolean().default(true),
  overrideTitle: z.string().nullable().default(null),
  showStatsRail: z.boolean().default(false),
  showRating: z.boolean().default(false),
  showKd: z.boolean().default(false),
  showHs: z.boolean().default(false),
  showSession: z.boolean().default(false),
  ratingLabel: z.string().default("PREMIER RATING"),
  ratingLabelVertical: z.string().default("RATING"),
  kdLabel: z.string().default("K / D"),
  hsLabel: z.string().default("HS %"),
  sessionHeading: z.string().default("SESSION"),
  killsLabel: z.string().default("KILLS"),
  deathsLabel: z.string().default("DEATHS"),
  wlLabel: z.string().default("W / L"),
  rating: z.string().default("19,240"),
  ratingDelta: z.string().default("+180"),
  kd: z.string().default("1.50"),
  hs: z.string().default("61"),
  kills: z.string().default("42"),
  deaths: z.string().default("28"),
  wl: z.string().default("6 / 2"),
  showFacecam: z.boolean().default(true),
  facecamWidth: z.number().default(520),
  facecamHeight: z.number().default(293),
  facecamWidthVertical: z.number().default(1008),
  facecamHeightVertical: z.number().default(576),
  showFacecamLabel: z.boolean().default(true),
  facecamLabel: z.string().default("FACECAM"),
  showAudioBars: z.boolean().default(true),
  showBottomBar: z.boolean().default(true),
  showSocials: z.boolean().default(true),
  commandsText: z.string().default("!drops · !crosshair · !rank"),
  commandsTextVertical: z.string().default("!rank"),
  showGameCapture: z.boolean().default(true),
  showGameCaptureGuide: z.boolean().default(true),
  gameCaptureLabel: z.string().default("GAME CAPTURE"),
  gameCaptureWidthVertical: z.number().default(1008),
  gameCaptureHeightVertical: z.number().default(702),
});

export const brbSchema = z.object({
  showScanlines: z.boolean().default(true),
  showGlow: z.boolean().default(true),
  showPulseRing: z.boolean().default(true),
  showSweepBar: z.boolean().default(true),
  kicker: z.string().default("STREAM PAUSED"),
  headlineLine1: z.string().default("BE RIGHT"),
  headlineLine2: z.string().default("BACK"),
  headlineVerticalLines: z
    .array(z.string())
    .default(["BE", "RIGHT", "BACK"]),
  subtext: z.string().default("back in a sec ✌ — don't go anywhere"),
  subtextVertical: z.string().default("back in a sec ✌"),
  showCornerNote: z.boolean().default(true),
  cornerNote: z.string().default("chat's still open — keep talking"),
  showSocials: z.boolean().default(true),
});

export const justChattingSchema = z.object({
  showCameraFrame: z.boolean().default(true),
  showCameraLabel: z.boolean().default(true),
  cameraLabel: z.string().default("CAMERA"),
  showChatPanel: z.boolean().default(true),
  chatPanelLabel: z.string().default("CHAT"),
  showViewerCount: z.boolean().default(true),
  watchingSuffix: z.string().default("WATCHING"),
  showLatestSubscriber: z.boolean().default(true),
  latestFollowerLabel: z.string().default("LATEST FOLLOWER"),
  latestFollowerLabelShort: z.string().default("LATEST"),
  latestSubscriberFallback: z.string().default(""),
  showAgenda: z.boolean().default(true),
  agendaKicker: z.string().default("TODAY"),
  agendaText: z.string().default("warmup chat → premier queue → viewer 10-mans"),
  maxMessages: z.number().int().min(1).max(20).default(6),
  hideBotMessages: z.boolean().default(true),
  hideCommandMessages: z.boolean().default(true),
  showSocials: z.boolean().default(true),
  badgeText: z.string().default("JUST CHATTING"),
});

export const endingSchema = z.object({
  showScanlines: z.boolean().default(true),
  headlineLine1: z.string().default("THANKS FOR"),
  headlineLine2: z.string().default("HANGING OUT"),
  headlineVerticalLines: z
    .array(z.string())
    .default(["THANKS", "FOR", "HANGING", "OUT"]),
  subtext: z
    .string()
    .default("that was a good one — clips go up on YouTube tomorrow ✌"),
  subtextVertical: z.string().default("clips go up on YouTube tomorrow ✌"),
  showNextStream: z.boolean().default(true),
  nextStreamLabel: z.string().default("NEXT STREAM"),
  nextStreamValue: z.string().default("Tomorrow · 8 PM"),
  showSession: z.boolean().default(true),
  sessionLabel: z.string().default("SESSION"),
  sessionValue: z.string().default("6W · 2L · +180"),
  showSocials: z.boolean().default(true),
  socialsHeading: z.string().default("FIND ME EVERYWHERE"),
  kicker: z.string().default("GG · STREAM OVER"),
});

export const appSettingsSchema = z.object({
  global: globalSettingsSchema.default(() => globalSettingsSchema.parse({})),
  scenes: z
    .object({
      "starting-soon": startingSoonSchema.default(() =>
        startingSoonSchema.parse({}),
      ),
      live: liveSchema.default(() => liveSchema.parse({})),
      brb: brbSchema.default(() => brbSchema.parse({})),
      "just-chatting": justChattingSchema.default(() =>
        justChattingSchema.parse({}),
      ),
      ending: endingSchema.default(() => endingSchema.parse({})),
    })
    .default(() => ({
      "starting-soon": startingSoonSchema.parse({}),
      live: liveSchema.parse({}),
      brb: brbSchema.parse({}),
      "just-chatting": justChattingSchema.parse({}),
      ending: endingSchema.parse({}),
    })),
});

export type GlobalSettings = z.infer<typeof globalSettingsSchema>;
export type StartingSoonSettings = z.infer<typeof startingSoonSchema>;
export type LiveSettings = z.infer<typeof liveSchema>;
export type BrbSettings = z.infer<typeof brbSchema>;
export type JustChattingSettings = z.infer<typeof justChattingSchema>;
export type EndingSettings = z.infer<typeof endingSchema>;
export type AppSettings = z.infer<typeof appSettingsSchema>;

export type SceneSettingsMap = AppSettings["scenes"];

export function defaultSettings(): AppSettings {
  return appSettingsSchema.parse({});
}

export function resolveGameLabel(global: GlobalSettings): string {
  return global.gameMode === "Neutral"
    ? global.gameLabelNeutral
    : global.gameLabelCs2;
}

export function resolveStreamTitle(global: GlobalSettings): string {
  return global.gameMode === "Neutral"
    ? global.streamTitleNeutral
    : global.streamTitleCs2;
}
