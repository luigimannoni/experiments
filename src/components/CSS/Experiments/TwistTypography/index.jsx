/* eslint-disable react/no-array-index-key */
import React from "react";
import "./style.scss";

const TwistTypography = () => (
  <>
    <div className="typography typography--twist">
      <div className="typography--twist--container">
        {Array(40)
          .fill("Twister")
          .map((value, index) => (
            <div key={index} className="typography--twist--element">
              <span text={value} className="typography--twist--element-span">
                {value}
              </span>
            </div>
          ))}
      </div>
    </div>
  </>
);

export default TwistTypography;
