import { NextResponse } from "next/server";
import {
  clearToken,
  getYouTubeStatus,
} from "@/lib/youtube/oauth";
import { bus } from "@/lib/sse/bus";
import { getQuota } from "@/lib/youtube/quota";
import { getClientCount, getLiveSnapshot } from "@/lib/youtube/poller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [youtube, quota] = await Promise.all([getYouTubeStatus(), getQuota()]);
  return NextResponse.json({
    youtube,
    quota,
    live: getLiveSnapshot(),
    clients: getClientCount(),
  });
}

export async function DELETE() {
  await clearToken();
  const youtube = await getYouTubeStatus();
  bus.emit("youtube-status", youtube);
  return NextResponse.json({ ok: true, youtube });
}
