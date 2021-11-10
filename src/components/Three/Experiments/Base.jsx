import { Component } from 'react';
import Stats from '../../../libs/Stats';
import GUI from '../../../libs/GUI';
import Pane from '../../../libs/Pane';

export default class Base extends Component {
  constructor({ tweakpane = false }) {
    super();
    this.tweakpane = tweakpane;
  }

  componentDidMount() {
    Stats.mount();
    if (this.tweakpane) {
      Pane.mount();
    } else {
      GUI.mount();
    }
  }

  componentWillUnmount() {
    Stats.unmount();
    if (this.tweakpane) {
      Pane.unmount();
    } else {
      GUI.unmount();
    }
    cancelAnimationFrame(this.raf);
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

  // Provide interface to Tweakpane;
  pane() {
    return Pane.interface();
  }
}
