import { useState, useEffect, useCallback } from 'react';

const useScroll = (options = {}) => {
  const {
    threshold = 0,
    preventOnTouch = false,
  } = options;

  const [scrollData, setScrollData] = useState({
    y: 0,
    direction: 'up',
    progress: 0,
    isScrolling: false,
    velocity: 0,
  });

  const handleScroll = useCallback(() => {
    if (preventOnTouch && 'ontouchstart' in window) {
      return;
    }

    const currentY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = documentHeight > 0 ? (currentY / documentHeight) * 100 : 0;

    setScrollData((prev) => {
      const direction = currentY > prev.y ? 'down' : 'up';
      const deltaY = currentY - prev.y;
      const velocity = Math.abs(deltaY);

      return {
        y: currentY,
        direction,
        progress: Math.min(Math.max(progress, 0), 100),
        isScrolling: true,
        velocity,
      };
    });
  }, [preventOnTouch]);

  const handleScrollEnd = useCallback(() => {
    setScrollData((prev) => ({
      ...prev,
      isScrolling: false,
      velocity: 0,
    }));
  }, []);

  useEffect(() => {
    let scrollTimeout;

    const onScroll = () => {
      handleScroll();

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 150);
    };

    if (threshold > 0) {
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      window.removeEventListener('scroll', threshold > 0 ? onScroll : handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll, handleScrollEnd, threshold]);

  return scrollData;
};

export default useScroll;
