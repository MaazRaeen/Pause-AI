import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'md', 
  fullPage = false, 
  message = 'Loading...' 
}) => {
  const spinnerClass = `spinner spinner-${size}`;

  if (fullPage) {
    return (
      <div className="full-page-loader">
        <div className="loader-content">
          <div className={spinnerClass}></div>
          {message && <p>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="inline-loader">
      <div className={spinnerClass}></div>
      {message && <span>{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
