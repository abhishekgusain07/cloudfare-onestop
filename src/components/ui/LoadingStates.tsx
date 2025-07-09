import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg 
        className="animate-spin text-current" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  animate?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  animate = true 
}) => {
  return (
    <div 
      className={`bg-slate-300 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{ minHeight: '1rem' }}
    />
  );
};

interface AudioLoadingProps {
  className?: string;
  text?: string;
}

export const AudioLoading: React.FC<AudioLoadingProps> = ({ 
  className = '', 
  text = 'Loading audio...' 
}) => {
  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-8 bg-purple-500 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
      <span className="text-sm text-slate-400">{text}</span>
    </div>
  );
};

interface WaveformLoadingProps {
  width?: number;
  height?: number;
  className?: string;
}

export const WaveformLoading: React.FC<WaveformLoadingProps> = ({ 
  width = 800, 
  height = 100,
  className = ''
}) => {
  const bars = 50;
  
  return (
    <div 
      className={`flex items-end justify-center space-x-1 ${className}`}
      style={{ width, height }}
    >
      {[...Array(bars)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-400 rounded-t animate-pulse"
          style={{
            width: `${width / bars - 1}px`,
            height: `${Math.random() * 60 + 20}%`,
            animationDelay: `${i * 0.02}s`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  );
};

interface SessionLoadingProps {
  className?: string;
}

export const SessionLoading: React.FC<SessionLoadingProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4 text-purple-600" />
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          Loading Your Session
        </h2>
        <p className="text-slate-600 text-sm">
          Restoring your work...
        </p>
      </div>
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'purple' | 'green' | 'red';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress,
  className = '',
  showPercentage = true,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-center mt-1">
          <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  className?: string;
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible,
  text = 'Loading...',
  className = '',
  children
}) => {
  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-purple-600" />
          <p className="text-slate-800 font-medium">{text}</p>
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src,
  alt,
  className = '',
  fallback,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 animate-pulse">
          <LoadingSpinner size="sm" className="text-slate-400" />
        </div>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-600 text-sm mb-4 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

// Performance optimization components
interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};