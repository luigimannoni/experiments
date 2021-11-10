/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import slugify from 'slugify';

import Renderer from './components/Renderer';
import Navigator from './components/Navigator';

import routes from './routes';
import urls from './urls';

import './App.scss';

export default class App extends Component {
  render() {
    return (
      <HashRouter basename="/">
        <Navigator links={urls} />

        <div id="main-screen" className="App">
          <Routes>
            {routes.map((route) => {
              const Element = Renderer[route.component];
              const key = slugify(route.path);

              return (
                <Route
                  key={key}
                  path={route.path}
                  exact={route.exact}
                  element={<Element />}
                />
              );
            })}
          </Routes>
        </div>
      </HashRouter>
    );
  }
}
