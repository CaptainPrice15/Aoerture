import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Hook to enforce image protection for non-authenticated users.
 * Blocks:
 * 1. Right-click context menu (Save image as, Copy image address)
 * 2. Mobile press-and-hold touch callouts
 * 3. Drag and drop of images
 * 4. Keyboard inspection shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
 */
export const useImageProtection = (isAuthenticated) => {
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const triggerToast = useCallback((msg = 'Protected media • Sign in as Admin to download') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  useEffect(() => {
    // If admin is logged in, do not restrict inspection or right-click
    if (isAuthenticated) return;

    // 1. Prevent right-click / context menu
    const handleContextMenu = (e) => {
      const isMediaTarget =
        e.target.tagName === 'IMG' ||
        e.target.tagName === 'VIDEO' ||
        e.target.closest('.protected-media') ||
        e.target.closest('.group') ||
        e.target.closest('.yarl__container');

      if (isMediaTarget || !isAuthenticated) {
        e.preventDefault();
        triggerToast('Image protection active • Right-click disabled');
      }
    };

    // 2. Prevent dragging images out of browser or into new tabs
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        e.preventDefault();
      }
    };

    // 3. Block developer tools and save shortcuts
    const handleKeyDown = (e) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        triggerToast('Developer inspection is restricted');
        return false;
      }

      // Ctrl+Shift+I / Cmd+Option+I (Inspect)
      if (cmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        e.stopPropagation();
        triggerToast('Developer inspection is restricted');
        return false;
      }

      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if (cmdOrCtrl && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        e.stopPropagation();
        triggerToast('Developer inspection is restricted');
        return false;
      }

      // Ctrl+Shift+C / Cmd+Option+C (Element Picker)
      if (cmdOrCtrl && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        triggerToast('Element selection is restricted');
        return false;
      }

      // Ctrl+U / Cmd+Option+U (View Page Source)
      if (cmdOrCtrl && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        triggerToast('Source view is restricted');
        return false;
      }

      // Ctrl+S / Cmd+S (Save Webpage)
      if (cmdOrCtrl && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        e.stopPropagation();
        triggerToast('Direct page saving is disabled');
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [isAuthenticated, triggerToast]);

  return { toastMessage };
};
