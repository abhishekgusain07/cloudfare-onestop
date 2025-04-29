import React, { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface AnnouncementProps {
  show: boolean;
  message: string;
  link?: {
    text: string;
    url: string;
  };
  emoji?: string;
  onDismiss?: () => void;
  onLinkClick?: (e: React.MouseEvent) => void;
}

const Announcement = ({ 
  show: initialShow, 
  message, 
  link, 
  emoji = "🚀", 
  onDismiss, 
  onLinkClick 
}: AnnouncementProps) => {
  const [show, setShow] = useState(initialShow);

  if (!show) return null;
  
  const handleDismiss = () => {
    setShow(false);
    if (onDismiss) onDismiss();
  };
  
  return (
    <div className="z-50 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 py-2 border-b border-blue-100 dark:border-blue-900/30">
      <div className="container mx-auto px-4 relative">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center pr-8">
          {emoji} {message}{' '}
          {link && (
            <a 
              href={link.url} 
              onClick={onLinkClick}
              className="font-semibold text-[#4A8DFF] hover:text-[#3A7DEF] dark:text-[#4A8DFF] dark:hover:text-[#5A9DFF] underline underline-offset-2"
            >
              {link.text}
            </a>
          )}
        </p>
        <button 
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          aria-label="Dismiss announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Announcement; 