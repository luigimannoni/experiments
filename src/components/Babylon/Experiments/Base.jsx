import * as BABYLON from 'babylonjs';
import { Component } from 'react';
import Stats from '../../../libs/Stats';
import GUI from '../../../libs/GUI';

export default class Base extends Component {
  componentDidMount() {
    Stats.mount();
    GUI.mount();

    this.renderer = document.createElement('canvas');
    this.renderer.style = 'width:100%; height:100%;';
    document.body.appendChild(this.renderer);

    this.engine = new BABYLON.Engine(this.renderer, true);
  }

  componentWillUnmount() {
    Stats.unmount();
    GUI.unmount();
    this.renderer.remove();
    this.engine.stopRenderLoop();
    // cancelAnimationFrame(this.raf);
  }

  beforeRender() {
    Stats.begin();
  }

  afterRender() {
    Stats.end();
  }

  // Provide interface to dat.gui;
  gui() {
    return GUI.interface();
  }
}
