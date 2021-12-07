import React, { useRef } from 'react';
import { Color } from 'three';
import { useFrame } from '@react-three/fiber';

export default function Channel(props) {
  const {
    position = [0, 0, 0],
    scale = [1, 1, 1],
    color = new Color(0x0),
    source = null,
    index = 0,
    opacity = 1,
  } = props;
  const ref = useRef();
  useFrame(() => {
    if (source) {
      const {
        streamData,
      } = source.sample();
      const channel = streamData[index];
      // const attrs = {
      //   scale: (channel + 0.1) / 3,
      //   squeeze: (1 / 255) * (255 - channel / 2),
      //   color: new Color(0x0),
      // };

      // scale[0] = attrs.squeeze;
      // scale[2] = attrs.squeeze;
      // scale[1] = attrs.scale;
      // position[1] = attrs.scale / 2;
      // opacity = (1 / 255) * channel;

      color.setHSL((0.27 / 128) * (255 - channel), 1, 0.5);
    }
  });

  return (
    <>
      <mesh
        {...props}
        position={position}
        scale={scale}
        ref={ref}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial
          color={color}
          opacity={opacity}
          specular={0x000000}
          emissive={0x000000}
          refractionRatio={1}
          reflectivity={0}
          shininess={0}
        />
      </mesh>
    </>
  );
}
