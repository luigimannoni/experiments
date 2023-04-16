/* eslint-disable react/jsx-filename-extension */
import React from "react";
import { SiThreedotjs, SiCss3 } from "react-icons/si";
import { HiOutlineCubeTransparent } from "react-icons/hi";
import { IoLogoJavascript } from "react-icons/io";

const three = [
  {
    name: "Displacement shader",
    path: "/three/displacement",
    component: "Experiment",
  },
  {
    name: "ARC-170 GLTF Model Loader",
    path: "/three/arc170",
    component: "Experiment",
  },
  {
    name: "Audio Visualizer",
    path: "/three/audio-visualizer",
    component: "Experiment",
  },
  // {
  //   name: 'Particle Cosmos',
  //   path: '/three/particle-cosmos',
  //   component: 'Experiment',
  // },
];

const babylon = [
  {
    name: "Shader GPU Post Processing",
    path: "/babylon/gpu-processing",
    component: "Experiment",
  },
  // {
  //   name: 'Shader Layering',
  //   path: '/babylon/shader-layering',
  //   component: 'Experiment',
  // },
];

const javascript = [
  {
    name: "MatterJS Simple Repulsor",
    path: "/javascript/matter-repulsor",
    component: "Experiment",
  },
];

const css = [
  {
    name: "Twisting Typography",
    path: "/css/twist-typography",
    component: "Experiment",
  },
  {
    name: "Ladder Typography",
    path: "/css/ladder-typography",
    component: "Experiment",
  },
  {
    name: "Ticker Typography",
    path: "/css/ticker-typography",
    component: "Experiment",
  },
];

const urls = [
  {
    name: "Three",
    children: three,
    icon: () => <SiThreedotjs size="18" />,
  },
  {
    name: "Babylon",
    children: babylon,
    icon: () => <HiOutlineCubeTransparent size="18" />,
  },
  {
    name: "Javascript",
    children: javascript,
    icon: () => <IoLogoJavascript size="18" />,
  },
  {
    name: "CSS3",
    children: css,
    icon: () => <SiCss3 size="18" />,
  },
];

export default urls;
