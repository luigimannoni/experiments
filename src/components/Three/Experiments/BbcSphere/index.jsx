import React from 'react';
import raw from 'raw.macro';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

import Base from '../Base';

import Palette from '../../../../libs/Palette';

export default class BbcSphere extends Base {
  constructor(...args) {
    super(...args);
    this.renderer = null;
  }

  componentDidMount() {
    super.componentDidMount();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const innerColor = 0xff0000;
    const outerColor = 0xff9900;
    const innerSize = 55;
    const outerSize = 60;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff); // background

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Image Loader obj
    const imageLoader = new THREE.TextureLoader();
    imageLoader.setCrossOrigin('anonymous');

    const alpha = {
      stripe2px: imageLoader.load('/assets/alpha-2px-stripe.png'),
      world: imageLoader.load('/assets/alpha-world.png'),
    };

    alpha.stripe2px.wrapT = alpha.stripe2px.wrapS = THREE.RepeatWrapping;
    alpha.stripe2px.repeat.set(1, 2);

    alpha.world.wrapT = alpha.world.wrapS = THREE.RepeatWrapping;
    alpha.world.repeat.set(1, 1);


    // Grouped Mesh
    const globe = new THREE.Group();
    scene.add(globe);

    // Lights
    const light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 128, 128);
    scene.add(directionalLight);

    // Red Dash
    const sphereRedDash = new THREE.Mesh(
      new THREE.SphereGeometry(innerSize, 32, 32),
      new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        transparent: true,
        alphaTest: 0.99,
        alphaMap: alpha.stripe2px,
        shininess: 0,
        side: THREE.DoubleSide,
      }),
    );
    globe.add(sphereRedDash);

    // World
    const sphereWorld = new THREE.Mesh(
      new THREE.IcosahedronGeometry(innerSize, 4),
      new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        transparent: true,
        alphaTest: 0.5,
        alphaMap: alpha.world,
        shininess: 0,
        side: THREE.DoubleSide,
      }),
    );
    globe.add(sphereWorld);


    camera.position.z = -110;
    camera.lookAt(scene.position);
    const time = new THREE.Clock();

    const render = () => {
      super.beforeRender();
      const innerShift = Math.abs(Math.cos(((time.getElapsedTime() + 2.5) / 20)));
      const outerShift = Math.abs(Math.cos(((time.getElapsedTime() + 5) / 10)));

      alpha.stripe2px.offset.y = time.getElapsedTime() / 2;
      alpha.world.offset.x = -1 * (time.getElapsedTime() / 60);
      // alpha.world.offset.y = time.getElapsedTime() / 20;

      this.renderer.render(scene, camera);
      super.afterRender();
      super.raf = requestAnimationFrame(render);
    };

    render();


    // Events
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.domElement.remove();
  }

  render() {
    return <></>;
  }
}
