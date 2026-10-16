import React, { useRef, useEffect, useState, useCallback } from 'react';

const HeroVideo = React.memo(({
  src,
  webmSrc = '',
  poster = '',
  className = 'w-full h-full object-cover',
  ariaLabel = 'Background Video'
}) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Safe playback trigger
  const attemptPlay = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Strict DOM attribute enforcement for autoplay policies (iOS / Chrome / Safari)
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.playsInline = true;

    if (videoEl.paused) {
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Handled silently: browser autoplay restrictions will unlock upon user gesture
        });
      }
    }
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // React JSX attribute quirk workaround: set properties directly on DOM element
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.playsInline = true;
    videoEl.setAttribute('muted', '');
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', 'true');

    // Attempt playback immediately on mount
    attemptPlay();

    let isIntersecting = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
          if (entry.isIntersecting) {
            attemptPlay();
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(videoEl);

    // Fallback: If autoplay was temporarily blocked by low power mode or strict policy,
    // trigger playback seamlessly on the very first touch/click/scroll anywhere
    const handleUserInteraction = () => {
      if (videoEl && videoEl.paused && isIntersecting) {
        attemptPlay();
      }
    };

    window.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });
    window.addEventListener('mousedown', handleUserInteraction, { once: true, passive: true });
    window.addEventListener('scroll', handleUserInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true, passive: true });

    // Handle tab switching / screen unlock
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isIntersecting) {
        attemptPlay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('mousedown', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [src, attemptPlay]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      controls={false}
      onCanPlay={() => {
        setIsLoaded(true);
        attemptPlay();
      }}
      onLoadedData={() => {
        setIsLoaded(true);
        attemptPlay();
      }}
      className={`${className} transform-gpu will-change-transform transition-opacity duration-700 pointer-events-none select-none ${
        isLoaded ? 'opacity-100' : 'opacity-80'
      }`}
      aria-hidden="true"
      aria-label={ariaLabel}
    >
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  );
});

export default HeroVideo;
