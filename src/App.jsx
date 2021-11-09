/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import slugify from 'slugify';

import Renderer from './components/Renderer';
import Navigator from './components/Navigator';

import routes from './routes';
import urls from './urls';

import './App.scss';

export default class App extends Component {
  render() {
    return (
      <BrowserRouter basename="/">
        <Navigator links={urls} />

        <div id="main-screen" className="App">
          <Routes>
            {routes.map((route) => {
              const Component = Renderer[route.component];
              const key = slugify(route.path);

              return (
                <Route
                  key={key}
                  path={route.path}
                  exact={route.exact}
                  element={<Component />}
                />
              );
            })}
          </Routes>
        </div>
      </BrowserRouter>
    );
  }
}
