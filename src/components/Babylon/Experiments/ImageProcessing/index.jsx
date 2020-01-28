import React from 'react';
import raw from 'raw.macro';
import * as BABYLON from 'babylonjs';

import Base from '../Base';

const vertex = raw('./vertex.glsl');
const fragment = raw('./fragment.glsl');

const COLORS = {
  TARGET: '#440000',
  WAVE: '#000088',
};


export default class ImageProcessing extends Base {
  constructor(...args) {
    super(...args);
    this.renderer = null;
  }

  componentDidMount() {
    super.componentDidMount();

    this.renderer = document.createElement('canvas');
    this.renderer.style = 'width:100%; height:100%;';
    document.body.appendChild(this.renderer);

    const engine = new BABYLON.Engine(this.renderer, true);

    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera('camera1', 0, 0, 100, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setPosition(new BABYLON.Vector3(200, 100, -200));
    camera.orthoTop = 1;
    camera.orthoBottom = -1;
    camera.orthoRight = 1;
    camera.orthoLeft = -1;
    camera.attachControl(this.renderer, false);

    const box = BABYLON.MeshBuilder.CreateBox('box', { size: 100 }, scene);

    BABYLON.Effect.ShadersStore.postprocessVertexShader = vertex;
    BABYLON.Effect.ShadersStore.postprocessFragmentShader = fragment;


    const material = new BABYLON.ShaderMaterial('shader', scene, { vertex: 'postprocess', fragment: 'postprocess' }, {
      attributes: ['position', 'uv'],
      uniforms: ['worldViewProjection', 'scale', 'wave', 'target'],
    });

    const texture = {
      channel1: new BABYLON.Texture('/assets/textures/generic/leaves.png', scene, false, false),
    };

    material.setTexture('channel1', texture.channel1, scene);

    const scale = this.renderer.width < this.renderer.height
      ? this.renderer.width : this.renderer.height;
    material.setVector2('scale', new BABYLON.Vector2(scale, scale));

    box.material = material;

    // Render Loop
    let time = 0;
    engine.runRenderLoop(() => {
      super.beforeRender();
      material.setFloat('time', time);
      time += 0.005;
      scene.render();
      super.afterRender();
    });


    // Resize event
    window.addEventListener('resize', () => {
      const rScale = this.renderer.width < this.renderer.height
        ? this.renderer.width : this.renderer.height;
      material.setVector2('scale', new BABYLON.Vector2(rScale, rScale));

      engine.resize();
    });


    const recolor = (color) => {
      material.setColor3(color.toLowerCase(), new BABYLON.Color3.FromHexString(COLORS[color]));
    };

    // Adds GUI stuff
    const gui = super.gui();

    const guiColor = gui.addFolder('Color Settings');
    guiColor.addColor(COLORS, 'TARGET').name('Target overlay').onChange(() => { recolor('TARGET'); });
    guiColor.addColor(COLORS, 'WAVE').name('Waves color').onChange(() => { recolor('WAVE'); });
    guiColor.open();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.remove();
  }

  render() {
    return <></>;
  }
}