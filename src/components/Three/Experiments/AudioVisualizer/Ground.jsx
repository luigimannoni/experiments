import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { degToRad } from 'three/src/math/MathUtils';
import { Color } from 'three';

export default function Ground(props) {
  const {
    source = null,
    color = new Color(0xffffff),
  } = props;
  const ref = useRef();
  useFrame(() => {
    if (source) {
      const { mental } = source.sample();
      ref.current.material.color.setHSL(0, 0, mental);
    }
  });

  return (
    <>
      <mesh
        {...props}
        ref={ref}
        rotation={[degToRad(-90), 0, 0]}
      >
        <planeGeometry args={[128, 128]} />
        <meshBasicMaterial
          color={color}
        />
      </mesh>
    </>
  );
}
