import { promises as fs } from "fs";
import path from "path";
import {
  isRemoteStorageConfigured,
  STORAGE_KEYS,
  storageDel,
  storageGetJson,
  storageSetJson,
} from "../storage/redis";

const DATA_DIR = path.join(process.cwd(), "data");
const TOKEN_PATH = path.join(DATA_DIR, "youtube-token.json");

export type YouTubeToken = {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  token_type?: string;
  scope?: string;
};

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
].join(" ");

const globalForToken = globalThis as unknown as {
  __teyeYouTubeToken?: YouTubeToken | null;
};

export function getOAuthConfig() {
  const clientId = process.env.YOUTUBE_CLIENT_ID ?? "";
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET ?? "";
  const redirectUri =
    process.env.YOUTUBE_REDIRECT_URI ??
    "http://localhost:3000/api/youtube/oauth/callback";
  return {
    clientId,
    clientSecret,
    redirectUri,
    configured: Boolean(clientId && clientSecret),
  };
}

export function buildAuthUrl(state = "teye") {
  const { clientId, redirectUri } = getOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<YouTubeToken> {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type?: string;
    scope?: string;
  };
  const existing = await readToken();
  const token: YouTubeToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? existing?.refresh_token ?? "",
    expiry_date: Date.now() + data.expires_in * 1000,
    token_type: data.token_type,
    scope: data.scope,
  };
  if (!token.refresh_token) {
    throw new Error(
      "No refresh token returned. Revoke app access and reconnect.",
    );
  }
  await writeToken(token);
  return token;
}

export async function refreshAccessToken(
  token: YouTubeToken,
): Promise<YouTubeToken> {
  const { clientId, clientSecret } = getOAuthConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: token.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${text}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
    token_type?: string;
    scope?: string;
  };
  const next: YouTubeToken = {
    ...token,
    access_token: data.access_token,
    expiry_date: Date.now() + data.expires_in * 1000,
    token_type: data.token_type ?? token.token_type,
    scope: data.scope ?? token.scope,
  };
  await writeToken(next);
  return next;
}

export async function readToken(): Promise<YouTubeToken | null> {
  if (globalForToken.__teyeYouTubeToken) {
    return globalForToken.__teyeYouTubeToken;
  }

  if (isRemoteStorageConfigured()) {
    const token = await storageGetJson<YouTubeToken>(STORAGE_KEYS.youtubeToken);
    if (token?.refresh_token) {
      globalForToken.__teyeYouTubeToken = token;
      return token;
    }
    return null;
  }

  try {
    const raw = await fs.readFile(TOKEN_PATH, "utf8");
    const token = JSON.parse(raw) as YouTubeToken;
    globalForToken.__teyeYouTubeToken = token;
    return token;
  } catch {
    return null;
  }
}

export async function writeToken(token: YouTubeToken) {
  globalForToken.__teyeYouTubeToken = token;

  if (isRemoteStorageConfigured()) {
    try {
      await storageSetJson(STORAGE_KEYS.youtubeToken, token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[youtube] redis token persist failed: ${msg}`);
    }
    return;
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${TOKEN_PATH}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(token, null, 2), "utf8");
    await fs.rename(tmp, TOKEN_PATH);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[youtube] token persist failed (read-only or missing FS): ${msg}`,
    );
  }
}

export async function clearToken() {
  globalForToken.__teyeYouTubeToken = null;

  if (isRemoteStorageConfigured()) {
    await storageDel(STORAGE_KEYS.youtubeToken);
    return;
  }

  try {
    await fs.unlink(TOKEN_PATH);
  } catch {
    // ignore
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  let token = await readToken();
  if (!token) return null;
  if (token.expiry_date < Date.now() + 60_000) {
    token = await refreshAccessToken(token);
  }
  return token.access_token;
}

export async function getYouTubeStatus() {
  const config = getOAuthConfig();
  const token = await readToken();
  return {
    configured: config.configured,
    connected: Boolean(token?.refresh_token),
    expiryDate: token?.expiry_date ?? null,
    redirectUri: config.redirectUri,
  };
}
