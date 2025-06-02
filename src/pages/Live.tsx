import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

// 可选视频源
const videoRecord = [
  {
    label: "交龙-哈工大",
    url: "https://vod.robomaster.com/50498528389d71f0b3435420848c0102/1eb83d8331d1404ebc42f4e819abcf70-38b3cd5106c23d2283456bca3a5a25d9-ld.mp4",
  }
];

export default function Live() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSources, setVideoSources] = useState<{ label: string; url: string }[]>(videoRecord);
  const [src, setSrc] = useState(videoSources[0].url);


  useEffect(() => {
    fetch("/live_game_info.json")
      .then(res => res.json())
      .then(data => {
        const sources: { label: string; url: string }[] = [];
        
        // console.log("Fetched live game info:", data);
        for (const zone of data.eventData) {
          console.log("zone:", zone.zoneName);
          if (zone.zoneName !== "东部赛区") continue; // 只处理东部赛区

          console.log("zoneLiveString:", zone.zoneLiveString);
          console.log("fpvData:", zone.fpvData);

          for (const item of zone.zoneLiveString) {
            if (item && item.src && item.label) {
              sources.push({ label: item.label, url: item.src });
            }
          }
          for (const item of zone.fpvData) {
            if (item && item.sources && item.role) {
              sources.push({ label: item.role, url: item.sources[0].src });
            }
          }
          setVideoSources([...videoRecord, ...sources]);
          if (sources.length > 0) setSrc(sources[0].url);
        }
      });
    
  }, []);

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
    <div
      className="p-4 flex flex-col items-center"
      style={{ minHeight: "60vh", background: " #e3f0ff 100%  " }}
    >
      <div className="text-2xl font-semibold mb-4 text-blue-700">比赛直播</div>
      <div className="mb-4">
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
  );
}