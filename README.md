# TEYE Stream Overlays

Next.js OBS browser sources for TEYE — five scenes in both **1920×1080** and **1080×1920**, each with its own settings page, live SSE updates, and optional YouTube Data API integration (viewers, chat, latest subscriber, real uptime).

## Quick start

```bash
npm install
cp .env.example .env.local   # optional, for YouTube
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server binds to `0.0.0.0` so you can also open it from your phone at `http://<your-pc-lan-ip>:3000/control`.

## OBS setup

1. Add a **Browser** source.
2. Set Width / Height to `1920` × `1080` (desktop) or `1080` × `1920` (mobile/vertical).
3. Copy a scene URL from the dashboard, e.g.:
   - `http://localhost:3000/scene/starting-soon?o=h`
   - `http://localhost:3000/scene/live?o=v`
4. For **Live / Gaming**, keep transparency enabled (default) and place the browser source above your game capture.
5. Leave the app running while you stream. Settings changes push to OBS instantly over SSE — no refresh needed.

`?o=h` / `?o=v` force orientation. Without the query param, orientation follows the browser source aspect ratio.

## Scenes

| Scene | Path | Notes |
| --- | --- | --- |
| Starting Soon | `/scene/starting-soon` | Countdown + ticker |
| Live / Gaming | `/scene/live` | Transparent overlay |
| Be Right Back | `/scene/brb` | Pause interstitial |
| Just Chatting | `/scene/just-chatting` | Camera + chat |
| Stream Ending | `/scene/ending` | Thanks + socials |

Per-scene settings: `/settings/[scene]`  
Global brand / YouTube: `/settings/global`  
Phone control panel: `/control`

## YouTube live data

1. Create a Google Cloud project and enable **YouTube Data API v3**.
2. Create an OAuth 2.0 **Web** client.
3. Add authorized redirect URI: `http://localhost:3000/api/youtube/oauth/callback`
4. Put `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` in `.env.local`.
5. Open `/settings/global` → **Connect YouTube**.

The server runs a **single poller** shared by all open scenes (so quota is not multiplied by horizontal + vertical sources). Chat defaults to ~15s polling to stay within the 10,000 unit/day quota for a multi-hour stream. The dashboard and control panel show a live quota meter.

## Stack

- Next.js App Router + TypeScript + Tailwind v4
- Zod-validated settings in `data/settings.json`
- SSE at `/api/live`
- Fonts: Chakra Petch + JetBrains Mono (self-hosted via `next/font`)
