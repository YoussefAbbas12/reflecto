import React from 'react';

/**
 * InvertoLogo Component
 * Uses the inverto.jpg image provided in /assets/photo/inverto.jpg
 * (renders inverto-white.png with fallback to inverto.jpg)
 */
export const InvertoLogo = ({ className = "h-7 w-auto" }) => {
  return (
    <img
      src="/assets/photo/inverto-white.png"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/assets/photo/inverto.jpg';
        e.currentTarget.style.mixBlendMode = 'screen';
        e.currentTarget.style.filter = 'invert(1) hue-rotate(180deg)';
      }}
      alt="INVERTO"
      className={`${className} object-contain transition-opacity duration-200`}
    />
  );
};

export default InvertoLogo;
