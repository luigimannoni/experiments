import React, { Component } from "react";
import GUI from "../../../../libs/GUI";
import "./style.scss";

export default class Typography extends Component {
  constructor(...args) {
    super(...args);
  }

  Element({ text }) {
    return (
      <div className="typography--element">
        <span text={text} className="typography--element-span">
          {text}
        </span>
      </div>
    );
  }

  componentDidMount() {
    GUI.mount();
  }

  componentWillUnmount() {
    GUI.unmount();
  }

  render() {
    return (
      <>
        <div className="typography">
          <div className="typography--container">
            {Array(40)
              .fill(null)
              .map((value, index) => (
                <this.Element text="Twist" key={index} />
              ))}
          </div>
        </div>
      </>
    );
  }
}
