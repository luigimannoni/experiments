import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import slugify from 'slugify';

import './style.scss';

export default class Navigator extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      open: false,
      active: null,
    };
  }

  renderUrls() {
    const { links } = this.props;

    return links.map((url) => {
      const parentKey = slugify(url.name);

      return (
        <li key={parentKey}>
          <span>{url.name}</span>
          <ul className="sub-level">
            {
              url.children.map((child) => {
                const childKey = slugify(`${parentKey}-${child.name}`);
                return (
                  <li key={childKey}>
                    <Link to={child.path}>{child.name}</Link>
                  </li>
                );
              })
            }
          </ul>
        </li>
      );
    });
  }

  render() {
    const { links } = this.props;

    return (
      <nav className="site-navigator">
        <Link to="/" className="logo">
          <img src="/assets/cube.png" alt="Experiments" />
        </Link>

        <ul className="top-level">
          {links ? this.renderUrls() : null}
        </ul>

        <span className="handle">
          <span className="line" />
        </span>
      </nav>
    );
  }
}
