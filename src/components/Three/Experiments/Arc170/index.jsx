import { BackSide } from "three";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

import { Stars, TrackballControls, useCubeTexture } from "@react-three/drei";
import { Suspense, useRef } from "react";

const BLOOM = {
  ANIMATE: true,
  EXP: 1,
  STR: 1,
  THRES: 0,
  RAD: 0.2,
};

const AnimatedLight = ({ color, intensity, distance }) => {
  const light = useRef();
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() / 4;

    if (light && light.current) {
      light.current.position.x = Math.sin(Math.sin(time)) * distance;
      light.current.position.y = Math.sin(Math.cos(time)) * distance;
      light.current.position.z = Math.sin(time) * distance;
    }
  });

  return <pointLight ref={light} color={color} intensity={intensity} />;
};

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
  // bloomPass.threshold = BLOOM.THRES;
  // bloomPass.strength = BLOOM.STR;
  // bloomPass.radius = BLOOM.RAD;

  // const paneBloom = pane.addFolder({ title: "Bloom Effect" });
  // const b1 = paneBloom.addInput(this.renderer, "toneMappingExposure", {
  //   min: 0,
  //   max: 1,
  //   step: 0.001,
  //   label: "Exposure",
  //   disabled: BLOOM.ANIMATE,
  // });
  // paneBloom.addInput(bloomPass, "threshold", {
  //   min: 0,
  //   max: 1,
  //   step: 0.0001,
  //   label: "Threshold",
  // });
  // const b2 = paneBloom.addInput(bloomPass, "strength", {
  //   min: 0,
  //   max: 2,
  //   step: 0.1,
  //   label: "Strength",
  //   disabled: BLOOM.ANIMATE,
  // });
  // const b3 = paneBloom.addInput(bloomPass, "radius", {
  //   min: 0,
  //   max: 2,
  //   step: 0.1,
  //   label: "Radius",
  //   disabled: BLOOM.ANIMATE,
  // });
  // paneBloom
  //   .addInput(BLOOM, "ANIMATE", { label: "Animate" })
  //   .on("change", () => {
  //     b1.disabled = BLOOM.ANIMATE;
  //     b2.disabled = BLOOM.ANIMATE;
  //     b3.disabled = BLOOM.ANIMATE;
  //   });

  return (
    <Canvas>
      <TrackballControls noPan maxDistance={250} minDistance={90} />

      <color attach="background" args={[0x222222]} />
      <ambientLight color={0xffffff} intensity={2} />
      <AnimatedLight color={0xff9900} intensity={5.5} distance={200} />
      <AnimatedLight color={0xbb4400} intensity={10.5} distance={200} />
      {/*
      <EffectComposer>
        <Bloom
          kernelSize={4}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={0.5}
        />
      </EffectComposer> */}

      <Skybox />
      <Spaceship />
    </Canvas>
  );
}
