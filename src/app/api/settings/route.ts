import { NextRequest, NextResponse } from "next/server";
import {
  patchGlobal,
  patchScene,
  readSettings,
  writeSettings,
} from "@/lib/settings/store";
import { appSettingsSchema } from "@/lib/settings/schema";
import { isSceneId } from "@/lib/scenes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = appSettingsSchema.parse(body);
    const settings = await writeSettings(parsed);
    return NextResponse.json(settings);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.global) {
      const settings = await patchGlobal(body.global);
      return NextResponse.json(settings);
    }
    if (body.scene && isSceneId(body.scene) && body.patch) {
      const settings = await patchScene(body.scene, body.patch);
      return NextResponse.json(settings);
    }
    if (body.settings) {
      const settings = await writeSettings(
        appSettingsSchema.parse(body.settings),
      );
      return NextResponse.json(settings);
    }
    return NextResponse.json({ error: "Invalid patch body" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
