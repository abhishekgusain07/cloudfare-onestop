import React, { useState } from 'react';
import { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  shortcuts,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.metaKey) keys.push('Cmd');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    
    keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase());
    
    return keys.join(' + ');
  };

  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    if (shortcut.disabled) return groups;
    
    const category = getShortcutCategory(shortcut);
    if (!groups[category]) groups[category] = [];
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close shortcuts help"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-slate-700 text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono text-slate-600">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            Press <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">?</kbd> to toggle this help panel
          </p>
        </div>
      </div>
    </div>
  );
};

function getShortcutCategory(shortcut: KeyboardShortcut): string {
  const description = shortcut.description.toLowerCase();
  
  if (description.includes('music') || description.includes('audio') || description.includes('volume') || description.includes('play')) {
    return 'Music Controls';
  }
  
  if (description.includes('save') || description.includes('undo') || description.includes('redo') || description.includes('reset')) {
    return 'Session Management';
  }
  
  if (description.includes('preview') || description.includes('render') || description.includes('export')) {
    return 'Video Controls';
  }
  
  return 'General';
}

// Global shortcuts help toggle
export const useShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleHelp = () => setIsOpen(!isOpen);
  const closeHelp = () => setIsOpen(false);

  // Global shortcut to toggle help
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleHelp();
      }
      if (e.key === 'Escape' && isOpen) {
        closeHelp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    toggleHelp,
    closeHelp,
  };
};

// Floating help button
export const ShortcutsHelpButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
      title="Keyboard shortcuts (Press ? key)"
      aria-label="Show keyboard shortcuts help"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
};