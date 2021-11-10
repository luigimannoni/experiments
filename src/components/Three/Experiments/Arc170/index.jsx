import React from 'react';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import Base from '../Base';

const BLOOM = {
  ANIMATE: true,
  EXP: 1,
  STR: 1,
  THRES: 0,
  RAD: 0.2,
};

export default class Arc170 extends Base {
  constructor(...args) {
    super(...args);
    this.renderer = null;
  }

  componentDidMount() {
    super.componentDidMount();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      10,
      5000,
    );

    camera.position.x = -1500;
    camera.position.z = 1500;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x222222, 0);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const controls = new TrackballControls(camera, this.renderer.domElement);
    controls.target = scene.position;
    controls.minDistance = 800;
    controls.maxDistance = 2000;

    // Skybox
    const r = '/assets/skyboxes/nebula1024_';
    const urls = [
      `${r}px.png`, `${r}nx.png`,
      `${r}py.png`, `${r}ny.png`,
      `${r}pz.png`, `${r}nz.png`,
    ];

    const textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;
    textureCube.encoding = THREE.sRGBEncoding;
    scene.background = textureCube;

    // Lights
    const light = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(light);

    const l1 = new THREE.PointLight(0xffffff, 0.5);
    l1.position.set(0, -2000, -2000);
    scene.add(l1);

    const l2 = new THREE.PointLight(0xffffff, 1.5);
    l2.position.set(0, 2000, 2000);
    scene.add(l2);

    let arc170 = null;
    // Model Mesh
    const loader = new GLTFLoader();
    loader.load(`${process.env.PUBLIC_URL}/assets/arc170/scene.gltf`, (gltf) => {
      [arc170] = gltf.scene.children;
      scene.add(arc170);
    });

    // Post processing
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85,
    );

    bloomPass.threshold = BLOOM.THRES;
    bloomPass.strength = BLOOM.STR;
    bloomPass.radius = BLOOM.RAD;

    const composer = new EffectComposer(this.renderer);

    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const render = () => {
      super.beforeRender();
      const time = performance.now() / 2000;

      l1.position.x = Math.sin(Math.sin(time)) * 2000;
      l1.position.y = Math.sin(Math.cos(time)) * 2000;
      l1.position.z = Math.sin(time) * 2000;

      l2.position.x = Math.sin(time) * -2000;
      l2.position.y = Math.cos(time) * -2000;
      l2.position.z = Math.cos(Math.sin(time)) * -2000;

      if (arc170 && arc170.rotation) {
        arc170.rotation.y = Math.cos(time) / 2;
      }

      controls.update();
      composer.render();

      super.afterRender();

      super.raf = requestAnimationFrame(render);
    };

    render();

    // Mouse and resize events
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      composer.reset();
    };
    window.addEventListener('resize', onWindowResize, false);

    // Adds GUI stuff
    const gui = super.gui();

    const guiBloom = gui.addFolder('Bloom Effect');
    guiBloom.add(this.renderer, 'toneMappingExposure', 0, 1).step(0.001).name('Exposure').listen();
    guiBloom.add(bloomPass, 'threshold', 0, 2).step(0.001).name('Cut threshold');
    guiBloom.add(bloomPass, 'strength', 0, 2).step(0.1).name('Strength').listen();
    guiBloom.add(bloomPass, 'radius', 0, 2).step(0.1).name('Radius').listen();
    guiBloom.add(BLOOM, 'ANIMATE').name('Animate bloom');
    guiBloom.open();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.domElement.remove();
  }

  render() {
    return <></>;
  }
}
