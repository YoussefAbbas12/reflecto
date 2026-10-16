import React from 'react';

const Card = React.memo(({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  const variants = {
    default: 'bg-[#000000]/60 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border-0',
    elevated: 'bg-white/[0.02] backdrop-blur-3xl shadow-[0_20px_50px_rgb(0,0,0,0.8)] border-0',
    highlighted: 'bg-[#FF5C35]/5 backdrop-blur-2xl shadow-inner border-0',
    outline: 'bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] border-0',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <section
      className={`
        rounded-2xl relative overflow-hidden h-full
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </section>
  );
});

export default Card;