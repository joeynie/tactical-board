import React, { useState } from "react";
import "./Toolbar.css"; // 引入 CSS 文件
import { useCanvasState } from "../hooks/useCanvasState";
import { useGameData , useToggleDraw} from "../types/CanvasContext";
import moment from "moment";

const Toolbar = () => {
  const {clearArrows} = useCanvasState();
  const {exportGame, importGame} = useGameData();
  const [showHidden, setShowHidden] = useState(false);
  const {draw, toggleDraw} = useToggleDraw();
  
  const export_ = () => {
    const output = exportGame();
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tactic_" + moment().format("YYMMDD-HHmm")+".json"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const import_ = (e: any) => {
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
  
  return (
    <div className="toolbar-container" >
      <div className="toolbar-button-wrapper">
        <button className="toolbar-button clear" onClick={clearArrows} 
                onMouseEnter={()=>{setShowHidden(true)}} onMouseLeave={()=>{setShowHidden(false)}}>清空</button>
        {showHidden && <button  className="toolbar-button toggle-draw" onClick={toggleDraw}
                onMouseEnter={()=>{setShowHidden(true)}}>  {draw ? "停止绘制" : "开启绘制"} </button>  }
      </div>
      
      <button className="toolbar-button save-tactic" onClick={export_} >保存战术</button>
      {/* <button className="toolbar-button export-image" onClick={exportCanvasAsImage} >导出为图片</button> */}

      <button className="toolbar-button import-tactic" onClick={() => document.getElementById("tactic-file")?.click()}>  导入战术 </button>
      <input id="tactic-file" type="file"  accept="application/json"  className="hidden" onChange={import_}  />
    </div>
  );
};

export default Toolbar;