import { NextRequest } from "next/server";
import { bus, type BusEvent } from "@/lib/sse/bus";
import {
  getSettingsStorageBackend,
  readSettings,
} from "@/lib/settings/store";
import { getQuota } from "@/lib/youtube/quota";
import { getYouTubeStatus } from "@/lib/youtube/oauth";
import {
  addLiveClient,
  getClientCount,
  removeLiveClient,
} from "@/lib/youtube/poller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function encode(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(encode(event, data)));
        } catch {
          // closed
        }
      };

      const live = addLiveClient();
      const [settings, quota, youtube] = await Promise.all([
        readSettings(),
        getQuota(),
        getYouTubeStatus(),
      ]);

      send("snapshot", {
        settings,
        live,
        quota,
        youtube,
        clients: getClientCount(),
        storage: getSettingsStorageBackend(),
      });

      const onAny = (msg: unknown) => {
        const { event, payload } = msg as { event: BusEvent; payload: unknown };
        send(event, payload);
      };
      unsubscribe = bus.on("*", onAny);

      heartbeat = setInterval(() => {
        send("ping", { t: Date.now() });
      }, 15000);
    },
    cancel() {
      closed = true;
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
      removeLiveClient();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
