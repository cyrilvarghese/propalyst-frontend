'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Baby, GraduationCap, Clock, IndianRupee } from 'lucide-react'

export default function AreaCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-white shadow-lg border-2 border-gray-100">
      {/* Image Skeleton with overlay */}
      <div className="relative h-40 overflow-hidden">
        <Skeleton className="h-40 w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3">
          <Skeleton className="h-6 w-32 bg-white/30" />
        </div>
      </div>

      {/* Content Skeleton - matches AreaCard structure exactly */}
      <div className="p-3 space-y-2.5">
        {/* Child Friendly Score with progress bar */}
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-gray-300 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-3 w-24 mb-1" />
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <Skeleton className="h-1.5 w-3/4 rounded-full" />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>

        {/* Schools Nearby */}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-gray-300 flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Average Commute */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-300 flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-3 w-32 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Budget Range */}
        <div className="flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-gray-300 flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Highlights */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  )
}
