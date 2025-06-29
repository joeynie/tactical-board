import {Stage, Layer, Image, Rect } from "react-konva";
import useImage from "use-image";
import "./VisibleMap.css"; // 引入 CSS 文件
import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
// --- 辅助函数 (对应 C# 的 Utils, Mathf 等) ---

const colorTable = {
    "可见区域": "rgba(208, 22, 22, 0.5)",
    "可见且被敌人看到的区域": "rgba(217, 107, 23, 0.5)",
    "被敌人看到的区域": "rgba(226, 192, 24, 0.5)",
    "不可见区域": "rgba(0, 0, 0, 0)"
}

// 线性插值 (对应 Mathf.Lerp)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 3D向量距离 (对应 Vector3.Distance)
const distance3D = (p1: { x: number; y: number; z: number; }, p2: { x: number; y: number; z: number; }) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// 2D向量距离 (用于插值计算)
const distance2D = (p1: { x: any; y: any; }, p2: { x: any; y: any; }) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y; // 在我们的网格中，y 对应 C# 的 z
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Bresenham's Line Algorithm (对应 Utils.GetCellsOnLine)
 * 使用了JavaScript的生成器函数，行为与C#的 yield return 类似
 * @param {{x: number, y: number}} p1 - 起点 {x, y}
 * @param {{x: number, y: number}} p2 - 终点 {x, y}
 * @returns {Generator<{x: number, y: number}>} - 返回一个迭代器
 */
function* getCellsOnLine(p1: { x: any; y: any; }, p2: { x: any; y: any; }) {
  let x0 = p1.x, y0 = p1.y;
  const x1 = p2.x, y1 = p2.y;

  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let err = dx + dy;

  while (true) {
    yield { x: x0, y: y0 };
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

const VisableMap = () => {
    const [heightMap] = useImage("height.png");
    const [fieldMap] = useImage("RMUC2025.png");
    const [heightArray, setHeightArray] = useState<number[][]>([]);
    const [position, setPosition] = useState<[number, number]>([0, 0]);
    const [enemyPosition, setEnemyPosition] = useState<[number, number]>([0, 0]);
    const [visible, setVisible] = useState<boolean[][]>([]);
    const [beVisible, setBeVisible] = useState<boolean[][]>([]);
    const [cameraHeight, setCameraHeight] = useState(0.3);
    const [armorHeight, setArmorHeight] = useState(0.15);
    const [aimDistance, setAimDistance] = useState(6.0);

    const fieldWidth = 28.0;
    const fieldHeight = 15.0;
    const width = window.innerWidth * 0.6; 
    const height = (width * 150) / 280; // 根据比例计算
    const gridWidth = heightMap?.width || 280; 
    const gridHeight = heightMap?.height || 150;
    const gridSizeX = width / gridWidth;
    const gridSizeY = height / gridHeight;

    useEffect(() => {
        if (!heightMap) return;

        const canvas = document.createElement("canvas");
        canvas.width = gridWidth;
        canvas.height = gridHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(heightMap, 0, 0, gridWidth, gridHeight);
        const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight).data;

        const newHeightValues = Array(gridWidth).fill(0).map(() => Array(gridHeight).fill(0));
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
              const index = (y * gridWidth + x) * 4;
              const val = imageData[index]; // 读取 R 通道的值
              // 对应 C# 的灰度还原逻辑: array[x, y] = (T)(object)((255 - val) / 255f * maxVal);
              newHeightValues[x][y] = (255 - val) / 255.0 * 5;
            }
          }
        setHeightArray(newHeightValues);
        setVisible(Array(gridWidth).fill(0).map(() => Array(gridHeight).fill(false)));
        setBeVisible(Array(gridWidth).fill(0).map(() => Array(gridHeight).fill(false)));
    }, [heightMap]);

    const worldToGrid = (pos: { x: any; z: any; y?: any; }) => ({ 
        x: Math.floor(pos.x / fieldWidth * gridWidth), 
        y: Math.floor(pos.z / fieldHeight * gridHeight) 
    });
    const gridToWorld = (gridPos: { x: number; y: number; }) => ({ 
        x: gridPos.x / gridWidth * fieldWidth, 
        z: gridPos.y / gridHeight * fieldHeight,
        y: 0
    });

    /**
     * 对应 C# 的 CheckCanHit
     * @param {{x: number, y: number, z: number}} from - 起点
     * @param {{x: number, y: number, z: number}} to - 终点
     * @param {number} maxDistance - 最大检测距离
     * @returns {boolean}
     */
    const checkCanHit = (from: { x: any; z: any; y: any; }, to: { x: any; z: any; y: any; }, maxDistance: number) => {
        if (distance3D(from, to) > maxDistance) return false;

        const startCell = worldToGrid(from);
        const endCell = worldToGrid(to);
        from.y = heightArray[startCell.x][startCell.y] + cameraHeight; // 起点高度
        to.y = heightArray[endCell.x][endCell.y] + armorHeight; // 终点高度
        
        // console.log(`Start Cell: ${startCell.x}, ${startCell.y}, End Cell: ${endCell.x}, ${endCell.y}`);
        const totalPlanarDistance = distance2D({x: from.x, y: from.z}, {x: to.x, y: to.z});
        if (totalPlanarDistance < 1e-6) return true; // 起点和终点在同一垂直线上

        for (const cell of getCellsOnLine(startCell, endCell)) {
            // 检查cell是否在地图范围内
            if (!heightArray[cell.x] || heightArray[cell.x][cell.y] === undefined) continue;

            const terrainHeight = heightArray[cell.x][cell.y];
            const nodePosition = gridToWorld({ x: cell.x + 0.5, y: cell.y + 0.5 });

            // 计算当前cell在线段上的插值比例 k
            const k = distance2D({x: from.x, y: from.z}, {x: nodePosition.x, y: nodePosition.z}) / totalPlanarDistance;
            // 对应 C# 的: float height_interpolation = Mathf.Lerp(from.y, to.y, k);
            const losHeight = lerp(from.y, to.y, k);
            // 如果地形高度 >= 视线高度，则被遮挡
            if (terrainHeight >= losHeight) {
                return false;
            }
        }
        
        return true;
    };
    const checkCanBeSeen = (from: { x: any; z: any; y: any; }, to: { x: any; z: any; y: any; }, maxDistance: number) => {
        if (distance3D(from, to) > maxDistance) return false;

        const startCell = worldToGrid(from);
        const endCell = worldToGrid(to);
        from.y = heightArray[startCell.x][startCell.y] + armorHeight; // 起点高度
        to.y = heightArray[endCell.x][endCell.y] + cameraHeight; // 终点高度
        
        // console.log(`Start Cell: ${startCell.x}, ${startCell.y}, End Cell: ${endCell.x}, ${endCell.y}`);
        const totalPlanarDistance = distance2D({x: from.x, y: from.z}, {x: to.x, y: to.z});
        if (totalPlanarDistance < 1e-6) return true; // 起点和终点在同一垂直线上

        for (const cell of getCellsOnLine(startCell, endCell)) {
            // 检查cell是否在地图范围内
            if (!heightArray[cell.x] || heightArray[cell.x][cell.y] === undefined) continue;

            const terrainHeight = heightArray[cell.x][cell.y];
            const nodePosition = gridToWorld({ x: cell.x + 0.5, y: cell.y + 0.5 });

            // 计算当前cell在线段上的插值比例 k
            const k = distance2D({x: from.x, y: from.z}, {x: nodePosition.x, y: nodePosition.z}) / totalPlanarDistance;
            // 对应 C# 的: float height_interpolation = Mathf.Lerp(from.y, to.y, k);
            const losHeight = lerp(from.y, to.y, k);
            // 如果地形高度 >= 视线高度，则被遮挡
            if (terrainHeight >= losHeight) {
                return false;
            }
        }
        
        return true;
    };
    

    const offscreenCanvas = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }, [width, height]);

    // 当数据变化时，重新绘制离屏 canvas
    useEffect(() => {
        if (!visible) return;

        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height); // 清空画布

        // 循环遍历数据，直接在 canvas 上绘制矩形
        for (let x = 0; x < visible.length; x++) {
            for (let y = 0; y < visible[x].length; y++) {
                const isVisible = visible[x][y];
                const isBeVisible = beVisible[x][y];
                
                // 设置填充颜色
                ctx.fillStyle = isVisible ? colorTable["可见区域"] : colorTable["不可见区域"];
                if (isBeVisible) {
                    ctx.fillStyle = isVisible? colorTable["可见且被敌人看到的区域"] : colorTable["被敌人看到的区域"];
                }
                ctx.fillRect(x * gridSizeX, y * gridSizeY, gridSizeX, gridSizeY);

                // 绘制描边（可选）
                if (x === position[0] && y === position[1]){
                    ctx.strokeStyle = "rgba(47, 0, 255, 0.6)";
                    ctx.strokeRect(x * gridSizeX, y * gridSizeY, gridSizeX, gridSizeY);
                }
            }
        }
        // Konva 的 Image 组件会自动检测 canvas 的变化并重绘
        // 我们只需要确保 canvas 内容被更新即可
        const layer = imageRef.current?.getLayer();  
        if (layer) { 
            layer.batchDraw();
        }

    }, [visible, width, height, offscreenCanvas]);   
    
    const imageRef = useRef<Konva.Image>(null);
    
    useEffect(() => {
        if (!heightMap ) return;
        const newVisibleGrid = Array(gridWidth).fill(0).map(() => Array(gridHeight).fill(false));
        const newBeVisibleGrid = Array(gridWidth).fill(0).map(() => Array(gridHeight).fill(false));
        const from = gridToWorld({ x: position[0], y: position[1] }); // 起点
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                const to = gridToWorld({ x: x + 0.5, y: y + 0.5 }); 
                newVisibleGrid[x][y] = checkCanHit(from, to, aimDistance);
                newBeVisibleGrid[x][y] = checkCanBeSeen(from, to, aimDistance);
                // console.log(`Checking visibility for cell (${x}, ${y}) at position`, `isVisible: ${isVisible}`);
            }
        }
        setVisible(newVisibleGrid);
        setBeVisible(newBeVisibleGrid);
    }, [position, cameraHeight, armorHeight, aimDistance]);

    useEffect(() => {
        if (!heightMap ) return;
        const from = gridToWorld({ x: position[0], y: position[1] });
        const to = gridToWorld({x: enemyPosition[0], y: enemyPosition[1]}); // 终点

        const startCell = worldToGrid(from);
        const endCell = worldToGrid(to);
        
        from.y = heightArray[startCell.x][startCell.y] + cameraHeight; // 起点高度
        to.y = heightArray[endCell.x][endCell.y] + armorHeight; // 终点高度
        
        const totalPlanarDistance = distance2D({x: from.x, y: from.z}, {x: to.x, y: to.z});
        if (totalPlanarDistance < 1e-6) return; // 起点和终点在同一垂直线上

        const newVisibleGrid = Array(gridWidth).fill(0).map(() => Array(gridHeight).fill(false));
        for (const cell of getCellsOnLine(startCell, endCell)) {
            // 检查cell是否在地图范围内
            if (!heightArray[cell.x] || heightArray[cell.x][cell.y] === undefined) continue;

            const terrainHeight = heightArray[cell.x][cell.y];
            // const nodePosition = { x: (cell.x + 0.5)/gridWidth*fieldWidth, y: terrainHeight, z: (cell.y + 0.5)/gridHeight*fieldHeight };
            const nodePosition = gridToWorld({ x: cell.x + 0.5, y: cell.y + 0.5 }); // 转换为世界坐标
            // 计算当前cell在线段上的插值比例 k
            const k = distance2D({x: from.x, y: from.z}, {x: nodePosition.x, y: nodePosition.z}) / totalPlanarDistance;
            // console.log(distance2D({x: to.x, y: to.z}, {x: nodePosition.x, y: nodePosition.z}) , totalPlanarDistance)
            // 对应 C# 的: float height_interpolation = Mathf.Lerp(from.y, to.y, k);
            const losHeight = lerp(from.y, to.y, k);
            // console.log(cell, `Terrain Height: ${terrainHeight}, LOS Height: ${losHeight}, from.y: ${from.y}, to.y: ${to.y}, k: ${k}`);

            // 如果地形高度 >= 视线高度，则被遮挡
            if (terrainHeight >= losHeight) {
                newVisibleGrid[cell.x][cell.y] = false;
            } else {
                newVisibleGrid[cell.x][cell.y] = true;
            }
        }
        setVisible(newVisibleGrid);
    }, [enemyPosition]);
    // 事件委托：在整个图像上监听点击事件
    const handleCanvasClick = (e: any) => {
        // 获取相对于 stage 的点击位置
        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();
        if (!pos) return;
        
        const x = Math.floor(pos.x / gridSizeX);
        const y = Math.floor(pos.y / gridSizeY);
        
        if (e.evt.button === 0)
            setPosition([x, y]);
        else if (e.evt.button === 1) 
            setEnemyPosition([x, y]);
    };
    return (
    <div className="canvas-stage-container" >
        <div className="controls-container">
            <div className="slider-control">
                <label htmlFor="cameraHeight">相机高度: {cameraHeight.toFixed(2)} m</label>
                <input
                    type="range"
                    id="cameraHeight"
                    min="0.1"
                    max="2"
                    step="0.01"
                    value={cameraHeight}
                    onChange={(e) => setCameraHeight(parseFloat(e.target.value))}
                />
            </div>
            <div className="slider-control">
                <label htmlFor="armorHeight">装甲板高度: {armorHeight.toFixed(2)} m</label>
                <input
                    type="range"
                    id="armorHeight"
                    min="0.1"
                    max="2"
                    step="0.01"
                    value={armorHeight}
                    onChange={(e) => setArmorHeight(parseFloat(e.target.value))}
                />
            </div>
            <div className="slider-control">
                <label htmlFor="distance">最远距离: {aimDistance.toFixed(1)} m</label>
                <input
                    type="range"
                    id="aimDistance"
                    min="0.0"
                    max="15"
                    step="0.5"
                    value={aimDistance}
                    onChange={(e) => setAimDistance(parseFloat(e.target.value))}
                />
            </div>
        </div>
        <Stage width={width} height={height} className="canvas-stage" onClick={handleCanvasClick} onTap={handleCanvasClick}>
            <Layer>
                <Image image={fieldMap} width={width} height={height} />
                {/* <Image image={heightMap} width={width} height={height} /> */}
            </Layer>
            <Layer>
                <Image image={offscreenCanvas} ref={imageRef} width={width} height={height} />
            </Layer>
        </Stage>
        <div className="legend-overlay"> 
            <div><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: colorTable["可见区域"], marginRight: 5 }}></span>可见区域</div>
            <div><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: colorTable["可见且被敌人看到的区域"], marginRight: 5 }}></span>可见且被敌人看到的区域</div>
            <div><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: colorTable["被敌人看到的区域"], marginRight: 5 }}></span>被敌人看到的区域</div>
        </div>
    </div>
    );
}
export default VisableMap;