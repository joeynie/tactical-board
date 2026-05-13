import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

// 可选视频源
const videoRecord: { label: string; url: string }[] = [];
const remoteLiveGameInfoUrl = "https://rm-static.djicdn.com/live_json/live_game_info.json";
const proxyLiveGameInfoUrl = "/api/live-game-info";
const fallbackLiveGameInfoUrl = "/live_game_info_国赛2.json";

async function fetchJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} request failed: ${response.status}`);
  }
  return await response.json();
}

async function fetchLiveGameInfo() {
  const urls = [remoteLiveGameInfoUrl, proxyLiveGameInfoUrl, fallbackLiveGameInfoUrl];
  let lastError: unknown;

  for (const url of urls) {
    try {
      return await fetchJson(url);
    } catch (error) {
      lastError = error;
      console.warn(`Failed to fetch live info from ${url}.`, error);
    }
  }

  throw lastError;
}

export default function Live() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSources, setVideoSources] = useState<{ label: string; url: string }[]>(videoRecord);
  const [src, setSrc] = useState("");
  const [zoneName, setZoneName] = useState("全国赛");
  const [zoneList, setZoneList] = useState<string[]>([]); 

  useEffect(() => {
    let cancelled = false;

    fetchLiveGameInfo()
      .then(data => {
        if (cancelled) return;

        const sources: { label: string; url: string }[] = [];
        const newZoneList: string[] = []; 
        for (const zone of data.eventData) {
          newZoneList.push(zone.zoneName);
          if (zone.zoneName === zoneName) {
            const videos = Array.isArray(zone.videos) ? zone.videos : [];
            const zoneLiveString = Array.isArray(zone.zoneLiveString) ? zone.zoneLiveString : [];
            const fpvData = Array.isArray(zone.fpvData) ? zone.fpvData : [];

            if (videos.length > 0) { // 回放
              for (const video of videos) {
                if (video.content?.title1 && video.content?.main_source_url) {
                  sources.push({ label: video.content.title1, url: video.content.main_source_url });
                }
              }
            }

            if (zoneLiveString.length > 0 || fpvData.length > 0){ // 直播
              console.log("zoneLiveString:", zoneLiveString);
              console.log("fpvData:", fpvData);

              for (const item of zoneLiveString) {
                if (item && item.src && item.label) {
                  sources.push({ label: item.label, url: item.src });
                }
              }
              for (const item of fpvData) {
                if (item && item.sources?.[0]?.src && item.role) {
                  sources.push({ label: item.role, url: item.sources[0].src });
                }
              }
            }

            setVideoSources([...videoRecord, ...sources]);
            setSrc(sources[0]?.url ?? "");
          }
        }
        setZoneList(newZoneList);
      })
      .catch(error => {
        console.error("Failed to load live game info.", error);
      });

    return () => {
      cancelled = true;
    };
    
  }, [zoneName]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls: Hls | null = null;

    if (src.endsWith(".m3u8") || src.includes(".m3u8?")) {
      if (Hls.isSupported()) {
        hls = new Hls({
          liveSyncDurationCount: 3, // 只缓存 3 个 segment
          maxLiveSyncPlaybackRate: 1.5, // 网络追不上的时候加快播放速度
          maxBufferLength: 10, // 最多缓存 10 秒
          enableWorker: true, // 开启 web worker 加速
          lowLatencyMode: true, //  低延迟模式
          backBufferLength: 5, // 回退缓冲时间（保留最近 5 秒的已播内容）
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  return (
    <>
    <h1 className="text-2xl font-semibold mb-4 text-blue-700">比赛直播</h1>
    <div
      className="p-4 flex flex-col items-center"
      style={{ minHeight: "60vh", background: " #e3f0ff 100%  " }}
    >        
      <div className="mb-4">
        <select
          value={zoneName}
          onChange={e => setZoneName(e.target.value)}
          className="px-4 py-2 rounded border border-blue-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-700"
          style={{ fontSize: 20 }}
        >
          {zoneList.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={src}
          onChange={e => setSrc(e.target.value)}
          className="px-4 py-2 rounded border border-blue-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-700"
          style={{ fontSize: 20 }}
        >
          {videoSources.map((item) => (
            <option key={item.url} value={item.url}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div
        className="flex justify-center items-center bg-white rounded-lg shadow-lg"
        style={{
          maxWidth: 1400,
          width: "100%",
          aspectRatio: "16/9",
          overflow: "hidden",
          border: "1px solid #e3eaf5",
        }}
      >
        <video
          ref={videoRef}
          controls
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            maxHeight: 800,
            background: "#000",
            borderRadius: 12,
            boxShadow: "0 4px 24px #1976d222",
          }}
        />
      </div>
    </div>
    </>
  );
}
