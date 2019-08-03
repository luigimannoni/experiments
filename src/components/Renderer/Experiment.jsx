import React, { Component } from 'react';
import Three from '../Three';

export default class Experiment extends Component {
  static pascalCase(s) {
    return s.replace(/(\w)(\w*)/g, (_g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()).replace(/-/g, '');
  }

  static render404() {
    return (
      <p>404!</p>
    );
  }

  render() {
    const ComponentMap = {
      Three,
    };

    const { match } = this.props;
    const { type, name } = match.params;
    const MainComponent = ComponentMap[Experiment.pascalCase(type)] || null;
    const TrueComponent = MainComponent ? MainComponent[Experiment.pascalCase(name)] : null;

    if (!MainComponent || !TrueComponent) {
      return Experiment.render404();
    }

    return (
      <TrueComponent />
    );
  }
}
