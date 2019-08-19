import React from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import SC from 'soundcloud';

import Base from '../Base';

import Helpers from '../../../../libs/Utils/helpers';
import Audio from '../../../../libs/Utils/audio';

const BLOOM = {
  ANIMATE: true,
  EXP: 1,
  STR: 0.3,
  THRES: 0,
  RAD: 0.5,
};

export default class SoundcloudVisualizer extends Base {
  constructor(...args) {
    super(...args);
    this.renderer = null;
    this.player = null;
  }

  componentDidMount() {
    super.componentDidMount();

    this.player = document.createElement('audio');
    this.player.autoplay = true;
    this.player.loop = true;
    document.body.appendChild(this.player);
    const audioSource = Audio.Analyzer(this.player);
    console.log(audioSource);

    const SC_KEY = '26095b994cc185bc665f4c9fcce8f211';
    SC.initialize({
      client_id: SC_KEY,
    });
    SC.get('/resolve', { url: 'https://soundcloud.com/noton-info/alva-noto-uni-blue' }).then((res) => {
      if (res.errors) {
        console.error(res.errors);
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        this.player.crossOrigin = 'anonymous';
        this.player.setAttribute('src', `${res.stream_url}?client_id=${SC_KEY}`);
        this.player.play();
      }
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      5000,
    );
    scene.fog = new THREE.Fog(0x000000, 600, 1500);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);


    const group = new THREE.Group();
    scene.add(group);


    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);


    const planeGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      diffuse: 0x000000,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.y = -2;
    plane.rotation.x = Helpers.deg(-90);

    scene.add(plane);


    const cubeDimension = 45;
    const cubeRows = 9;
    const cubeColumns = 9;
    const cubePadding = 3;
    const cubes = [];
    const cubesWireframe = [];
    const cubeGeometry = new THREE.BoxGeometry(cubeDimension, 1, cubeDimension);

    for (let column = 0; column < cubeColumns; column += 1) {
      for (let row = 0; row < cubeRows; row += 1) {
        const cube = new THREE.Mesh(
          cubeGeometry,
          new THREE.MeshPhongMaterial({
            color: 0x2c75ff,
            transparent: true,
            shininess: 85,
            opacity: 0.05,
          }),
        );

        cube.position.x = column * cubeDimension + cubePadding * column;
        cube.position.z = row * cubeDimension + cubePadding * row;

        group.add(cube);
        cubes.push(cube);

        const cubeW = new THREE.Mesh(
          cubeGeometry,
          new THREE.MeshPhongMaterial({
            color: 0x2c75ff,
            transparent: false,
            wireframe: true,
            wireframeLinewidth: 2,
          }),
        );

        cubeW.position.x = column * cubeDimension + cubePadding * column;
        cubeW.position.z = row * cubeDimension + cubePadding * row;

        group.add(cubeW);

        cubesWireframe.push(cubeW);
      }
    }

    camera.position.z = -150;
    camera.position.y = 150;

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

    const time = new THREE.Clock();
    const centerCube = 40;

    const render = () => {
      super.beforeRender();

      camera.position.x = Math.cos(time.getElapsedTime() / 4) * 450 + cubes[centerCube].position.x;
      camera.position.z = Math.sin(time.getElapsedTime() / 4) * 450 + cubes[centerCube].position.z;
      const sample = audioSource.sample();
      const mental = Math.min(
        Math.max(Math.tan(sample.volumeHi / 6500) * 0.5),
        2,
      ) || 0;

      camera.position.y = 65 + 120 * mental;
      plane.material.color.setHSL(0, 0, mental);
      bloomPass.strength = mental / 3 + 0.2;

      if (sample.streamData && sample.streamData.length > 0) {
        for (let i = sample.streamData.length - 1; i >= 0; i -= 1) {
          if (cubes[i] && sample.streamData[i]) {
            const channel = sample.streamData[i];
            const attrs = {
              scale: (channel + 0.1) / 3,
              squeeze: 1 / 255 * (255 - channel / 2),
              color: new THREE.Color(0x0).setHSL(0.27 / 128 * (255 - channel), 1, 0.5),
            };

            cubes[i].scale.y = attrs.scale;
            cubes[i].position.y = attrs.scale / 2;
            cubes[i].scale.x = attrs.squeeze;
            cubes[i].scale.z = attrs.squeeze;
            cubes[i].material.opacity = 1 / 255 * channel;

            cubesWireframe[i].scale.y = attrs.scale;
            cubesWireframe[i].position.y = attrs.scale / 2;
            cubesWireframe[i].scale.x = attrs.squeeze;
            cubesWireframe[i].scale.z = attrs.squeeze;

            cubesWireframe[i].material.color = attrs.color;
            cubes[i].material.color = attrs.color;
          }
        }
      }

      camera.lookAt(cubes[centerCube].position);
      composer.render();

      super.afterRender();
      super.raf = requestAnimationFrame(render);
    };

    render();

    const gui = super.gui();
    gui.hide();

    const resizeWindow = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      composer.reset();
    };

    window.addEventListener('resize', resizeWindow, false);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.domElement.remove();
    this.player.remove();
  }

  render() {
    return <></>;
  }
}
