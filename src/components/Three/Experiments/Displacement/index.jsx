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
  LIGHT_1: Palette.Synth.normal,
  LIGHT_2: Palette.Synth.darker,
  IRRADIATE: false,
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
        color: COLORS.LIGHT_2,
        side: THREE.BackSide,
      }),
    );
    scene.add(background);

    // Lights
    const light = new THREE.AmbientLight(0x8);
    scene.add(light);

    const l1 = new THREE.PointLight(COLORS.LIGHT_1, 0.5);
    l1.position.set(0, -200, -200);
    scene.add(l1);

    const l2 = new THREE.PointLight(COLORS.LIGHT_2, 1.5);
    l2.position.set(0, 200, 200);
    scene.add(l2);

    const l3 = new THREE.PointLight(COLORS.PLASMA, 1.25);
    l3.position.set(0, 0, 0);
    scene.add(l3);

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
        value: 20.0,
      },
      displacement: {
        type: 'f',
        value: 12.0,
      },
      lowStep: {
        type: 'f',
        value: -1,
      },
      hiStep: {
        type: 'f',
        value: 1,
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

      l1.position.x = Math.sin(Math.sin(time)) * 250;
      l1.position.y = Math.sin(Math.cos(time)) * 250;
      l1.position.z = Math.sin(time) * 250;

      l2.position.x = Math.sin(time) * -250;
      l2.position.y = Math.cos(time) * -250;
      l2.position.z = Math.cos(Math.sin(time)) * -250;

      bloomPass.exposure = Math.abs(Math.cos(time)) * 0.5;
      bloomPass.strength = Math.abs(Math.cos(time)) * 0.2 + 0.5;

      uniforms.time.value = time / 5;

      if (COLORS.IRRADIATE) {
        l1.visible = false;
        l2.visible = false;
        l3.visible = true;
      } else {
        l1.visible = true;
        l2.visible = true;
        l3.visible = false;
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

    const recolor = () => {
      uniforms.color.value = new THREE.Color(COLORS.PLASMA);
      l1.color = new THREE.Color(COLORS.LIGHT_1);
      l2.color = new THREE.Color(COLORS.LIGHT_2);
      l3.color = new THREE.Color(COLORS.PLASMA);
    };

    // Adds GUI stuff
    const gui = super.gui();

    const guiDisplacement = gui.addFolder('Displacement');
    guiDisplacement.add(uniforms.scale, 'value', 0, 2).step(0.01).name('Resolution');
    guiDisplacement.add(uniforms.displacement, 'value', 0, 110).name('Elevation');
    guiDisplacement.add(uniforms.speed, 'value', 10, 50).name('Morph speed');
    guiDisplacement.open();

    const guiColor = gui.addFolder('Color Settings');
    guiColor.add(uniforms.lowStep, 'value', -2, 0).name('Starting elevation');
    guiColor.add(uniforms.hiStep, 'value', 0, 2).name('Smoothness');
    guiColor.addColor(COLORS, 'PLASMA').name('Plasma').onChange(recolor);
    guiColor.addColor(COLORS, 'LIGHT_1').name('Env light 1').onChange(recolor);
    guiColor.addColor(COLORS, 'LIGHT_2').name('Env light 2').onChange(recolor);
    guiColor.add(COLORS, 'IRRADIATE').name('Irradiate from plasma').onChange(recolor);
    guiColor.open();

    const guiBloom = gui.addFolder('Bloom Effect');
    guiBloom.add(uniforms.lowStep, 'value', -2, 0).name('Starting elevation');
    guiBloom.add(uniforms.hiStep, 'value', 0, 2).name('Smoothness');
    guiBloom.addColor(COLORS, 'PLASMA').name('Plasma').onChange(recolor);
    guiBloom.addColor(COLORS, 'LIGHT_1').name('Env light 1').onChange(recolor);
    guiBloom.addColor(COLORS, 'LIGHT_2').name('Env light 2').onChange(recolor);
    guiBloom.add(COLORS, 'LIGHT_2').name('Irradiate from plasma').onChange(recolor);
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
