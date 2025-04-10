import React, { useEffect, useRef } from "react";
import { useGameData } from "../types/CanvasContext";
import { useCanvasContext } from "../types/CanvasContext";
import { Tooltip } from 'react-tooltip';
import "./TimelineEditor.css"; // 引入 CSS 文件

const TimelineEditor = () => {
  const { frames, ticks, setCurrentFrame, addFrame } = useGameData();
  const { elements, setElements } = useCanvasContext();
  const hasInitialized = useRef(false); // 标志变量

  // Initialize the first frame if frames are empty
  useEffect(() => {
    if (!hasInitialized.current) {
      addFrame({ robots: elements });
      hasInitialized.current = true; 
    }
  });

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentFrame(Number(e.target.value), setElements);
  };

  return (
    <div
      className="timeline-editor"
      tabIndex={1}
    >
      <div className="timeline-controls">
        <button
          className="timeline-button"
          onClick={() => addFrame({ robots: elements })}
        >
          添加帧
        </button>
        <Tooltip anchorSelect=".timeline-button" place="top" content="回车键可添加帧" />
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