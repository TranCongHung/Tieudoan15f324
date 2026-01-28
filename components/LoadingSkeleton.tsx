import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'rectangular':
        return 'rounded-lg';
      case 'circular':
        return 'rounded-full';
      default:
        return 'rounded';
    }
  };

  const baseClasses = `
    loading-skeleton
    ${getVariantClasses()}
    ${className}
  `;

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={baseClasses}
            style={{
              ...style,
              width: index === lines - 1 ? '70%' : '100%', // Last line shorter
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={baseClasses} style={style} />;
};

// Card Skeleton Component
export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    <div className="h-48 bg-stone-100">
      <LoadingSkeleton variant="rectangular" height="100%" />
    </div>
    <div className="p-4 space-y-3">
      <LoadingSkeleton variant="text" height="24px" />
      <LoadingSkeleton variant="text" lines={2} />
      <div className="flex justify-between">
        <LoadingSkeleton variant="text" width="60px" />
        <LoadingSkeleton variant="text" width="80px" />
      </div>
    </div>
  </div>
);

// List Skeleton Component
export const ListSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-4 flex gap-4">
    <LoadingSkeleton variant="rectangular" width="96px" height="96px" />
    <div className="flex-grow space-y-3">
      <LoadingSkeleton variant="text" height="20px" />
      <LoadingSkeleton variant="text" lines={2} />
      <LoadingSkeleton variant="text" width="120px" />
    </div>
  </div>
);

export default LoadingSkeleton;
