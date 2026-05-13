import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getZoneSources, LiveGameInfo, LiveInfoSource, LiveZone, loadLiveGameInfo } from "../lib/liveGameInfo";

const sourceLabels: Record<LiveInfoSource, string> = {
  remote: "DJI 远程数据",
  proxy: "Vercel 代理数据",
  fallback: "本地兜底数据",
};

function getZoneDates(zone: LiveZone) {
  if (!zone.zoneDate || zone.zoneDate.length === 0) return "日期待确认";
  if (zone.zoneDate.length === 1) return zone.zoneDate[0];
  return `${zone.zoneDate[0]} - ${zone.zoneDate[zone.zoneDate.length - 1]}`;
}

export default function Schedule() {
  const [info, setInfo] = useState<LiveGameInfo | null>(null);
  const [source, setSource] = useState<LiveInfoSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    loadLiveGameInfo()
      .then(result => {
        if (cancelled) return;
        setInfo(result.data);
        setSource(result.source);
        setError("");
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "赛事数据加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const zones = useMemo(() => {
    return (info?.eventData ?? [])
      .map(zone => {
        const sources = getZoneSources(zone);
        const liveCount = sources.filter(item => item.kind === "live" || item.kind === "fpv").length;
        const replayCount = sources.filter(item => item.kind === "replay").length;
        return { zone, sources, liveCount, replayCount };
      });
  }, [info]);

  const liveZones = zones.filter(item => item.liveCount > 0).length;
  const replayZones = zones.filter(item => item.replayCount > 0).length;

  return (
    <main style={{ minHeight: "100vh", background: "#f5f7fb", padding: "24px clamp(16px, 4vw, 48px)" }}>
      <section style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 8px", color: "#667085", fontSize: 14 }}>RoboMaster 观赛助手</p>
            <h1 style={{ margin: 0, color: "#172033", fontSize: 32 }}>赛事雷达</h1>
          </div>
          <Link
            to="/live"
            style={{
              color: "#fff",
              background: "#1f7a8c",
              borderRadius: 8,
              padding: "10px 14px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            打开直播页
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 20 }}>
          {[
            ["数据源", source ? sourceLabels[source] : "加载中"],
            ["赛区", `${info?.eventData?.length ?? 0} 个`],
            ["有直播源", `${liveZones} 个`],
            ["有回放", `${replayZones} 个`],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 8, padding: 16 }}>
              <div style={{ color: "#667085", fontSize: 13 }}>{label}</div>
              <div style={{ color: "#172033", fontSize: 22, fontWeight: 800, marginTop: 6 }}>{value}</div>
            </div>
          ))}
        </div>

        {loading && <p style={{ color: "#667085", marginTop: 24 }}>正在扫描赛事数据...</p>}
        {error && <p style={{ color: "#b42318", marginTop: 24 }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 20 }}>
          {zones.map(({ zone, sources, liveCount, replayCount }) => (
            <article key={zone.zoneId ?? zone.zoneName} style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, color: "#172033" }}>{zone.zoneName ?? "未知赛区"}</h2>
                  <p style={{ margin: "6px 0 0", color: "#667085", fontSize: 13 }}>{getZoneDates(zone)}</p>
                </div>
                <span style={{ color: liveCount > 0 ? "#027a48" : "#667085", fontWeight: 700 }}>
                  {liveCount > 0 ? "可观看" : "待更新"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <span style={{ background: "#ecfdf3", color: "#027a48", borderRadius: 999, padding: "4px 9px", fontSize: 12 }}>
                  直播/FPV {liveCount}
                </span>
                <span style={{ background: "#fff4e5", color: "#b54708", borderRadius: 999, padding: "4px 9px", fontSize: 12 }}>
                  回放 {replayCount}
                </span>
                <span style={{ background: "#eef4ff", color: "#3538cd", borderRadius: 999, padding: "4px 9px", fontSize: 12 }}>
                  源 {sources.length}
                </span>
              </div>

              <div style={{ marginTop: 14, display: "grid", gap: 8, maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
                {sources.map(item => (
                  <a
                    key={`${item.kind}-${item.label}-${item.url}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#344054",
                      border: "1px solid #eaecf0",
                      borderRadius: 8,
                      padding: "8px 10px",
                      textDecoration: "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.kind === "replay" ? "回放" : item.kind === "fpv" ? "FPV" : "直播"} · {item.label}
                  </a>
                ))}
                {sources.length === 0 && <span style={{ color: "#98a2b3" }}>暂无直播或回放源</span>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
