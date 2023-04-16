import React from "react";
import { Canvas } from "@react-three/fiber";
import Box from "../Fiber/Box";
import Wireground from "../Fiber/Wireground";

function Home() {
  return (
    <Canvas>
      <color attach="background" args={[0x111111]} />
      <directionalLight
        position={[-10, -5, 20]}
        intensity={1}
        color={0xffffff}
      />
      <hemisphereLight
        color={0xffffff}
        groundColor={0x0a0f0f}
        intensity={0.6}
      />
      <Box position={[0, 0, 0]} size={1.5} />
      <Wireground position={[0, -4, 0]} />
      <fogExp2 args={[0x111111, 5, 20]} />
    </Canvas>
  );
}

export default Home;
