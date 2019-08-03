import React from 'react';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Base from '../Base';
import Palette from '../../../../libs/Palette/index';

export default class Arc170 extends Base {
  componentDidMount() {
    super.componentDidMount();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    camera.position.x = -220;
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x222222, 0); // background

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new TrackballControls(camera);
    controls.target = scene.position;
    controls.minDistance = 50;
    controls.maxDistance = 300;

    // Background
    const background = new THREE.Mesh(
      new THREE.SphereGeometry(312, 32, 32),
      new THREE.MeshStandardMaterial({
        color: Palette.Lava.lighter,
        side: THREE.BackSide,
      }),
    );
    scene.add(background);

    // Lights
    const light = new THREE.AmbientLight(0x8);
    scene.add(light);

    const l1 = new THREE.PointLight(Palette.Lava.normal, 0.5);
    l1.position.set(0, -200, -200);
    scene.add(l1);

    const l2 = new THREE.PointLight(Palette.Lava.dark, 1.5);
    l2.position.set(0, 200, 200);
    scene.add(l2);


    // Mesh
    const loader = new GLTFLoader();
    loader.load(`${process.env.PUBLIC_URL}/assets/arc170/arc170.glb`, (gltf) => {
      const model = gltf;

      model.scene.scale.x = 100;
      model.scene.scale.y = 100;
      model.scene.scale.z = 100;
      scene.add(model.scene);
    });

    const render = () => {
      super.beforeRender();
      const time = performance.now() / 2000;

      l1.position.x = Math.sin(Math.sin(time)) * 250;
      l1.position.y = Math.sin(Math.cos(time)) * 250;
      l1.position.z = Math.sin(time) * 250;

      l2.position.x = Math.sin(time) * -250;
      l2.position.y = Math.cos(time) * -250;
      l2.position.z = Math.cos(Math.sin(time)) * -250;

      controls.update();
      renderer.render(scene, camera);


      super.afterRender();
      super.raf = requestAnimationFrame(render);
    };

    render();


    // Mouse and resize events
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize, false);
  }

  render() {
    return <></>;
  }
}
