import React, { Component } from 'react';
import Three from '../Three';

export default class Experiment extends Component {
  
  pascalCase = (s) => s.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());

  render404() {
    return (
      <p>404!</p>
    )
  }

  render() {
    const ComponentMap = {
      Three,
    };

    const { match } = this.props;
    const { type, name } = match.params;
    const Component = ComponentMap[this.pascalCase(type)];
    const Experiment = Component[this.pascalCase(name)];

    if (!Component || !Experiment) {
      return this.render404();
    }

    return (
      <p>Experiment Component</p>
    );
  }
}
