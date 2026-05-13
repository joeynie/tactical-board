import { useMemo, useState } from "react";
import { quickRuleKeywords, ruleTopics, rulesPdfUrl } from "../data/ruleTopics";

function openPdfSearch(keyword: string) {
  window.open(`${rulesPdfUrl}#search=${encodeURIComponent(keyword)}`, "_blank", "noopener,noreferrer");
}

export default function RuleAssistant() {
  const [query, setQuery] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return ruleTopics;
    return ruleTopics.filter(topic => {
      const haystack = [topic.title, topic.tag, topic.note, ...topic.keywords].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  const activeKeyword = selectedKeyword || query.trim() || "基地血量";

  return (
    <main style={{ minHeight: "100vh", background: "#f7f8fb", padding: "24px clamp(16px, 4vw, 48px)" }}>
      <section style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 8px", color: "#667085", fontSize: 14 }}>RoboMaster 2026</p>
            <h1 style={{ margin: 0, color: "#172033", fontSize: 32 }}>规则助手</h1>
          </div>
          <a
            href={rulesPdfUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#fff",
              background: "#172033",
              borderRadius: 8,
              padding: "10px 14px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            打开官方 PDF
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 20 }}>
          <section style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 8, padding: 16 }}>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="搜索机制、角色、判罚或区域"
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #d0d5dd",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 16,
              }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {quickRuleKeywords.map(keyword => (
                <button
                  key={keyword}
                  onClick={() => {
                    setSelectedKeyword(keyword);
                    setQuery(keyword);
                  }}
                  style={{
                    border: "1px solid #d0d5dd",
                    borderRadius: 999,
                    background: activeKeyword === keyword ? "#172033" : "#fff",
                    color: activeKeyword === keyword ? "#fff" : "#344054",
                    padding: "7px 10px",
                    cursor: "pointer",
                  }}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </section>

          <aside style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#667085", fontSize: 13 }}>当前检索词</div>
            <div style={{ color: "#172033", fontSize: 24, fontWeight: 800, marginTop: 6 }}>{activeKeyword}</div>
            <button
              onClick={() => openPdfSearch(activeKeyword)}
              style={{
                width: "100%",
                marginTop: 14,
                border: 0,
                borderRadius: 8,
                background: "#1f7a8c",
                color: "#fff",
                padding: "10px 12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              在官方 PDF 中查找
            </button>
            <p style={{ color: "#667085", lineHeight: 1.6, margin: "12px 0 0", fontSize: 13 }}>
              规则手册版本：V1.4.2（2026-04-30）。复杂机制以官方 PDF 为准，这里只做入口和检索导航。
            </p>
          </aside>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 18 }}>
          {filteredTopics.map(topic => (
            <article key={topic.title} style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 20, color: "#172033" }}>{topic.title}</h2>
                <span style={{ color: topic.accent, background: `${topic.accent}14`, borderRadius: 999, padding: "4px 9px", fontSize: 12, fontWeight: 700 }}>
                  {topic.tag}
                </span>
              </div>
              <p style={{ color: "#475467", lineHeight: 1.65, minHeight: 78 }}>{topic.note}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {topic.keywords.map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => {
                      setSelectedKeyword(keyword);
                      setQuery(keyword);
                    }}
                    onDoubleClick={() => openPdfSearch(keyword)}
                    style={{
                      border: "1px solid #eaecf0",
                      borderRadius: 999,
                      background: "#fff",
                      color: "#344054",
                      padding: "6px 9px",
                      cursor: "pointer",
                    }}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
