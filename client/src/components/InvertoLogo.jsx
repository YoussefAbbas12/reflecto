import React from 'react';

export const InvertoLogo = ({ className = "h-7 w-auto" }) => {
  return (
    <img
      src="/assets/photo/seeda.png"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/assets/photo/seeda-dark-text.png';
        e.currentTarget.style.mixBlendMode = 'screen';
        e.currentTarget.style.filter = 'invert(1) hue-rotate(180deg)';
      }}
      alt="SEEDA"
      className={`${className} object-contain transition-opacity duration-200`}
    />
  );
};

export default InvertoLogo;
