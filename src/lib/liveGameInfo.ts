export const remoteLiveGameInfoUrl = "https://rm-static.djicdn.com/live_json/live_game_info.json";
export const proxyLiveGameInfoUrl = "/api/live-game-info";
export const fallbackLiveGameInfoUrl = "/live_game_info_国赛2.json";

export type LiveInfoSource = "remote" | "proxy" | "fallback";

export type LiveGameInfo = {
  eventName?: string;
  eventData?: LiveZone[];
};

export type LiveZone = {
  zoneId?: string;
  zoneName?: string;
  zoneDate?: string[];
  liveState?: number;
  matchState?: number;
  videos?: ReplayVideo[] | null;
  zoneLiveString?: StreamItem[] | null;
  fpvData?: FpvItem[] | null;
};

type ReplayVideo = {
  content?: {
    title1?: string;
    main_source_url?: string;
  };
};

type StreamItem = {
  label?: string;
  src?: string;
  res?: string;
};

type FpvItem = {
  role?: string;
  sources?: StreamItem[];
};

export type VideoSource = {
  label: string;
  url: string;
  kind: "live" | "fpv" | "replay";
  zoneName?: string;
};

async function fetchJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} request failed: ${response.status}`);
  }
  return await response.json();
}

export async function loadLiveGameInfo(): Promise<{ data: LiveGameInfo; source: LiveInfoSource }> {
  const endpoints: { url: string; source: LiveInfoSource }[] = [
    { url: remoteLiveGameInfoUrl, source: "remote" },
    { url: proxyLiveGameInfoUrl, source: "proxy" },
    { url: fallbackLiveGameInfoUrl, source: "fallback" },
  ];
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      return { data: await fetchJson(endpoint.url), source: endpoint.source };
    } catch (error) {
      lastError = error;
      console.warn(`Failed to fetch live info from ${endpoint.url}.`, error);
    }
  }

  throw lastError;
}

export function getZoneSources(zone: LiveZone): VideoSource[] {
  const sources: VideoSource[] = [];
  const zoneName = zone.zoneName ?? "未知赛区";
  const videos = Array.isArray(zone.videos) ? zone.videos : [];
  const zoneLiveString = Array.isArray(zone.zoneLiveString) ? zone.zoneLiveString : [];
  const fpvData = Array.isArray(zone.fpvData) ? zone.fpvData : [];

  for (const video of videos) {
    if (video.content?.title1 && video.content?.main_source_url) {
      sources.push({
        label: video.content.title1,
        url: video.content.main_source_url,
        kind: "replay",
        zoneName,
      });
    }
  }

  for (const item of zoneLiveString) {
    if (item?.label && item?.src) {
      sources.push({
        label: `主视角 ${item.label}`,
        url: item.src,
        kind: "live",
        zoneName,
      });
    }
  }

  for (const item of fpvData) {
    const firstSource = item?.sources?.[0];
    if (item?.role && firstSource?.src) {
      sources.push({
        label: item.role,
        url: firstSource.src,
        kind: "fpv",
        zoneName,
      });
    }
  }

  return sources;
}
