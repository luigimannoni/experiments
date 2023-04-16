import * as BABYLON from "babylonjs";
import { Component } from "react";

export default class Base extends Component {
  componentDidMount() {
    this.renderer = document.createElement("canvas");
    this.renderer.style = "width:100%; height:100%;";
    document.body.appendChild(this.renderer);

    this.engine = new BABYLON.Engine(this.renderer, true);
  }

  componentWillUnmount() {
    this.renderer.remove();
    this.engine.stopRenderLoop();
  }

  beforeRender() {}

  afterRender() {}
}
