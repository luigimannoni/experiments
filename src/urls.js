const three = [
  {
    name: 'Displacement shader',
    path: '/three/displacement',
    component: 'Experiment',
  },
  {
    name: 'ARC-170 Model Loader',
    path: '/three/arc170',
    component: 'Experiment',
  },
];

const babylon = [
  {
    name: 'Image postprocessing shader',
    path: '/babylon/image-postprocessing',
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
