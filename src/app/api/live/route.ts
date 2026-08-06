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

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;
  let cleanedUp = false;
  let clientRegistered = false;
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const teardown = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    closed = true;
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    unsubscribe?.();
    unsubscribe = null;
    if (clientRegistered) {
      clientRegistered = false;
      removeLiveClient();
    }
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(encode(event, data)));
        } catch {
          teardown();
        }
      };

      const live = await addLiveClient();
      clientRegistered = true;

      if (closed) {
        teardown();
        return;
      }

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

      if (closed) return;

      const onAny = (msg: unknown) => {
        const { event, payload } = msg as { event: BusEvent; payload: unknown };
        send(event, payload);
      };
      unsubscribe = bus.on("*", onAny);

      heartbeat = setInterval(() => {
        send("ping", { t: Date.now() });
      }, 15000);

      if (req.signal.aborted) {
        teardown();
        return;
      }
      req.signal.addEventListener("abort", teardown, { once: true });
    },
    cancel() {
      teardown();
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
