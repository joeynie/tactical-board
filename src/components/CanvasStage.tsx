import React, {  useState } from "react";
import { Stage, Layer, Image as KonvaImage, Circle, Text, Arrow, Group } from "react-konva";
import { useCanvasState } from "../hooks/useCanvasState";
import { useCanvasContext ,useToggleDraw} from "../types/CanvasContext";
import useImage from "use-image";
import "./CanvasStage.css"; // 引入 CSS 文件

const CanvasStage = () => {
  const { moveElement, addArrow } = useCanvasState();
  const { elements, arrows } = useCanvasContext();
  const [bg, setBg] = useImage("/RMUC2025_grad.png");
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<[number, number] | null>(null);
    const {draw, toggleDraw} = useToggleDraw();

  // 获取图片的宽度和高度
  const bgWidth = bg?.width || 1000;
  const bgHeight = bg?.height || 600;
  // 设置画布的宽度和高度
  const canvasWidth = window.innerWidth * 0.6;
  const canvasHeight = (canvasWidth * bgHeight) / bgWidth;

  const handleMouseDown = (e: any) => {
    const { x, y } = e.target.getStage().getPointerPosition();
    const clickedOnGroup = e.target.findAncestor("Group");
    if (!clickedOnGroup) {
      return;
    }
    setStart([x, y]);
    setDrawing(true);
  };

  const handleMouseUp = (e: any) => {
    if (drawing && start) {
      const { x, y } = e.target.getStage().getPointerPosition();
      addArrow({ x1: start[0], y1: start[1], x2: x, y2: y });
    }
    setDrawing(false);
    setStart(null);
  };

  return (
    <div className="canvas-stage-container">
      <Stage
        width={canvasWidth}
        height={canvasHeight}
        className="canvas-stage"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {bg && <KonvaImage image={bg} width={canvasWidth} height={canvasHeight} />}
        </Layer>
        <Layer>
          {elements.map((el, idx) => (
            <Group
              key={el.team + el.id}
              x={el.x * canvasWidth}
              y={el.y * canvasHeight}
              draggable
              onDragMove={(e) =>
                moveElement(idx, e.target.x() / canvasWidth, e.target.y() / canvasHeight)
              }
            >
              <Circle radius={20} fill={el.team} />
              <Text
                x={-15} // 相对于 Group 的位置
                y={-6}
                text={el.type}
                fontSize={12}
                fontFamily="Arial"
                fill="#fff"
              />
            </Group>
          ))}
          {draw && arrows.map((arrow, idx) => (
            <Arrow 
              key={idx}
              points={[arrow.x1, arrow.y1, arrow.x2, arrow.y2]}
              pointerLength={10}
              pointerWidth={10}
              fill="yellow"
              stroke="yellow"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasStage;