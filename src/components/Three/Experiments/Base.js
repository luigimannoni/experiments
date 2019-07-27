import { Component } from 'react';
import Stats from '../../../libs/Stats';

export default class GPU extends Component {
  componentDidMount() {
    Stats.mount();
  }

  componentWillUnmount() {
    Stats.end();
  }

  beforeRender() {
    Stats.begin();
  }

  afterRender() {
    Stats.end();
  }
}
