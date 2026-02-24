
import React from 'react';

export const ZeroByxLogo = ({ className = "" }: { className?: string }) => {
  return (
    <svg 
      className={className} 
      width="60" 
      height="60" 
      viewBox="0 0 60 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M10 30L25 15L50 15L35 30L50 45L25 45L10 30Z" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinejoin="round"
      />
      <circle 
        cx="30" 
        cy="30" 
        r="3" 
        fill="currentColor" 
      />
    </svg>
  );
};

export default ZeroByxLogo;
