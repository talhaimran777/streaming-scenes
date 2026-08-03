import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { exchangeCode, getYouTubeStatus } from "@/lib/youtube/oauth";
import { bus } from "@/lib/sse/bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  if (error) {
    redirect(`/settings/global?yt=error&msg=${encodeURIComponent(error)}`);
  }
  if (!code) {
    redirect("/settings/global?yt=error&msg=missing_code");
  }

  let failure: string | null = null;
  try {
    await exchangeCode(code);
    const status = await getYouTubeStatus();
    bus.emit("youtube-status", status);
  } catch (err) {
    failure = err instanceof Error ? err.message : String(err);
  }

  if (failure) {
    redirect(`/settings/global?yt=error&msg=${encodeURIComponent(failure)}`);
  }
  redirect("/settings/global?yt=connected");
}
