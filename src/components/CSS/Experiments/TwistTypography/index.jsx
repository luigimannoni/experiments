import React from 'react';
import './style.scss';

const TwistTypography = () => (
  <>
    <div className="typography">
      <div className="typography--container">
        {
          Array(40).fill('Typography').map((value, index) => (
            <div className="typography--element">
              <span text={value} className="typography--element-span">{value}</span>
            </div>
          ))
        }
      </div>
    </div>
  </>
);

export default TwistTypography;
