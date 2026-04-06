import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <span 
      className={`animate-pulse bg-gray-200 rounded-md inline-block ${className}`}
    />
  );
};

export const JobSkeleton = () => {
  return (
    <div className="border-b border-gray-200 p-5 md:p-8 flex items-center justify-between gap-4 md:gap-8">
      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
        {/* Logo Circle Skeleton */}
        <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0" />
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title Skeleton */}
          <Skeleton className="h-6 w-1/3 md:w-1/4" />
          
          {/* Details Skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          {/* Deadline Skeleton */}
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Action Button Skeleton */}
      <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
    </div>
  );
};
