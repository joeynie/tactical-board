import React from "react";
import { useGameData } from "../types/CanvasContext";
import { useCanvasContext } from "../types/CanvasContext";
import "./TimelineEditor.css"; // 引入 CSS 文件

const TimelineEditor = () => {
  const { frames, ticks, setCurrentFrame, addFrame } = useGameData();
  const { elements, setElements } = useCanvasContext();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentFrame(Number(e.target.value), setElements);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addFrame({ robots: elements });
  };

  return (
    <div
      className="timeline-editor"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="timeline-controls">
        <button
          className="timeline-button"
          onClick={() => addFrame({ robots: elements })}
        >
          添加帧
        </button>
        <span className="timeline-current-frame">当前帧: {ticks}</span>
      </div>
      <input
        type="range"
        min={1}
        max={frames.length}
        value={ticks}
        onChange={handleSliderChange}
        className="timeline-slider"
      />
    </div>
  );
};

export default TimelineEditor;