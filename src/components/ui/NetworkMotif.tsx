import React from 'react';

interface NetworkMotifProps {
  className?: string;
  size?: number;
  color?: string;
  accentColor?: string;
}

export const NetworkMotif: React.FC<NetworkMotifProps> = ({
  className = '',
  size = 32,
  color = '#3F4238',
  accentColor = '#CB997E',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Network connection lines */}
      <line x1="24" y1="8" x2="10" y2="24" stroke={color} strokeWidth="2.5" strokeOpacity="0.4" />
      <line x1="24" y1="8" x2="38" y2="24" stroke={color} strokeWidth="2.5" strokeOpacity="0.4" />
      <line x1="10" y1="24" x2="38" y2="24" stroke={color} strokeWidth="2.5" strokeOpacity="0.5" />
      <line x1="10" y1="24" x2="24" y2="40" stroke={color} strokeWidth="2.5" strokeOpacity="0.4" />
      <line x1="38" y1="24" x2="24" y2="40" stroke={color} strokeWidth="2.5" strokeOpacity="0.4" />

      {/* Nodes: Projects, Creators, Communities, Connection */}
      <circle cx="24" cy="8" r="4.5" fill={color} />
      <circle cx="10" cy="24" r="4.5" fill={color} />
      <circle cx="38" cy="24" r="4.5" fill={color} />
      <circle cx="24" cy="40" r="4.5" fill={color} />
      <circle cx="24" cy="24" r="4" fill={accentColor} />
    </svg>
  );
};
