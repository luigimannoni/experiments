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
];

const babylon = [
  {
    name: 'Shader GPU Post Processing',
    path: '/babylon/gpu-processing',
    component: 'Experiment',
  },
  // {
  //   name: 'Shader Layering',
  //   path: '/babylon/shader-layering',
  //   component: 'Experiment',
  // },
];


const javascript = [
  {
    name: 'MatterJS Simple Repulsor',
    path: '/javascript/matter-repulsor',
    component: 'Experiment',
  },
];

const css = [
  {
    name: 'Twisting Typography',
    path: '/css/twist-typography',
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
  {
    name: 'Pure CSS',
    children: css,
  },
];

export default urls;
