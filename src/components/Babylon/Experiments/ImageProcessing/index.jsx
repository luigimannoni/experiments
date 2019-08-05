import React from 'react';
import raw from 'raw.macro';
import * as BABYLON from 'babylonjs';

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
  EQUALIZE: false,
};

const BLOOM = {
  ANIMATE: true,
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

    const BABYLON = window.BABYLON;
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    window.addEventListener('DOMContentLoaded', () => {  
    
        
      const engine = new BABYLON.Engine(canvas, true);
    
      const scene = new BABYLON.Scene(engine);
    
      const camera = new BABYLON.ArcRotateCamera('camera1', 0, 0, 1, new BABYLON.Vector3(0, 0, 0), scene);
      camera.setPosition(new BABYLON.Vector3(200, 100, -200));
      camera.orthoTop = 1;
      camera.orthoBottom = -1;
      camera.orthoRight = 1;
      camera.orthoLeft = -1;
      camera.attachControl(canvas, false);
    
      const box = BABYLON.MeshBuilder.CreateBox('box', {size: 100}, scene);
    
      const material = new BABYLON.ShaderMaterial('shader', scene, './image', {
          attributes: ['position', 'uv'],
          uniforms: ['worldViewProjection', 'scale'],
        });
      
      const texture = {
        baboon: new BABYLON.Texture('https://cdn.glitch.com/5a5a336b-3ac6-4e6d-b1c0-4705c8ad0b84%2Fbaboon.bmp'),
        leaves: new BABYLON.Texture('https://cdn.glitch.com/28365d3c-fc13-48bb-a8a5-b8b69e262103%2Fleaves.png'),
      };
      
      material.setTexture('channel1', texture.baboon, scene);
      material.setTexture('channel2', texture.leaves, scene);
    
      const scale = canvas.width < canvas.height? canvas.width: canvas.height;
      material.setVector2('scale', new BABYLON.Vector2(scale, scale));
    
      box.material = material;
    
      // Render Loop
      let time = 0;
      engine.runRenderLoop(() => {
        material.setFloat('time', time);
        time += 0.01;
        scene.render();
      });
    
      // Resize event
      window.addEventListener('resize', () => {
        const scale = canvas.width < canvas.height? canvas.width: canvas.height;
        material.setVector2('scale', new BABYLON.Vector2(scale, scale));
    
        engine.resize();
      });
    });

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
    guiColor.add(COLORS, 'EQUALIZE').name('Env matches plasma').onChange(recolor);
    guiColor.open();

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
