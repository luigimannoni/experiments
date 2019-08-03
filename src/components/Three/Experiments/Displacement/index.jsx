import React from 'react';
import raw from 'raw.macro';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import Base from '../Base';

import Palette from '../../../../libs/Palette';

const vertex = raw('./vertex.glsl');
const fragment = raw('./fragment.glsl');

const COLORS = {
  LIGHT: Palette.Synth.lighter,
  PLASMA: Palette.Synth.light,
  BACKGROUND: Palette.Synth.dark,
  OMNI_LIGHT_1: Palette.Synth.normal,
  OMNI_LIGHT_2: Palette.Synth.darker,
};

const PARAMS = {
  EXP: 1,
  STR: 0.9,
  THRES: 0,
  RAD: 2,
};

export default class Displacement extends Base {
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
      1000,
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000, 0); // background
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const controls = new TrackballControls(camera, this.renderer.domElement);
    controls.target = scene.position;
    controls.minDistance = 125;
    controls.maxDistance = 225;

    // Background
    const background = new THREE.Mesh(
      new THREE.SphereGeometry(350, 32, 32),
      new THREE.MeshStandardMaterial({
        color: COLORS.OMNI_LIGHT_2,
        side: THREE.BackSide,
      }),
    );
    scene.add(background);

    // Lights
    const light = new THREE.AmbientLight(0x8);
    scene.add(light);

    const sun = new THREE.PointLight(COLORS.OMNI_LIGHT_1, 0.5);
    sun.position.set(0, -200, -200);
    scene.add(sun);

    const moon = new THREE.PointLight(COLORS.OMNI_LIGHT_2, 1.5);
    moon.position.set(0, 200, 200);
    scene.add(moon);


    camera.position.z = -120;

    const uniforms = {
      time: {
        value: 1.0,
      },
      scale: {
        value: 1.0,
      },
      speed: {
        type: 'f',
        value: 0.1,
      },
      displacement: {
        type: 'f',
        value: 12.0,
      },
      vNoise: {
        type: 'f',
        value: 0,
      },
      color: {
        type: 'c',
        value: new THREE.Color(COLORS.PLASMA),
      },
    };


    const BlobShader = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
    });

    // Sphere Glass Outer
    const Blob = new THREE.Mesh(
      new THREE.DodecahedronGeometry(46, 3),
      BlobShader,
    );
    scene.add(Blob);

    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85,
    );

    bloomPass.exposure = PARAMS.EXP;
    bloomPass.threshold = PARAMS.THRES;
    bloomPass.strength = PARAMS.STR;
    bloomPass.radius = PARAMS.RAD;

    const composer = new EffectComposer(this.renderer);

    composer.addPass(renderPass);
    composer.addPass(bloomPass);


    const render = () => {
      super.beforeRender();

      const time = performance.now() / 10e3;

      sun.position.x = Math.sin(Math.sin(time)) * 250;
      sun.position.y = Math.sin(Math.cos(time)) * 250;
      sun.position.z = Math.sin(time) * 250;

      moon.position.x = Math.sin(time) * -250;
      moon.position.y = Math.cos(time) * -250;
      moon.position.z = Math.cos(Math.sin(time)) * -250;

      bloomPass.exposure = Math.abs(Math.cos(time)) * 0.5;
      bloomPass.strength = Math.abs(Math.cos(time)) * 0.2 + 0.5;

      uniforms.time.value = time / 5;
      const un = Math.cos(time / 1) + 1;

      uniforms.scale.value = 1;

      uniforms.displacement.value = 10;
      uniforms.vNoise.value = un * 5 + 2;
      uniforms.speed.value = 10;


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
    gui.add(uniforms.time, 'value', 0, 1).listen();

    gui.addColor(COLORS, 'LIGHT');
    gui.addColor(uniforms.color, 'value');
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.domElement.remove();
  }

  render() {
    return <></>;
  }
}
