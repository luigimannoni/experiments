import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import slugify from 'slugify';

import './style.scss';

export default class Navigator extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      open: false,
      activeParent: null,
      activeChild: null,
    };
    this.toggleNavigator = this.toggleNavigator.bind(this);
    this.setActive = this.setActive.bind(this);
  }

  setActive(parentKey, childKey) {
    this.setState({
      activeParent: parentKey,
      activeChild: childKey,
    });
  }

  toggleNavigator(opened) {
    this.setState(prevState => ({
      open: opened || !prevState.open,
    }));
  }

  renderUrls() {
    const { links } = this.props;
    const { open, activeParent, activeChild } = this.state;

    return links.map((url) => {
      const parentKey = slugify(url.name);
      const parentClass = activeParent === parentKey ? 'active' : '';

      return (
        <li
          key={parentKey}
          className={parentClass}
          onClick={() => { this.setActive(parentKey, false); }}
        >
          <span>{url.icon && url.icon()} {url.name}</span>
          <ul className="sub-level">
            {
              url.children.map((child) => {
                const childKey = slugify(`${parentKey}-${child.name}`);
                const childClass = activeChild === childKey ? 'active' : '';

                return (
                  <li key={childKey} className={childClass}>
                    <Link
                      to={child.path}
                      onClick={() => {
                        this.setActive(parentKey, childKey);
                        this.toggleNavigator(!open);
                      }}
                    >
                      {child.name}
                    </Link>
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
    const { open } = this.state;
    const navClass = open ? 'is-open' : '';
    const btnClass = open ? 'is-active' : '';

    return (
      <nav
        onMouseEnter={() => { this.toggleNavigator(true); }}
        className={`site-navigator ${navClass}`}
      >
        <Link to="/" className="logo">
          <img src="/assets/cube.png" alt="Experiments" />
        </Link>

        <ul className="top-level">
          {links ? this.renderUrls() : null}
        </ul>


        <button
          onClick={() => { this.toggleNavigator(!open); }}
          className={`hamburger hamburger--arrowturn ${btnClass}`}
          type="button"
        >
          <span className="hamburger-box">
            <span className="hamburger-inner" />
          </span>
        </button>

      </nav>
    );
  }
}
