import React from 'react';
import raw from 'raw.macro';
import * as BABYLON from 'babylonjs';

import Base from '../Base';

const vertex = raw('./vertex.glsl');
const fragment = raw('./fragment.glsl');
// const waterFragment = raw('./waterFragment.glsl');

export default class ShaderLayering extends Base {
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

    const earth = BABYLON.MeshBuilder.CreateSphere('earth', { diameter: 100 }, scene);
    earth.rotation.x = 180 / 180 * Math.PI;

    // const clouds = BABYLON.MeshBuilder.CreateSphere('clouds', { diameter: 102 }, scene);
    // clouds.rotation.x = 180 / 180 * Math.PI;
    BABYLON.Effect.ShadersStore.earthVertexShader = vertex;
    BABYLON.Effect.ShadersStore.earthFragmentShader = fragment;

    // Create a material with our land texture.
    const material = {
      earth: new BABYLON.StandardMaterial('earth', scene),
      clouds: new BABYLON.StandardMaterial('clouds', scene),
      shader: new BABYLON.ShaderMaterial('shader', scene, { vertex: 'earth', fragment: 'earth' }, {
        attributes: ['position', 'uv'],
        uniforms: ['worldViewProjection', 'scale'],
      }),
    };

    const textures = {
      color: new BABYLON.Texture('/assets/textures/earth/earth-day.jpg', scene),
      color2: new BABYLON.Texture('/assets/textures/earth/earth-night.jpg', scene),
      specular: new BABYLON.Texture('/assets/textures/earth/earth-specular.jpg', scene),
      normal: new BABYLON.Texture('/assets/textures/earth/earth-normal.jpg', scene),
      bump: new BABYLON.Texture('/assets/textures/earth/earth-bump.jpg', scene),
      clouds: new BABYLON.Texture('/assets/textures/earth/clouds.jpg', scene),
      cloudsTransparency: new BABYLON.Texture('/assets/textures/earth/clouds-transparency.png', scene),
    };

    material.shader.setTexture('diffuseTexture1', textures.color, scene);
    material.shader.setTexture('diffuseTexture2', textures.color2, scene);
    material.shader.setTexture('specularTexture', textures.specular, scene);

    material.earth.diffuseTexture = textures.color;
    material.earth.specularTexture = textures.specular;
    material.earth.bumpTexture = textures.normal;

    material.clouds.diffuseTexture = textures.clouds;
    material.clouds.opacityTexture = textures.cloudsTransparency;
    material.clouds.backFaceCulling = true;


    earth.material = material.shader;
    // clouds.material = material.clouds;

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

    // Illumination and bloom

    const light = new BABYLON.PointLight('light', new BABYLON.Vector3(0, 0, -220), scene);
    light.setEnabled(true);

    const bloom = new BABYLON.GlowLayer('bloom', scene);
    bloom.intensity = 10.5;


    // Render Loop
    let time = 0;
    engine.runRenderLoop(() => {
      super.beforeRender();
      time += 0.005;
      material.shader.setFloat('time', time);

      skybox.rotation.x = time / 50;
      earth.rotation.y = -time / 2;
      // clouds.rotation.y = -time / 3;
      scene.render();
      super.afterRender();
    });

    // Resize event
    window.addEventListener('resize', () => {
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