const three = [
  {
    name: 'Displacement shader',
    path: '/three/displacement',
    component: 'Experiment',
  },
  {
    name: 'ARC-170 GLTF Model Loader',
    path: '/three/arc170',
    component: 'Experiment',
  },
  {
    name: 'Soundcloud Visualizer',
    path: '/three/soundcloud-visualizer',
    component: 'Experiment',
  },
  // {
  //   name: 'BBC Sphere',
  //   path: '/three/bbc-sphere',
  //   component: 'Experiment',
  // },
];

const babylon = [
  {
    name: 'Shader Post Processing',
    path: '/babylon/image-processing',
    component: 'Experiment',
  },
  {
    name: 'Shader Layering',
    path: '/babylon/shader-layering',
    component: 'Experiment',
  },
];


const javascript = [
  {
    name: 'MatterJS Simple Repulsor',
    path: '/javascript/matter-repulsor',
    component: 'Experiment',
  },
];

const urls = [
  {
    name: 'Three',
    children: three,
  },
  {
    name: 'Babylon',
    children: babylon,
  },
  {
    name: 'Javascript',
    children: javascript,
  },
];

export default urls;
