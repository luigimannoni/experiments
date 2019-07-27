import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Renderer from './components/Renderer';

import routes from './routes';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <ul>
            {routes.map((route, index) => (
              <li key={index}>
                <Link to={route.path}>{route.component}</Link>
              </li>
            ))}
          </ul>

          <div className="App">
            {routes.map((route, index) => {
              const ComponentName = Renderer[route.component];
              
              return (
                <Route
                  key={index}
                  path={route.path}
                  exact={route.exact}
                  component={ComponentName}
                />
              )
            })}
          </div>
          
          <hr />
        </div>
      </Router>
    );
  }
}

