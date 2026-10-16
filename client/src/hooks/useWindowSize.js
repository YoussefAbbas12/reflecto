import { useState, useEffect, useCallback } from 'react';

const useWindowSize = (options = {}) => {
  const {
    debounceDelay = 0,
    ssr = false,
  } = options;

  const getSize = useCallback(() => {
    if (ssr && typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isLargeDesktop: width >= 1280,
      aspectRatio: width / height,
    };
  }, [ssr]);

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (debounceDelay > 0) {
      let timeoutId;

      const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setWindowSize(getSize());
        }, debounceDelay);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
      };
    }

    const handleResize = () => {
      setWindowSize(getSize());
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [getSize, debounceDelay]);

  return windowSize;
};

export default useWindowSize;
