import React, { Component } from "react";

export default class Typography extends Component {
  Element({ text }) {
    return (
      <div className="typography--element">
        <span text={text} className="typography--element-span">
          {text}
        </span>
      </div>
    );
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
