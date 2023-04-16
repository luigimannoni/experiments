import { Component } from "react";
import Stats from "../../../libs/Stats";

export default class Base extends Component {
  constructor({}) {
    super();
  }

  componentDidMount() {
    Stats.mount();
  }

  componentWillUnmount() {
    Stats.unmount();
    cancelAnimationFrame(this.raf);
  }

  beforeRender() {
    Stats.begin();
  }

  afterRender() {
    Stats.end();
  }
}
