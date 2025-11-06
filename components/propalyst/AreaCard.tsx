'use client'

import { motion } from 'framer-motion'
import { Home, GraduationCap, Baby, Clock, IndianRupee } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AreaCardProps {
  areaName: string
  image: string
  childFriendlyScore: number // 1-10
  schoolsNearby: number
  averageCommute: string // "15-20 min"
  budgetRange: string // "₹40K - ₹60K"
  highlights: string[]
}

export default function AreaCard({
  areaName,
  image,
  childFriendlyScore,
  schoolsNearby,
  averageCommute,
  budgetRange,
  highlights
}: AreaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-100">
        {/* Area Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={image}
            alt={areaName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3">
            <h3 className="text-lg font-bold text-white drop-shadow-lg">{areaName}</h3>
          </div>
        </div>

        {/* Area Stats */}
        <div className="p-3 space-y-2.5">
          {/* Child Friendly Score */}
          <div className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700">Child Friendly</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-primary via-accent to-secondary rounded-full h-1.5 transition-all duration-300"
                    style={{ width: `${childFriendlyScore * 10}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-900">
                  {childFriendlyScore}/10
                </span>
              </div>
            </div>
          </div>

          {/* Schools Nearby */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-700">Schools Nearby</p>
              <p className="text-sm font-bold text-gray-900">
                {schoolsNearby} quality schools
              </p>
            </div>
          </div>

          {/* Average Commute */}
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-700">Avg. Commute Time</p>
              <p className="text-sm font-bold text-gray-900">
                {averageCommute}
              </p>
            </div>
          </div>

          {/* Budget Range */}
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-700">Rental Budget</p>
              <p className="text-sm font-bold text-gray-900">
                {budgetRange}/month
              </p>
            </div>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {highlights.map((highlight, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gradient-to-r from-primary/15 to-accent/15 text-gray-800 font-medium px-2 py-0.5 rounded-full border border-primary/20"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
