import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide } from 'three';

export default function Box(props) {
  const {
    size = 1,
  } = props;
  const outerRef = useRef();
  const innerRef = useRef();
  useFrame(() => {
    innerRef.current.rotation.x += 0.001;
    innerRef.current.rotation.y += 0.001;
    innerRef.current.rotation.z += 0.002;

    outerRef.current.rotation.x = innerRef.current.rotation.x;
    outerRef.current.rotation.y = innerRef.current.rotation.y;
    outerRef.current.rotation.z = innerRef.current.rotation.z;
  });

  return (
    <>
      <mesh
        {...props}
        ref={innerRef}
      >
        <boxGeometry args={[size, size, size]} />
        <meshPhongMaterial
          color={0xc82222}
          specular={0x000000}
          emissive={0x000000}
          refractionRatio={1}
          reflectivity={0}
          shininess={0}
        />
      </mesh>
      <mesh
        {...props}
        ref={outerRef}
        scale={1.1}
      >
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial side={BackSide} color={0xffffff} />
      </mesh>
    </>
  );
}
