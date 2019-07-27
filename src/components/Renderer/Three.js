import React from 'react';
import GPU from './Base/GPU';

export default class Three extends GPU {
  componentDidMount() {

  }

  render() {
    const { match } = this.props;
    console.log(match);
    
    return (
      <div>
        <p>Three Component</p>
      </div>
    );
  }
}
