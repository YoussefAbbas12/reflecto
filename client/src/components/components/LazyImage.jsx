import React, { useState, useRef, useEffect, useCallback } from 'react';

const LazyImage = React.memo(({
  src,
  alt,
  className = '',
  placeholder = null,
  errorFallback = null,
  loadingClassName = 'bg-white/[0.02]',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && src) {
            img.src = src;
            observerRef.current?.unobserve(img);
          }
        });
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src]);

  if (hasError && errorFallback) {
    return errorFallback;
  }

  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 flex items-center justify-center ${loadingClassName}`} aria-hidden="true">
          {placeholder || (
            <div className="w-8 h-8 border-2 border-[#FF5C35] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
      <picture>
        {/* If WebP/AVIF endpoints exist, add source tags here */}
        <img
          ref={imgRef}
          alt={alt || "Media image"}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  );
});

export default LazyImage;