import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { Stats, Html, useGLTF } from '@react-three/drei';
import { Box, FormControlLabel, Switch, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Unit, Arrow, Frame, Game  } from "../types/type";
import { useCanvasContext, useGameData } from "../types/CanvasContext";

const fieldLength = 28;
const fieldWidth = 15;
// 类型定义
interface FieldModelProps {
  trackData: Frame[] | null;
  currentFrame: number;
  showTrails: boolean;
}

// 样式组件
const ControlPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  borderRadius: theme.shape.borderRadius,
  zIndex: 100,
  maxWidth: '200px',
}));

// 创建赛场模型
function Field() {
  const [texture, maskTexture, maskTexture2] = useLoader(THREE.TextureLoader, ['/2025field.png', '/2025field_mask.png', '/2025field_mask2.png']);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[fieldLength, fieldWidth]} />
        {/* 用图片作为材质贴图 */}
        <meshStandardMaterial map={texture} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} receiveShadow>
        <planeGeometry args={[fieldLength, fieldWidth]} />
        {/* 用图片作为材质贴图 */}
        <meshStandardMaterial map={texture}  alphaMap={maskTexture} transparent={true}/>
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]} receiveShadow>
        <planeGeometry args={[fieldLength, fieldWidth]} />
        {/* 用图片作为材质贴图 */}
        <meshStandardMaterial map={texture}  alphaMap={maskTexture2} transparent={true}/>
      </mesh>
    </group>
  );
}

// 机器人模型
interface PlayerProps {
  position: [number, number, number];
  id: number;
  color: string;
}
function Player({ position, id, color }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const playerHeight = 0.4 + id * 0.1;
  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, playerHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, playerHeight, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html position={[0, playerHeight , 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {id}
        </div>
      </Html>
    </group>
  );
}

// 轨迹线
interface TrackLineProps {
  points: { x: number; y: number; frame: number }[];
  color: string;
}
function TrackLine({ points, color }: TrackLineProps) {
  const lineRef = useRef<THREE.Line>(null);

  useEffect(() => {
    if (lineRef.current && points.length >= 2) {
      const lineGeometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      points.forEach(p => {
        vertices.push(p.x, 0.1, p.y);
      });
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = lineGeometry;
    }
  }, [points]);

  return (
     // @ts-expect-error: react-three-fiber line is not SVG line
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color={color} linewidth={3} />
    </line>
  );
}

// 场景设置和灯光
const SceneSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { camera, scene } = useThree();
  useEffect(() => {
    camera.position.set(0, 15, 10);
    camera.lookAt(0, 0, 0);
    scene.background = new THREE.Color(0x000000); 
    scene.traverse(obj => {
      if ((obj as any).isMesh) {
        (obj as any).castShadow = true;
        (obj as any).receiveShadow = true;
      }
    });
  }, [camera, scene]);
  return <>{children}</>;
};

// 相机控制
function CameraControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controlsRef.current = controls;
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });
  return null;
}

function GLTFModel({ url }: { url: string }) {
  const gltf = useGLTF(url, true);
  gltf.scene.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material = new THREE.MeshStandardMaterial({
        color: "#707070"
      });
    }
  });
  return <primitive position={[0,-0.1,0]} object={gltf.scene} scale={1.0} />;
}

// 主组件
const FieldModel: React.FC<FieldModelProps> = ({ trackData, currentFrame, showTrails }) => {
    const [showStats, setShowStats] = useState(false);
    const [trailLength, setTrailLength] = useState(30);

    const { elements } = useCanvasContext();

  // 历史轨迹
  const getTrackHistory = () => {
    if (!trackData || !showTrails) return {};
    const trackHistory: { [id: number]: { x: number; y: number; frame: number }[] } = {};
    const startFrame = Math.max(0, currentFrame - trailLength);
    for (let i = startFrame; i <= currentFrame && i < trackData.length; i++) {
      trackData[i].robots.forEach(track => {
        const trackId = track.id;
        if (!trackHistory[trackId]) {
          trackHistory[trackId] = [];
        }
        const x = (track.x*28 - fieldLength / 2);
        const z = (track.y*15 - fieldWidth / 2);
        trackHistory[trackId].push({
          x: x,
          y: z,
          frame: i
        });
      });
    }
    return trackHistory;
  };

  const getPlayerColor = (car:Unit) => {
    // 蓝色基色: #42a5f5, 红色基色: #ef5350
    if (car.team === "red") {
        return `#ef5350`;
    } else if (car.team === "blue") {
        return `#42a5f5`;
    } else {
        return "#888888"; // 其他队伍灰色
    }
  };

  const trackHistory = getTrackHistory();

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ fov: 60 }}>
        <SceneSetup>
          <ambientLight intensity={1} />
          <directionalLight
            position={[10, 20, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <Field />
            <GLTFModel url={"/models/2025map.glb"}/>
          {showTrails &&
            Object.entries(trackHistory).map(([id, points]) =>
              points.length > 1 &&
              <TrackLine
                key={`track-${id}`}
                points={points}
                color={"black"}
              />
            )
          }
          {elements.map(track => (
            <Player
              key={`${track.team}${track.id}`}
              position={[track.x*28 - fieldLength / 2, 0.1, track.y*15 - fieldWidth / 2]}
              id={track.id}
              color={getPlayerColor(track)}
            />
          ))}
          <CameraControls />
          {showStats && <Stats />}
        </SceneSetup>
      </Canvas>
      <ControlPanel>
        {/* <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showStats}
              onChange={(e) => setShowStats(e.target.checked)}
            />
          }
          label="性能统计"
          sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
        /> */}
        {showTrails && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span>轨迹长度</span>
              <span>{trailLength} 帧</span>
            </Box>
            <Slider
              size="small"
              value={trailLength}
              min={5}
              max={100}
              onChange={(_, value) => setTrailLength(value as number)}
              sx={{ mt: 0.5 }}
            />
          </Box>
        )}
      </ControlPanel>
    </Box>
  );
};

const FieldStage = () => {

    const { frames, ticks } = useGameData();
    return (
    <div style={{width: "1200px", height: "700px" , margin: "0 auto", position: "relative"}}>
        <FieldModel
            trackData={frames} // 这里可以传入实际的轨迹数据
            currentFrame={Math.max(0, ticks-1)} // 当前帧数
            showTrails={false} 
        />
    </div>
    );
};

export default FieldStage;