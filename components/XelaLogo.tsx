
import React from 'react';

interface XelaLogoProps {
  className?: string;
  color?: string;
}

export const XelaLogo: React.FC<XelaLogoProps> = ({ className = "h-10", color = "currentColor" }) => {
  return (
    <svg 
      viewBox="0 0 200 60" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M20 10L40 50M40 10L20 50" 
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      <circle cx="30" cy="30" r="8" fill={color} />
      <text 
        x="60" 
        y="42" 
        fontFamily="Cormorant Garamond, serif" 
        fontSize="40" 
        fontWeight="900" 
        fill={color}
        letterSpacing="-1"
        fontStyle="italic"
      >
        Xela
      </text>
    </svg>
  );
};
