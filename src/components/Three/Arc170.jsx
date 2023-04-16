import { BackSide } from "three";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Perf } from "r3f-perf";

import AnimatedLight from "./components/AnimatedLight";

import { Stars, TrackballControls, useCubeTexture } from "@react-three/drei";
import { Suspense, useRef } from "react";

const Spaceship = () => {
  const arc170Ref = useRef();

  const arc170 = useLoader(
    GLTFLoader,
    `${process.env.PUBLIC_URL}/assets/arc170/scene.gltf`
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() / 4;

    if (arc170Ref && arc170Ref.current) {
      arc170Ref.current.rotation.z = 0 + Math.sin(time * 4) / 10 + 0.25;
      arc170Ref.current.position.y = Math.sin(time * 2) * 5;
    }
  });

  return (
    <Suspense fallback={null}>
      <primitive ref={arc170Ref} object={arc170.scene} scale={0.1} />
    </Suspense>
  );
};

const Skybox = () => {
  const envMap = useCubeTexture(
    ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
    { path: "/assets/skyboxes/nebula1024_" }
  );

  return (
    <group>
      <Stars radius={500} fade speed={1} />
      <mesh>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial envMap={envMap} side={BackSide} />
      </mesh>
    </group>
  );
};

export default function Arc170() {
  return (
    <Canvas>
      <TrackballControls noPan maxDistance={250} minDistance={90} />
      <Perf position="bottom-right" />
      <color attach="background" args={[0x222222]} />
      <ambientLight color={0xffffff} intensity={2} />
      <AnimatedLight color={0xff9900} intensity={5.5} distance={200} />
      <AnimatedLight color={0xbb4400} intensity={10.5} distance={200} />

      <Skybox />
      <Spaceship />
    </Canvas>
  );
}
