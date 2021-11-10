import React from 'react';
import { Canvas } from '@react-three/fiber';
import Box from '../Fiber/Box';

const Home = () => (
  <Canvas>
    <ambientLight />
    <pointLight position={[5, 5, 3]} intensity={0.5} />
    <Box position={[0, 0, 0]} />
  </Canvas>
);
export default Home;
