import { NextResponse } from "next/server";
import { buildAuthUrl, getOAuthConfig } from "@/lib/youtube/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getOAuthConfig();
  if (!config.configured) {
    return NextResponse.json(
      {
        error:
          "Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env.local first.",
      },
      { status: 400 },
    );
  }
  return NextResponse.redirect(buildAuthUrl());
}
