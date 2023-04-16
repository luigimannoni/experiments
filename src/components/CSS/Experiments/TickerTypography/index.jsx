/* eslint-disable react/no-array-index-key */
import React from "react";

import "./style.scss";

const TickerTypography = () => {
  // const type = useTweaks("Text", {
  //   text: "SicParvisMagna",
  //   color: "#fff",
  //   fontSize: { value: 175, min: 150, max: 250 },
  //   letterSpacing: { value: 1, min: -10, max: 250 },
  //   lineHeight: { value: 1, min: 0, max: 10 },
  //   "--var-weight": { min: 100, max: 900, value: 700 },
  //   "--var-slant": { min: -10, max: 0, value: 0 },
  // });

  // const element = useTweaks("Element", {
  //   rotate: { value: -15, min: -20, max: 20 },
  // });

  // const span = useTweaks("Text", {
  //   duration: { value: 20, min: 1, max: 40 },
  // });

  return (
    <>
      <div
        style={{
          color: type.color,
          fontSize: type.fontSize,
          letterSpacing: type.letterSpacing,
          lineHeight: type.lineHeight,
          "--var-weight": type["--var-weight"],
          "--var-slant": type["--var-slant"],
        }}
        className="typography typography--ticker"
      >
        <div className="typography--ticker--container">
          {[...Array(15)].map((_i, i) => (
            <div
              key={i}
              className="typography--ticker--element"
              style={{
                transform: `rotate(${element.rotate}deg)`,
              }}
            >
              {[...Array(3)].map((_j, j) => (
                <span
                  key={j}
                  style={{
                    animationDuration: `${span.duration}s`,
                  }}
                  text={type.text}
                  className="typography--ticker--element-span"
                >
                  {type.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TickerTypography;
