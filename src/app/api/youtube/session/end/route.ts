import { NextResponse } from "next/server";
import { endLiveSession } from "@/lib/youtube/poller";
import { getYouTubeStatus } from "@/lib/youtube/oauth";
import { getQuota } from "@/lib/youtube/quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const result = await endLiveSession();
  const [youtube, quota] = await Promise.all([getYouTubeStatus(), getQuota()]);
  return NextResponse.json({ ...result, youtube, quota });
}
