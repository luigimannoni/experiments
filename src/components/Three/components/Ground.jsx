import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color } from "three";
import "../../Materials/PerlinNoiseMaterial";

export default function Ground(props) {
  const { source = null, color = new Color(0x111111) } = props;
  const ref = useRef();
  const matRef = useRef();
  useFrame(() => {
    matRef.current.time += 0.05;

    if (source) {
      const { mental } = source.sample();
      matRef.current.lineColor.setHSL(0.9 * (10 - mental), 1, mental);
      matRef.current.elevation = 1 * mental;
      matRef.current.time += mental / 4;
      matRef.current.sombrero_frequency = 1.5 * mental;
      matRef.current.sombrero_amplitude = 5.3 * mental;
    } else {
      matRef.current.elevation = Math.sin(matRef.current.time / 4) / 2;
    }
  });

  return (
    <>
      <mesh {...props} ref={ref}>
        <planeGeometry args={[128, 128, 256, 256]} />
        <perlinNoiseMaterial
          ref={matRef}
          lineColor={color}
          sombreroFrequency={5}
          noiseRange={0.4}
          sombreroAmplitude={0.5}
          wireframe
          wireframeLinewidth={1}
          transparent
          opacity={0}
        />
      </mesh>
    </>
  );
}
