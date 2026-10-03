import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function JobCardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-surface p-5" aria-hidden="true">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-md" />
        <div className="flex-1">
          <div className="flex justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3.5 w-1/3" />
            </div>
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-3.5 w-3/4" />
          <div className="mt-3 flex gap-1.5">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-12 w-full rounded-md" />
        </div>
      </div>
    </div>);

}