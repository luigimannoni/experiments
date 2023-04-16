import React, { useRef } from "react";
import { Color } from "three";
import { useFrame } from "@react-three/fiber";

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
  const wireRef = useRef();
  useFrame(() => {
    if (source) {
      const { streamData } = source.sample();
      const channel = streamData[index];
      const attrs = {
        scale: Math.max(0.01, (channel / 255) * 2),
        squeeze: (1 / 255) * (255 - channel / 2),
        color: new Color(0x0),
      };

      ref.current.scale.x = attrs.squeeze;
      ref.current.scale.z = attrs.squeeze;
      ref.current.scale.y = attrs.scale;
      ref.current.position.y = attrs.scale / 2;
      ref.current.material.opacity = (1 / 255) * channel;

      wireRef.current.scale.x = attrs.squeeze;
      wireRef.current.scale.z = attrs.squeeze;
      wireRef.current.scale.y = attrs.scale;
      wireRef.current.position.y = attrs.scale / 2;

      ref.current.material.color.setHSL((0.27 / 128) * (255 - channel), 1, 0.5);
      wireRef.current.material.color.setHSL(
        (0.27 / 128) * (255 - channel),
        1,
        0.5
      );
    } else {
      ref.current.scale.x = 1;
      ref.current.scale.z = 1;
      ref.current.scale.y = 0.01;

      wireRef.current.scale.x = 1;
      wireRef.current.scale.z = 1;
      wireRef.current.scale.y = 0.01;

      ref.current.material.color.setHSL((0.27 / 128) * 255, 1, 0.5);
      wireRef.current.material.color.setHSL((0.27 / 128) * 255, 1, 0.5);
    }
  });

  return (
    <>
      <mesh {...props} position={position} scale={scale} ref={ref}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial
          color={color}
          opacity={opacity}
          specular={0x000000}
          emissive={0x000000}
          refractionRatio={1}
          reflectivity={0}
          shininess={0}
          transparent
        />
      </mesh>
      <mesh {...props} position={position} scale={scale} ref={wireRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={color} wireframe wireframeLinewidth={4} />
      </mesh>
    </>
  );
}
