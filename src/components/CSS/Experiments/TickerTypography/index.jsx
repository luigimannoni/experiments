/* eslint-disable react/no-array-index-key */
import React from 'react';
import { useTweaks } from 'use-tweaks';

import './style.scss';

const TickerTypography = () => {
  const type = useTweaks('Text', {
    text: 'SicParvisMagna',
    color: '#fff',
    fontSize: { value: 175, min: 150, max: 250 },
    letterSpacing: { value: 1, min: -10, max: 250 },
    lineHeight: { value: 1, min: 0, max: 10 },
    '--var-weight': { min: 100, max: 900, value: 600 },
    '--var-slant': { min: -10, max: 0, value: 0 },
  });

  return (
    <>
      <div
        style={type}
        className="typography typography--ticker"
      >
        <div className="typography--ticker--container">
          {
          [...Array(15)].map((_i, i) => (
            <div key={i} className="typography--ticker--element">
              {[...Array(3)].map((_j, j) => (
                <span key={j} text={type.text} className="typography--ticker--element-span">{type.text}</span>
              ))}
            </div>
          ))
        }
        </div>
      </div>
    </>
  );
};

export default TickerTypography;
