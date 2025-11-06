'use client'

import { motion } from 'framer-motion'
import AreaCard from './AreaCard'
import AreaCardSkeleton from './AreaCardSkeleton'
import { Area } from '@/lib/services'

interface RecommendedSectionProps {
  summary: string
  summaryLoading: boolean
  areaCardsLoading: boolean
  visible: boolean
  areas: Area[]
}

export default function RecommendedSection({
  summary,
  summaryLoading,
  areaCardsLoading,
  visible,
  areas
}: RecommendedSectionProps) {
  // Show loading for summary
  if (summaryLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex justify-center py-8"
      >
        <div className="flex items-center gap-2 text-white">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm font-medium">Generating your personalized recommendations...</span>
        </div>
      </motion.div>
    )
  }

  // Don't show anything if no summary yet
  if (!summary) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1.0,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="w-full max-w-7xl mx-auto px-4 py-8"
    >
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 text-center">
        Recommended Areas
      </h2>

      {/* Subtitle - Summary */}
      <p className="text-base sm:text-lg text-gray-200 text-center mb-8 max-w-4xl mx-auto leading-relaxed px-4">
        {summary}
      </p>

      {/* Area Cards Grid - Show skeletons during loading, actual cards when loaded */}
      {(areaCardsLoading || visible) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {areaCardsLoading ? (
            // Show skeleton cards during loading
            <>
              <AreaCardSkeleton />
              <AreaCardSkeleton />
              <AreaCardSkeleton />
              <AreaCardSkeleton />
              <AreaCardSkeleton />
              <AreaCardSkeleton />
            </>
          ) : (
            // Show actual cards when loaded with staggered animation
            <>
              {areas.map((area, index) => (
                <AreaCard
                  key={area.areaName}
                  areaName={area.areaName}
                  image={area.image}
                  childFriendlyScore={area.childFriendlyScore}
                  schoolsNearby={area.schoolsNearby}
                  averageCommute={area.averageCommute}
                  budgetRange={area.budgetRange}
                  highlights={area.highlights}
                  delay={index * 0.15}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
