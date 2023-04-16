import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function AnimatedLight({ color, intensity, distance }) {
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
}
