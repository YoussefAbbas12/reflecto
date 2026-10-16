import React, { useState, useEffect, useRef } from 'react';

const ScrollAnimation = React.memo(({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '-40px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up': return 'translate3d(0, 25px, 0)';
      case 'down': return 'translate3d(0, -25px, 0)';
      case 'left': return 'translate3d(25px, 0, 0)';
      case 'right': return 'translate3d(-25px, 0, 0)';
      default: return 'translate3d(0, 25px, 0)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s, transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
});

export default ScrollAnimation;
