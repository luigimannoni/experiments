import { Component } from 'react';
import Stats from '../../../libs/Stats';
import GUI from '../../../libs/GUI';


export default class Base extends Component {
  componentDidMount() {
    Stats.mount();
    GUI.mount();
  }

  componentWillUnmount() {
    Stats.unmount();
    GUI.unmount();
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
}
