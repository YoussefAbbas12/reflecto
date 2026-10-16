import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling when a modal or overlay is active.
 * Prevents background page scrolling while allowing scrolling inside the modal.
 */
export default function useBodyScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    
    // Prevent scrolling on background page
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isLocked]);
}
