import { useEffect, useRef, useCallback } from 'react';

/**
 * Warns the user before leaving the page if there are unsaved changes.
 * Returns a `markSaved` callback to call after a successful save.
 */
export function useUnsavedWarning(hasChanges) {
  const dirty = useRef(false);

  useEffect(() => {
    dirty.current = hasChanges;
  }, [hasChanges]);

  useEffect(() => {
    const handler = (e) => {
      if (!dirty.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const markSaved = useCallback(() => {
    dirty.current = false;
  }, []);

  return markSaved;
}
