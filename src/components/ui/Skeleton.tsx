import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'avatar' | 'image';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text', ...props }) => {
  const base = 'relative overflow-hidden bg-ink-100 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';
  const variants = {
    text: 'h-3 w-full',
    card: 'h-48 w-full',
    avatar: 'h-12 w-12 rounded-full',
    image: 'h-32 w-full',
  };

  return <div className={`${base} ${variants[variant]} ${className}`} aria-hidden="true" {...props} />;
};

export const EducatorCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-5 space-y-4">
    <div className="flex gap-3.5">
      <Skeleton variant="avatar" className="w-14 h-14 rounded-card shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20 rounded-pill" />
      <Skeleton className="h-6 w-24 rounded-pill" />
    </div>
    <div className="pt-3 border-t border-ink-100 flex justify-between items-center">
      <Skeleton className="h-6 w-16" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-control" />
        <Skeleton className="h-8 w-20 rounded-control" />
      </div>
    </div>
  </div>
);

export const CategorySkeleton: React.FC = () => (
  <div className="p-5 rounded-card border border-ink-200 bg-white space-y-3">
    <Skeleton className="h-10 w-10 rounded-control shrink-0" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);

export default Skeleton;
