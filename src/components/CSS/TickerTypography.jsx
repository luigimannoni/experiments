/* eslint-disable react/no-array-index-key */
import React from "react";

import "./sass/ticker.scss";
import { useControls } from "leva";

const TickerTypography = () => {
  const type = useControls({
    text: "Supreme!",
    color: "#fff",
    background: "#c82222",
    fontSize: { value: 175, min: 150, max: 150 },
    letterSpacing: { value: -10, min: -10, max: 250 },
    lineHeight: { value: 1, min: 0, max: 10 },
    "--var-weight": { min: 100, max: 900, value: 900 },
    "--var-slant": { min: -10, max: 0, value: -10 },
  });

  const element = useControls({
    rotate: { value: -15, min: -20, max: 20 },
  });

  const span = useControls({
    duration: { value: 60, min: 30, max: 120 },
  });

  return (
    <div
      style={{
        background: type.background,
      }}
    >
      <div
        style={{
          color: type.color,
          fontSize: type.fontSize,
          letterSpacing: type.letterSpacing,
          "--var-weight": type["--var-weight"],
          "--var-slant": type["--var-slant"],
        }}
        className="typography typography--ticker"
      >
        <div className="typography--ticker--container">
          {[...Array(20)].map((_i, i) => (
            <div
              key={i}
              className="typography--ticker--element"
              style={{
                transform: `rotate(${element.rotate}deg)`,
                paddingTop: type.lineHeight,
                paddingBottom: type.lineHeight,
              }}
            >
              <div
                className="typography--ticker--element-span-wrap"
                style={{
                  animationDuration: `${span.duration}s`,
                }}
              >
                {[...Array(30)].map((_j, j) => (
                  <span key={j} className="typography--ticker--element-span">
                    {type.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TickerTypography;
