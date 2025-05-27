import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

// 可选视频源
const videoSources = [
  {
    label: "官方回放",
    url: "https://vod.robomaster.com/803eb42b391371f098434531948c0102/a8ae1c0a08964035a2ddbe5afa3b9720-02d02a03448fb9d77f2b1345f53a794a-ld.mp4",
  },
  {
    label: "直播流",
    url: "https://rtmp.djicdn.com/robomaster/Mainperspective.m3u8?auth_key=1745313821-0-0-9f1d349f4afcd45096ff75b6a3c7ad50",
  },
];

export default function Live() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [src, setSrc] = useState(videoSources[0].url);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls: Hls | null = null;

    if (src.endsWith(".m3u8") || src.includes(".m3u8?")) {
      if (Hls.isSupported()) {
        hls = new Hls();
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
          style={{ fontSize: 16 }}
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
          maxWidth: 800,
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
            maxHeight: 450,
            background: "#000",
            borderRadius: 12,
            boxShadow: "0 4px 24px #1976d222",
          }}
        />
      </div>
    </div>
  );
}