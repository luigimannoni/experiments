import React from 'react';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Base from '../Base';
// import Palette from '../../../../libs/Palette/index';

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
      0.1,
      5000,
    );

    camera.position.x = -1500;
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
      `${r}right1.png`, `${r}left2.png`,
      `${r}top3.png`, `${r}bottom4.png`,
      `${r}front5.png`, `${r}back6.png`,
    ];

    const textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;
    textureCube.encoding = THREE.sRGBEncoding;

    const cubeShader = THREE.ShaderLib.cube;
    const skyboxMaterial = new THREE.ShaderMaterial({
      fragmentShader: cubeShader.fragmentShader,
      vertexShader: cubeShader.vertexShader,
      uniforms: cubeShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide,
    });

    skyboxMaterial.uniforms.tCube.value = textureCube;
    Object.defineProperty(skyboxMaterial, 'map', {
      get() {
        return this.uniforms.tCube.value;
      },
    });

    const skybox = new THREE.Mesh(
      new THREE.BoxBufferGeometry(5000, 5000, 5000),
      skyboxMaterial,
    );
    scene.add(skybox);

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
      this.renderer.render(scene, camera);


      super.afterRender();
      super.raf = requestAnimationFrame(render);
    };

    render();


    // Mouse and resize events
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize, false);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.domElement.remove();
  }

  render() {
    return <></>;
  }
}
