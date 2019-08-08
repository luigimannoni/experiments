/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { HashRouter, Route } from 'react-router-dom';
import slugify from 'slugify';

import Renderer from './components/Renderer';

import routes from './routes';
// import urls from './urls';
import './App.scss';
// import Navigator from './components/Navigator';

export default class App extends Component {
  render() {
    return (
      <HashRouter basename="/">
        {/* <Navigator links={urls} /> */}

        <div className="App">
          {routes.map((route) => {
            const ComponentName = Renderer[route.component];
            const key = slugify(route.path);

            return (
              <Route
                key={key}
                path={route.path}
                exact={route.exact}
                component={ComponentName}
              />
            );
          })}
        </div>
      </HashRouter>
    );
  }
}
