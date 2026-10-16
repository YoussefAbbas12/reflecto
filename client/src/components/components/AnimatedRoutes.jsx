import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const AnimatedRoutes = React.memo(({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [location.pathname]);

  return (
    <div
      key={location.pathname}
      style={{
        animation: 'pageFadeIn 0.35s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
});

export default AnimatedRoutes;
