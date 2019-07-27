import { Component } from 'react';
import Stats from '../../../libs/Stats';

export default class Base extends Component {
  componentDidMount() {
    Stats.mount();
  }

  componentWillUnmount() {
    Stats.unmount();
  }

  beforeRender() {
    Stats.begin();
  }

  afterRender() {
    Stats.end();
  }
}
