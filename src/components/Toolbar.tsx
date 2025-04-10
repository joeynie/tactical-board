import React, { useState } from "react";
import "./Toolbar.css";
import { useCanvasState } from "../hooks/useCanvasState";
import { useGameData, useToggleDraw } from "../types/CanvasContext";
import { exportGameDB, importGameDB ,fetchTacticList} from "../lib/supabaseGame";
import moment from "moment";

const Toolbar = () => {
  const { clearArrows } = useCanvasState();
  const { exportGame, importGame } = useGameData();
  const { draw, toggleDraw } = useToggleDraw();
  const [showHidden, setShowHidden] = useState(false);
  const [tacticList, setTacticList] = useState<any[]>([]);
  const [selectedTacticId, setSelectedTacticId] = useState<string>("");

  const exportLocal = () => {
    const output = exportGame();
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tactic_" + moment().format("YYMMDD-HHmm") + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importLocal = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const fileContent = evt.target?.result as string;
      if (fileContent) {
        importGame(fileContent);
      }
    };
    reader.readAsText(file);
  };

  const importGameTask = async () => {
    const list = await fetchTacticList();
    setTacticList(list);
    if (list.length === 0) {
      alert("❌ 未找到可用的战术数据");
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tacticId = Number(e.target.value);
    setSelectedTacticId(e.target.value);
    if (tacticId) {
      importGameDB(tacticId); 
      setTacticList([]);
      setSelectedTacticId("");
    }
  };
  
  return (
    <div className="toolbar-container">
      <div className="toolbar-button-wrapper">
        <button
          className="toolbar-button clear"
          onClick={clearArrows}
          onMouseEnter={() => setShowHidden(true)}
          onMouseLeave={() => setShowHidden(false)}
        >
          清空
        </button>
        {showHidden && (
          <button
            className="toolbar-button toggle-draw"
            onClick={toggleDraw}
            onMouseEnter={() => setShowHidden(true)}
          >
            {draw ? "停止绘制" : "开启绘制"}
          </button>
        )}
      </div>
      
      {/* <button className="toolbar-button save-tactic" onClick={exportLocal}>
        保存战术
      </button>

      <button className="toolbar-button import-tactic" onClick={() => document.getElementById("tactic-file")?.click()}>
        导入战术
      </button>
      <input
        id="tactic-file"
        type="file"
        accept="application/json"
        className="hidden"
        onChange={importLocal}
      /> */}

      <button className="toolbar-button save-tactic" onClick={exportGameDB}>
        保存到云端
      </button>

      <button className="toolbar-button import-tactic" onClick={importGameTask}>
        从云端导入
      </button>
      {tacticList.length > 0 && (
        <select
          className="toolbar-select"
          value={selectedTacticId}
          onChange={handleSelectChange}
        >
          <option value="">选择战术</option>
          {tacticList.map((tactic) => (
            <option key={tactic.id} value={tactic.id}>
              {tactic.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default Toolbar;
