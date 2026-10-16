import React from 'react';

/**
 * Icon component mapping to Google Material Symbols Outlined
 * @param {Object} props
 * @param {string} props.name - The Material Symbol name
 * @param {string} [props.className] - Additional classes
 * @param {string} [props.ariaLabel] - ARIA label for accessibility
 */
const Icon = React.memo(({ name, className = '', ariaLabel, ...props }) => {
  return (
    <span 
      className={`material-symbols-outlined ${className}`} 
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      {...props}
    >
      {name}
    </span>
  );
});

export default Icon;
