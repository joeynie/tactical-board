import { supabase } from "./supabaseClient";
import { useGameData } from "../types/CanvasContext";
import moment from "moment";

// 保存当前战术到 Supabase tactics 表
export const exportGameDB = async () => {
  const { exportGame } = useGameData.getState();
  const gameData = JSON.parse(exportGame());

  const { error } = await supabase.from("tactics").insert([
    {
      name: "战术_" + moment().format("YYMMDD-HHmm"),
      ticks: gameData.ticks,
      data: gameData.data,
    },
  ]);

  if (error) {
    alert("❌ 保存失败：" + error.message);
  } else {
    alert("✅ 保存成功！");
  }
};

// 从 Supabase tactics 表中加载某个战术（按 id）
export const importGameDB = async (id: number) => {
  const { data, error } = await supabase
    .from("tactics")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("❌ 读取失败：" + error?.message);
    return;
  }

  const { importGame } = useGameData.getState();
  const gameJson = JSON.stringify({
    ticks: data.ticks,
    data: data.data,
  });
  importGame(gameJson);
  alert("✅ 读取成功！");
};

// 加载所有战术列表
export const fetchTacticList = async () => {
  const { data, error } = await supabase
    .from("tactics")
    .select("id, name")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ 获取战术列表失败：", error.message);
    return [];
  }

  return data;
};
