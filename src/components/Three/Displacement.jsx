import { useRef } from "react";
import { BackSide, Color } from "three";

import AnimatedLight from "./components/AnimatedLight";

import Palette from "../../libs/palette";

import { useControls, folder } from "leva";
import { useFrame, Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import "../Materials/BlobMaterial";
import { Perf } from "r3f-perf";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

const COLORS = {
  LIGHT: Palette.Synth.lighter,
  PLASMA: Palette.Synth.light,
  BACKGROUND: Palette.Synth.dark,
  LIGHT_1: Palette.Synth.normal,
  LIGHT_2: Palette.Synth.darker,
  EQUALIZE: false,
};

function Blob(props) {
  const { uniforms } = props;
  const { color, scale, displacement, speed, lowStep, hiStep } = uniforms;

  const ref = useRef();
  const matRef = useRef();
  useFrame(({ clock }) => {
    matRef.current.time = clock.getElapsedTime();
    matRef.current.elevation = Math.sin(matRef.current.time / 4) / 2;
  });

  return (
    <>
      <mesh {...props} ref={ref}>
        <dodecahedronGeometry args={[46, 64]} />
        <blobMaterial
          ref={matRef}
          color={new Color(color)}
          speed={speed}
          scale={scale}
          lowStep={lowStep}
          hiStep={hiStep}
          displacement={displacement}
        />
      </mesh>
    </>
  );
}

export default function Displacement() {
  const render = () => {
    const time = performance.now() / 10e3;

    if (BLOOM.ANIMATE) {
      this.renderer.toneMappingExposure = Math.abs(Math.cos(time) / 2) + 0.5;
      bloomPass.strength = Math.abs(Math.cos(time)) + 0.5;
      bloomPass.radius = Math.abs(Math.sin(time)) + 0.5;
    }

    uniforms.time.value = time / 5;
  };

  const recolor = () => {
    uniforms.color.value = new Color(COLORS.PLASMA);
    if (COLORS.EQUALIZE) {
      l1.color = new Color(COLORS.PLASMA);
      l2.color = new Color(COLORS.PLASMA);
    } else {
      l1.color = new Color(COLORS.LIGHT_1);
      l2.color = new Color(COLORS.LIGHT_2);
    }
  };

  const values = useControls({
    uniforms: folder({
      scale: {
        min: 0,
        max: 2,
        step: 0.01,
        value: 1,
      },
      displacement: {
        min: 0,
        max: 110,
        value: 10,
      },
      speed: {
        min: 0,
        max: 2,
        value: 1,
      },
      lowStep: {
        min: -2,
        max: 0,
        value: -1,
      },
      hiStep: {
        min: 0,
        max: 2,
        value: 1,
      },
      color: {
        value: COLORS.PLASMA,
      },
    }),
  });

  return (
    <Canvas>
      <Perf position="bottom-right" />
      <color attach="background" color={[0x000000]} />
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshStandardMaterial color={COLORS.LIGHT_2} side={BackSide} />
      </mesh>
      <TrackballControls noPan minDistance={100} maxDistance={180} />
      <ambientLight color={0x888888} />
      <AnimatedLight color={COLORS.LIGHT_1} intensity={15} distance={170} />
      <AnimatedLight color={COLORS.LIGHT_2} intensity={15} distance={-170} />
      <Blob uniforms={values} />

      <EffectComposer multisampling={2}>
        <Bloom
          kernelSize={1}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={2}
        />
      </EffectComposer>
    </Canvas>
  );
}
