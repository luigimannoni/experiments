import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { degToRad } from 'three/src/math/MathUtils';
import '../Materials/PerlinNoiseMaterial';

export default function Wireground(props) {
  const {
    size = 64,
    segments = 128,
  } = props;
  const matRef = useRef();

  useFrame(() => {
    matRef.current.time += 0.05;
    matRef.current.elevation = (Math.sin(matRef.current.time / 50) + 1) / 4;
  });

  return (
    <>
      <mesh
        {...props}
        rotation={[degToRad(-90), 0, 0]}
      >
        <planeGeometry args={[size, size, segments, segments]} />
        <perlinNoiseMaterial
          ref={matRef}
          lineColor={0xbbbbbb}
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
