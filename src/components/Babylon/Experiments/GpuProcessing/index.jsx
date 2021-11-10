import React from 'react';
import raw from 'raw.macro';
import * as BABYLON from 'babylonjs';

import Base from '../Base';

const vertex = raw('./vertex.glsl');
const fragment = raw('./fragment.glsl');

const COLORS = {
  TARGET: '#440000',
  WAVE: '#000041',
};

export default class GpuProcessing extends Base {
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
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 300;
    camera.attachControl(this.renderer, false);

    const plane = BABYLON.MeshBuilder.CreatePlane('plane', { size: 100, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);

    BABYLON.Effect.ShadersStore.postprocessVertexShader = vertex;
    BABYLON.Effect.ShadersStore.postprocessFragmentShader = fragment;

    const material = new BABYLON.ShaderMaterial('shader', scene, { vertex: 'postprocess', fragment: 'postprocess' }, {
      attributes: ['position', 'uv'],
      uniforms: ['worldViewProjection', 'scale', 'wave', 'target'],
    });

    const imageList = {
      Leaves: '/assets/textures/generic/leaves.png',
      Building: '/assets/textures/generic/building.jpg',
      Chamber: '/assets/textures/generic/chamber.jpg',
      Plants: '/assets/textures/generic/plants.jpg',
      Road: '/assets/textures/generic/road.jpg',
      Radios: '/assets/textures/generic/radios.jpg',
    };
    const modeList = {
      Crossfade: 7,
      'Sine Crossfade': 0,
      'Box Crossblur': 3,
      Greyscale: 4,
      Overlay: 8,
      // Mirror: 12,
      'Channel 1 only': 1,
      'Channel 2 only': 2,
    };

    const options = {
      shaderMode: 0,
      hIterations: 2,
      vIterations: 2,
      channel1: imageList.Leaves,
      channel2: imageList.Plants,
      speed: 1.0,
      filterRed: 1.0,
      filterGreen: 1.0,
      filterBlue: 1.0,
    };

    const texture = {
      channel1: new BABYLON.Texture(options.channel1, scene, false, false),
      channel2: new BABYLON.Texture(options.channel2, scene, false, false),
    };

    material.setInt('mode', options.shaderMode);
    material.setInt('hIterations', options.hIterations);
    material.setInt('vIterations', options.vIterations);
    material.setFloat('speed', options.speed);
    material.setFloat('filterRed', options.filterRed);
    material.setFloat('filterGreen', options.filterGreen);
    material.setFloat('filterBlue', options.filterBlue);

    material.setTexture('channel1', texture.channel1, scene);
    material.setTexture('channel2', texture.channel2, scene);
    material.setColor3('target', new BABYLON.Color3.FromHexString(COLORS.TARGET));
    material.setColor3('wave', new BABYLON.Color3.FromHexString(COLORS.WAVE));

    const scale = this.renderer.width < this.renderer.height
      ? this.renderer.width : this.renderer.height;
    material.setVector2('scale', new BABYLON.Vector2(scale, scale));

    plane.material = material;
    // Rotate plane 180 degrees
    plane.rotation = new BABYLON.Vector3(Math.PI, 0, 0);

    // Render Loop
    let time = 0;
    this.engine.runRenderLoop(() => {
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

      this.engine.resize();
    });

    const updateFuncs = {
      loadImage: () => {
        document.getElementById('file-image').click();
      },
    };

    function changeImageTo(path, channel) {
      const image = new BABYLON.Texture(path, scene, false, false);
      material.setTexture(channel, image, scene);
    }

    function injectImage(evt) {
      const { files } = evt.target;
      const [f] = files;
      const reader = new FileReader();

      reader.onload = (() => (e) => {
        changeImageTo(e.target.result, 'channel1');
      })(f);

      reader.readAsDataURL(f);
    }

    // Loaders
    document.getElementById('file-image').addEventListener('change', injectImage, false);

    // Adds GUI stuff
    const gui = super.gui();
    gui.add(updateFuncs, 'loadImage').name('Upload custom image');
    gui.add(options, 'channel1', imageList).name('Image Channel 1').onChange(() => { changeImageTo(options.channel1, 'channel1'); });
    gui.add(options, 'channel2', imageList).name('Image Channel 2').onChange(() => { changeImageTo(options.channel2, 'channel2'); });
    gui.add(options, 'shaderMode', modeList).name('Shader mode').onChange(() => {
      material.setInt('mode', options.shaderMode);
    });
    gui.add(options, 'speed').name('Speed').min(0.01).max(2.00)
      .onChange(() => {
        material.setFloat('speed', options.speed.toFixed(2));
      });

    const guiBlur = gui.addFolder('Blur Settings');

    guiBlur.add(options, 'hIterations').name('Horizontal Step').step(1).min(1)
      .max(5)
      .onChange(() => {
        material.setInt('hIterations', options.hIterations.toFixed(0));
      });

    guiBlur.add(options, 'vIterations').name('Vertical Step').step(1).min(1)
      .max(5)
      .onChange(() => {
        material.setInt('vIterations', options.vIterations.toFixed(0));
      });
    guiBlur.close();

    const guiColor = gui.addFolder('Color Settings');
    guiColor.add(options, 'filterRed').name('R').min(0.01).max(1.00)
      .onChange(() => {
        material.setFloat('filterRed', options.filterRed.toFixed(2));
      });
    guiColor.add(options, 'filterGreen').name('G').min(0.01).max(1.00)
      .onChange(() => {
        material.setFloat('filterGreen', options.filterGreen.toFixed(2));
      });
    guiColor.add(options, 'filterBlue').name('B').min(0.01).max(1.00)
      .onChange(() => {
        material.setFloat('filterBlue', options.filterBlue.toFixed(2));
      });
    guiColor.close();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  render() {
    return (
      <>
        <input type="file" style={{ display: 'none' }} id="file-image" accept="image/gif, image/jpeg, image/png" />
      </>
    );
  }
}
