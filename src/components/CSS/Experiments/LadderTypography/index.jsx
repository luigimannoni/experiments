/* eslint-disable react/no-array-index-key */
import React from 'react';
import './style.scss';

const LadderTypography = () => (
  <>
    <div className="typography typography--ladder">
      <div className="typography--ladder--container">
        {
          Array(40).fill('Stepper').map((value, index) => (
            <div key={index} className="typography--ladder--element">
              <span text={value} className="typography--ladder--element-span">{value}</span>
            </div>
          ))
        }
      </div>
    </div>
  </>
);

export default LadderTypography;
