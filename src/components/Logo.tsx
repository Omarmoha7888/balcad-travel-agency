import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

export function Logo({ className = '', size = '100%' }: LogoProps) {
  return (
    <img 
      src="/logo.png" 
      alt="Balcad Travel Agency Logo" 
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: 'auto' }}
    />
  );
}
