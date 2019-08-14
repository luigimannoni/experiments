import React from 'react';
import raw from 'raw.macro';
import * as BABYLON from 'babylonjs';

import Base from '../Base';

const vertex = raw('./vertex.glsl');
const fragment = raw('./fragment.glsl');

export default class ImageProcessing extends Base {
  constructor(...args) {
    super(...args);
    this.renderer = null;
  }

  componentDidMount() {
    super.componentDidMount();

    this.renderer = document.createElement('canvas');
    this.renderer.style = 'width:100%;height:100%;';
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

    const earth = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 100 }, scene);

    BABYLON.Effect.ShadersStore.postprocessVertexShader = vertex;
    BABYLON.Effect.ShadersStore.postprocessFragmentShader = fragment;


    const material = new BABYLON.ShaderMaterial('shader', scene, { vertex: 'postprocess', fragment: 'postprocess' }, {
      attributes: ['position', 'uv'],
      uniforms: ['worldViewProjection', 'scale'],
    });

    const texture = {
      channel1: new BABYLON.Texture('/assets/textures/earth/sphere-noclouds-8k.jpg', scene, false, false),
      channel2: new BABYLON.Texture('/assets/textures/earth/sphere-night-8k.jpg', scene, false, false),
    };

    material.setTexture('channel1', texture.channel1, scene);
    material.setTexture('channel2', texture.channel2, scene);

    const scale = this.renderer.width < this.renderer.height
      ? this.renderer.width : this.renderer.height;
    material.setVector2('scale', new BABYLON.Vector2(scale, scale));

    earth.material = material;

    // Skybox

    const skybox = BABYLON.Mesh.CreateBox('skybox', 5000.0, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial('skybox', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.disableLighting = true;
    const loadExts = [
      '_px.png', '_py.png',
      '_pz.png', '_nx.png',
      '_ny.png', '_nz.png',
    ];
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('/assets/skyboxes/bluenebula1024', scene, loadExts);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    // Bloom
    const bloom = new BABYLON.GlowLayer('bloom', scene);
    bloom.intensity = 10.5;


    // Render Loop
    let time = 0;
    engine.runRenderLoop(() => {
      super.beforeRender();
      material.setFloat('time', time);
      time += 0.005;
      skybox.rotation.x = time / 50;
      earth.rotation.y = -time / 2;
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

    // Adds GUI stuff
    // const gui = super.gui();

    // const guiDisplacement = gui.addFolder('Displacement');
    // guiDisplacement.add(uniforms.scale, 'value', 0, 2).step(0.01).name('Resolution');
    // guiDisplacement.add(uniforms.displacement, 'value', 0, 110).name('Elevation');
    // guiDisplacement.add(uniforms.speed, 'value', 10, 50).name('Morph speed');
    // guiDisplacement.open();

    // const guiColor = gui.addFolder('Color Settings');
    // guiColor.add(uniforms.lowStep, 'value', -2, 0).name('Starting elevation');
    // guiColor.add(uniforms.hiStep, 'value', 0, 2).name('Smoothness');
    // guiColor.addColor(COLORS, 'PLASMA').name('Plasma').onChange(recolor);
    // guiColor.addColor(COLORS, 'LIGHT_1').name('Env light 1').onChange(recolor);
    // guiColor.addColor(COLORS, 'LIGHT_2').name('Env light 2').onChange(recolor);
    // guiColor.add(COLORS, 'EQUALIZE').name('Env matches plasma').onChange(recolor);
    // guiColor.open();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.remove();
  }

  render() {
    return <></>;
  }
}
