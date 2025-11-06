'use client'

import { motion } from 'framer-motion'
import AreaCard from './AreaCard'
import AreaCardSkeleton from './AreaCardSkeleton'

interface RecommendedSectionProps {
  summary: string
  summaryLoading: boolean
  areaCardsLoading: boolean
  visible: boolean
}

export default function RecommendedSection({
  summary,
  summaryLoading,
  areaCardsLoading,
  visible
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
              <AreaCard
                areaName="Whitefield"
                image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053"
                childFriendlyScore={9}
                schoolsNearby={12}
                averageCommute="15-20 min"
                budgetRange="₹60K - ₹85K"
                highlights={["IT Hub", "Great Schools", "Metro Access"]}
                delay={0}
              />
              <AreaCard
                areaName="Marathahalli"
                image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075"
                childFriendlyScore={8}
                schoolsNearby={10}
                averageCommute="20-25 min"
                budgetRange="₹50K - ₹75K"
                highlights={["Good Connectivity", "Family Friendly", "Shopping"]}
                delay={0.15}
              />
              <AreaCard
                areaName="Indiranagar"
                image="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071"
                childFriendlyScore={7}
                schoolsNearby={8}
                averageCommute="25-30 min"
                budgetRange="₹70K - ₹90K"
                highlights={["Upscale Area", "Parks", "Cafes & Restaurants"]}
                delay={0.3}
              />
              <AreaCard
                areaName="Brookefield"
                image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
                childFriendlyScore={9}
                schoolsNearby={15}
                averageCommute="10-15 min"
                budgetRange="₹55K - ₹80K"
                highlights={["Close to Whitefield", "Quiet", "Premium Schools"]}
                delay={0.45}
              />
              <AreaCard
                areaName="Koramangala"
                image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070"
                childFriendlyScore={7}
                schoolsNearby={9}
                averageCommute="30-35 min"
                budgetRange="₹65K - ₹95K"
                highlights={["Vibrant", "Startups", "Nightlife"]}
                delay={0.6}
              />
              <AreaCard
                areaName="HSR Layout"
                image="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2074"
                childFriendlyScore={8}
                schoolsNearby={11}
                averageCommute="25-30 min"
                budgetRange="₹55K - ₹80K"
                highlights={["Parks", "Shopping", "Well-planned"]}
                delay={0.75}
              />
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
