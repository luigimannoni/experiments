import React from 'react';
import raw from 'raw.macro';
import * as BABYLON from 'babylonjs';

import Base from '../Base';

const vertex = raw('./vertex.glsl');
const fragment = raw('./fragment.glsl');
const atmosphereFragment = raw('./atmosphereFragment.glsl');

export default class ShaderLayering extends Base {
  constructor(...args) {
    super(...args);
    this.renderer = null;
  }

  componentDidMount() {
    super.componentDidMount();

    const scene = new BABYLON.Scene(this.engine);

    const camera = new BABYLON.ArcRotateCamera('camera1', 0, 0, 100, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setPosition(new BABYLON.Vector3(200, 100, -200));
    camera.orthoTop = 1;
    camera.orthoBottom = -1;
    camera.orthoRight = 1;
    camera.orthoLeft = -1;
    camera.attachControl(this.renderer, false);

    const renderPipeline = new BABYLON.DefaultRenderingPipeline('default', true, scene, [camera]);
    renderPipeline.bloomEnabled = true;
    renderPipeline.fxaaEnabled = true;
    renderPipeline.bloomWeight = 1;
    renderPipeline.cameraFov = camera.fov;
    renderPipeline.imageProcessing.toneMappingEnabled = true;
    renderPipeline.imageProcessing.vignetteEnabled = true;
    renderPipeline.imageProcessing.vignetteColor = new BABYLON.Color4(0, 0, 0, 1);
    renderPipeline.imageProcessing.vignetteWeight = 1;
    renderPipeline.imageProcessing.contrast = 1;
    renderPipeline.imageProcessing.exposure = 1;

    const earth = BABYLON.MeshBuilder.CreateSphere('earth', { diameter: 100 }, scene);
    earth.rotation.x = Math.PI;

    const atmosphere = BABYLON.MeshBuilder.CreateSphere('atmosphere', { diameter: 102 }, scene);
    atmosphere.rotation.x = Math.PI;

    // Assign Shaders to stores
    BABYLON.Effect.ShadersStore.baseVertexShader = vertex;
    BABYLON.Effect.ShadersStore.earthFragmentShader = fragment;

    BABYLON.Effect.ShadersStore.atmosphereVertexShader = vertex;
    BABYLON.Effect.ShadersStore.atmosphereFragmentShader = atmosphereFragment;

    // Create a material with our land texture.
    const material = {

      atmosphere: new BABYLON.ShaderMaterial('atmosphere', scene, { vertex: 'base', fragment: 'earth' }, {
        needAlphaBlending: true,
        attributes: ['position', 'uv'],
        uniforms: ['worldViewProjection'],
      }),

      earth: new BABYLON.ShaderMaterial('earth', scene, { vertex: 'base', fragment: 'earth' }, {
        attributes: ['position', 'uv'],
        uniforms: ['worldViewProjection'],
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

    material.earth.setTexture('diffuseTexture1', textures.color, scene);
    material.earth.setTexture('diffuseTexture2', textures.color2, scene);
    material.earth.setTexture('specularTexture', textures.specular, scene);

    material.earth.diffuseTexture = textures.color;
    material.earth.specularTexture = textures.specular;
    material.earth.bumpTexture = textures.normal;
    material.atmosphere.backFaceCulling = true;

    earth.material = material.earth;
    atmosphere.material = material.earth;

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

    // Render Loop
    let time = 0;
    this.engine.runRenderLoop(() => {
      super.beforeRender();
      time += 0.005;
      material.earth.setFloat('time', time);

      skybox.rotation.x = time / 50;
      earth.rotation.y = -time / 2;
      // clouds.rotation.y = -time / 3;
      scene.render();
      super.afterRender();
    });

    // Resize event
    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    // Adds GUI stuff
    const gui = super.gui();
    gui.add(renderPipeline.imageProcessing, 'contrast', 0.5, 3).name('Contrast');
    gui.add(renderPipeline.imageProcessing, 'exposure', 0.5, 3).name('Exposure');
    gui.add(renderPipeline, 'fxaaEnabled').name('FXAA');
    gui.add(renderPipeline, 'bloomEnabled').name('Bloom');
    gui.add(renderPipeline, 'bloomWeight', 0, 2).name('Bloom Weight');
    gui.add(renderPipeline.imageProcessing, 'toneMappingEnabled').name('Tone Mapping');
    gui.add(renderPipeline.imageProcessing, 'vignetteEnabled').name('Vignette');
    gui.add(renderPipeline.imageProcessing, 'vignetteWeight', 0, 2).name('Vignette Weight');
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.remove();
  }

  render() {
    return <></>;
  }
}
