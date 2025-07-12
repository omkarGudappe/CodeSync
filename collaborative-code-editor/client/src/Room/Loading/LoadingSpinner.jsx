import React from 'react';
import '../Styles/LoadingSpinner.css'; // Import the CSS file

const LoadingSpinner = () => {

    const bracket1 = '{';
    const bracket2 = '}';

    document.body.style.backgroundColor='black';

  return (
      <div className="code-spinner">
        <div className="brackets">
          <div className="bracket left">{bracket1}</div>
          <div className="bracket right">{bracket2}</div>
        </div>
        
        <div className="typing-container">
          <span className="typing">Loading...</span>
          <span className="cursor"></span>
        </div>
        
        <div className="peers">
          <div className="peer-dot"></div>
          <div className="peer-dot"></div>
          <div className="peer-dot"></div>
        </div>
      </div>
  );
};

export default LoadingSpinner;