import { Canvas } from '@react-three/fiber'
import { useGLTF, useFBX, OrbitControls, Environment } from "@react-three/drei";
import { useState,Suspense } from 'react';
import * as THREE from 'three';
import { Html, useProgress } from '@react-three/drei'

const models = [
  // { name: "哨兵机器人", url: "/models/sentry.fbx" },
  // { name: "步兵机器人", url: "models/舵轮步兵.fbx" },
  // { name: "RMUC2025 map", url: "/models/2025map.fbx" },
  { name: "RMUC2025 map", url: "/models/2025map.glb" },
  // { name: "24工程", url: "/models/24工程.fbx" },
  // { name: "aeroplane", url: "/models/drone.fbx" },
];

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
  return <primitive object={gltf.scene} scale={0.3} />;
}

function FBXModel({ url }: { url: string }) {
  const fbx = useFBX(url);
  fbx.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return <primitive object={fbx} scale={0.3} />;
}

function Model({ url }: { url: string }) {
  if (url.toLowerCase().endsWith('.glb') || url.toLowerCase().endsWith('.gltf')) {
    return <GLTFModel url={url} />;
  }
  return <FBXModel url={url} />;
}


function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress} % loaded</Html>
}

export default function ModelViewer() {
  const [currentModel, setCurrentModel] = useState(models[0].url);

  return (
    <div className="flex h-screen">
      {/* 左侧模型选择 */}
      <div className="p-8 flex  justify-center" style={{ minWidth: 220 }}>
        <h2 className="text-xl font-semibold mb-4">模型选择</h2>
        <select
          value={currentModel}
          onChange={e => setCurrentModel(e.target.value)}
          className="px-4 py-2"
          style={{ fontSize: 16 }}
        >
          {models.map(model => (
            <option key={model.url} value={model.url}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      {/* 右侧3D视图 */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ minHeight: 0, minWidth: 0 }}
      >
        <div
          style={{
            width: "1200px",
            height: "700px",
            maxWidth: "100vw",
            maxHeight: "80vh",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px #1976d222",
            overflow: "hidden",
          }}
        >
          <Canvas
            camera={{ position: [0, 5, 5], fov: 45}}
            style={{ width: "100%", height: "100%", display: "block" }}
            // shadows
          >
            <Suspense fallback={<Loader />}>
              <ambientLight intensity={0.5} />
              <directionalLight color="white" position={[2, 5, 2]} intensity={1.0} castShadow />
              <directionalLight color="white" position={[-2, 5, -2]} intensity={1.0} castShadow />
              <Model url={currentModel} />
              <OrbitControls />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
}