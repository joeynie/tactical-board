const remoteLiveGameInfoUrl = "https://rm-static.djicdn.com/live_json/live_game_info.json";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const response = await fetch(remoteLiveGameInfoUrl, {
      headers: {
        "user-agent": "tactical-board-live-proxy",
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch remote live info" });
      return;
    }

    const data = await response.json();
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(data);
  } catch (error) {
    console.error("Failed to proxy live info.", error);
    res.status(502).json({ error: "Failed to proxy live info" });
  }
};
