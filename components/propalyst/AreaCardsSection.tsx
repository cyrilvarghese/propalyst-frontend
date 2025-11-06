'use client'

import { motion } from 'framer-motion'
import AreaCard from './AreaCard'

interface AreaCardsSectionProps {
  loading: boolean
  visible: boolean
}

export default function AreaCardsSection({ loading, visible }: AreaCardsSectionProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-center gap-3 text-white py-8"
      >
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm font-medium">Loading areas relevant to your search...</span>
      </motion.div>
    )
  }

  if (!visible) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1.2,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="w-full max-w-7xl mx-auto px-4 py-8"
    >
      <h3 className="text-2xl font-bold text-white mb-6 text-center">
        Recommended Areas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Mock Data - Whitefield and surrounding areas */}
        <AreaCard
          areaName="Whitefield"
          image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053"
          childFriendlyScore={9}
          schoolsNearby={12}
          averageCommute="15-20 min"
          budgetRange="₹60K - ₹85K"
          highlights={["IT Hub", "Great Schools", "Metro Access"]}
        />
        <AreaCard
          areaName="Marathahalli"
          image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075"
          childFriendlyScore={8}
          schoolsNearby={10}
          averageCommute="20-25 min"
          budgetRange="₹50K - ₹75K"
          highlights={["Good Connectivity", "Family Friendly", "Shopping"]}
        />
        <AreaCard
          areaName="Indiranagar"
          image="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071"
          childFriendlyScore={7}
          schoolsNearby={8}
          averageCommute="25-30 min"
          budgetRange="₹70K - ₹90K"
          highlights={["Upscale Area", "Parks", "Cafes & Restaurants"]}
        />
        <AreaCard
          areaName="Brookefield"
          image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
          childFriendlyScore={9}
          schoolsNearby={15}
          averageCommute="10-15 min"
          budgetRange="₹55K - ₹80K"
          highlights={["Close to Whitefield", "Quiet", "Premium Schools"]}
        />
        <AreaCard
          areaName="Koramangala"
          image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070"
          childFriendlyScore={7}
          schoolsNearby={9}
          averageCommute="30-35 min"
          budgetRange="₹65K - ₹95K"
          highlights={["Vibrant", "Startups", "Nightlife"]}
        />
        <AreaCard
          areaName="HSR Layout"
          image="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2074"
          childFriendlyScore={8}
          schoolsNearby={11}
          averageCommute="25-30 min"
          budgetRange="₹55K - ₹80K"
          highlights={["Parks", "Shopping", "Well-planned"]}
        />
      </div>
    </motion.div>
  )
}
