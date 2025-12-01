/**
 * ResultsSkeleton - Loading State for SearchResults
 * ==================================================
 *
 * This is a Server Component (no 'use client' needed).
 * It's just UI, no interactivity.
 *
 * Shown by Suspense while SearchResults is fetching data.
 */

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-40" />
      </div>

      {/* Property card skeletons */}
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Image skeleton */}
            <Skeleton className="w-full md:w-64 h-48 md:h-auto" />

            {/* Content skeleton */}
            <div className="flex-1 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />

              {/* Badges skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
