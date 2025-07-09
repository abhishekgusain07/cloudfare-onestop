import { useEffect, useCallback, useRef, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
  disabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  target?: HTMLElement | Document;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
  target = document,
}: UseKeyboardShortcutsOptions) => {
  const shortcutsRef = useRef(shortcuts);
  
  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const activeShortcuts = shortcutsRef.current.filter(shortcut => !shortcut.disabled);

    for (const shortcut of activeShortcuts) {
      const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const matchesCtrl = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
      const matchesShift = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
      const matchesAlt = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
      const matchesMeta = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    target.addEventListener('keydown', handleKeyDown);
    return () => target.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled, target]);

  return {
    shortcuts: shortcutsRef.current,
  };
};

// Music-specific keyboard shortcuts
export const useMusicKeyboardShortcuts = (handlers: {
  onPlayPause?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onToggleTrimmer?: () => void;
  onResetTrim?: () => void;
  onSave?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: ' ',
      description: 'Play/Pause music preview',
      action: handlers.onPlayPause || (() => {}),
      disabled: !handlers.onPlayPause,
    },
    {
      key: 'ArrowUp',
      description: 'Increase volume',
      action: handlers.onVolumeUp || (() => {}),
      disabled: !handlers.onVolumeUp,
    },
    {
      key: 'ArrowDown',
      description: 'Decrease volume',
      action: handlers.onVolumeDown || (() => {}),
      disabled: !handlers.onVolumeDown,
    },
    {
      key: 't',
      description: 'Toggle audio trimmer',
      action: handlers.onToggleTrimmer || (() => {}),
      disabled: !handlers.onToggleTrimmer,
    },
    {
      key: 'r',
      description: 'Reset trim selection',
      action: handlers.onResetTrim || (() => {}),
      disabled: !handlers.onResetTrim,
    },
    {
      key: 's',
      ctrlKey: true,
      description: 'Save session',
      action: handlers.onSave || (() => {}),
      disabled: !handlers.onSave,
    },
  ];

  return useKeyboardShortcuts({ shortcuts });
};

// Editor keyboard shortcuts
export const useEditorKeyboardShortcuts = (handlers: {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  onExport?: () => void;
  onTogglePreview?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'z',
      ctrlKey: true,
      description: 'Undo',
      action: handlers.onUndo || (() => {}),
      disabled: !handlers.onUndo,
    },
    {
      key: 'y',
      ctrlKey: true,
      description: 'Redo',
      action: handlers.onRedo || (() => {}),
      disabled: !handlers.onRedo,
    },
    {
      key: 's',
      ctrlKey: true,
      description: 'Save session',
      action: handlers.onSave || (() => {}),
      disabled: !handlers.onSave,
    },
    {
      key: 'r',
      ctrlKey: true,
      shiftKey: true,
      description: 'Reset to default',
      action: handlers.onReset || (() => {}),
      disabled: !handlers.onReset,
    },
    {
      key: 'e',
      ctrlKey: true,
      description: 'Export/Render video',
      action: handlers.onExport || (() => {}),
      disabled: !handlers.onExport,
    },
    {
      key: 'p',
      description: 'Toggle preview',
      action: handlers.onTogglePreview || (() => {}),
      disabled: !handlers.onTogglePreview,
    },
  ];

  return useKeyboardShortcuts({ shortcuts });
};

// Accessibility helper for screen readers
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management utilities
export const useFocusManagement = () => {
  const focusElementRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    focusElementRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (focusElementRef.current && typeof focusElementRef.current.focus === 'function') {
      focusElementRef.current.focus();
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
  };
};

// ARIA live region hook for dynamic content announcements
export const useAriaLiveRegion = () => {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'aria-live-region';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && liveRegionRef.current.parentNode) {
        liveRegionRef.current.parentNode.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
};

// Hook for accessible form validation
export const useAccessibleValidation = (fieldId: string) => {
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  const getAriaAttributes = useCallback((hasError: boolean, hasDescription: boolean) => {
    const attributes: Record<string, string> = {};
    
    if (hasError) {
      attributes['aria-invalid'] = 'true';
      attributes['aria-describedby'] = errorId;
    } else {
      attributes['aria-invalid'] = 'false';
    }
    
    if (hasDescription && !hasError) {
      attributes['aria-describedby'] = descriptionId;
    } else if (hasDescription && hasError) {
      attributes['aria-describedby'] = `${descriptionId} ${errorId}`;
    }
    
    return attributes;
  }, [errorId, descriptionId]);

  return {
    errorId,
    descriptionId,
    getAriaAttributes,
  };
};

// Reduced motion preference detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};