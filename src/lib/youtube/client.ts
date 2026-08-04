import { getValidAccessToken } from "./oauth";
import { recordQuota } from "./quota";
import type { LiveBroadcastInfo, LiveChatMessage } from "../sse/bus";

const YT = "https://www.googleapis.com/youtube/v3";

async function ytFetch(url: string, op: Parameters<typeof recordQuota>[0]) {
  const token = await getValidAccessToken();
  if (!token) throw new Error("YouTube not connected");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await recordQuota(op);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API ${res.status}: ${text}`);
  }
  return res.json();
}

function guessOrientation(title: string): LiveBroadcastInfo["orientationHint"] {
  const t = title.toLowerCase();
  if (/(vertical|mobile|shorts|portrait|9\s*[:x]\s*16)/.test(t)) return "vertical";
  if (/(horizontal|desktop|landscape|16\s*[:x]\s*9)/.test(t)) return "horizontal";
  return "unknown";
}

export async function listActiveBroadcasts(): Promise<LiveBroadcastInfo[]> {
  const data = (await ytFetch(
    `${YT}/liveBroadcasts?part=snippet,contentDetails,status&broadcastStatus=active&broadcastType=all&maxResults=10`,
    "liveBroadcastsList",
  )) as {
    items?: Array<{
      id: string;
      snippet?: {
        title?: string;
        actualStartTime?: string;
        liveChatId?: string;
      };
      contentDetails?: { boundStreamId?: string };
    }>;
  };

  return (data.items ?? []).map((item) => ({
    id: item.id,
    title: item.snippet?.title ?? "Untitled",
    liveChatId: item.snippet?.liveChatId ?? null,
    actualStartTime: item.snippet?.actualStartTime ?? null,
    concurrentViewers: 0,
    orientationHint: guessOrientation(item.snippet?.title ?? ""),
  }));
}

export async function fetchViewerCounts(
  videoIds: string[],
): Promise<Record<string, number>> {
  if (videoIds.length === 0) return {};
  const data = (await ytFetch(
    `${YT}/videos?part=liveStreamingDetails&id=${videoIds.join(",")}`,
    "videosList",
  )) as {
    items?: Array<{
      id: string;
      liveStreamingDetails?: { concurrentViewers?: string };
    }>;
  };
  const out: Record<string, number> = {};
  for (const item of data.items ?? []) {
    out[item.id] = Number(item.liveStreamingDetails?.concurrentViewers ?? 0);
  }
  return out;
}

export async function fetchChatMessages(
  liveChatId: string,
  pageToken?: string | null,
): Promise<{
  messages: LiveChatMessage[];
  nextPageToken: string | null;
  pollingIntervalMillis: number;
}> {
  const params = new URLSearchParams({
    part: "snippet,authorDetails",
    liveChatId,
    maxResults: "50",
  });
  if (pageToken) params.set("pageToken", pageToken);
  const data = (await ytFetch(
    `${YT}/liveChatMessages?${params.toString()}`,
    "liveChatMessagesList",
  )) as {
    nextPageToken?: string;
    pollingIntervalMillis?: number;
    items?: Array<{
      id: string;
      snippet?: {
        displayMessage?: string;
        publishedAt?: string;
        type?: string;
      };
      authorDetails?: {
        displayName?: string;
        isChatModerator?: boolean;
        isChatOwner?: boolean;
        isChatSponsor?: boolean;
      };
    }>;
  };

  const messages: LiveChatMessage[] = (data.items ?? [])
    .filter((item) => item.snippet?.type === "textMessageEvent" || !item.snippet?.type)
    .map((item) => ({
      id: item.id,
      author: item.authorDetails?.displayName ?? "Unknown",
      message: item.snippet?.displayMessage ?? "",
      publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
      isModerator: item.authorDetails?.isChatModerator,
      isOwner: item.authorDetails?.isChatOwner,
      isMember: item.authorDetails?.isChatSponsor,
    }))
    .filter((m) => m.message.length > 0);

  return {
    messages,
    nextPageToken: data.nextPageToken ?? null,
    pollingIntervalMillis: data.pollingIntervalMillis ?? 15000,
  };
}

export async function fetchLatestSubscriber(): Promise<string | null> {
  const data = (await ytFetch(
    `${YT}/subscriptions?part=subscriberSnippet&myRecentSubscribers=true&maxResults=1`,
    "subscriptionsList",
  )) as {
    items?: Array<{
      subscriberSnippet?: { title?: string };
    }>;
  };
  return data.items?.[0]?.subscriberSnippet?.title ?? null;
}
