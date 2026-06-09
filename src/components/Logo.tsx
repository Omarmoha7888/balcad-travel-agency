import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

export function Logo({ className = '', size = '55px' }: LogoProps) {
  return (
    <img 
      logo.png" 
      alt="Balcad Travel Agency" 
      className={`inline-block object-contain mix-blend-multiply ${className}`}
      style={{ 
        width: size, 
        height: '55px', 
        maxHeight: '100%',
        transform: 'scale(1.2)' // Waxay xogaa kale sii weynaynaysaa baaxadda sawirka
      }}
    />
  );
}
