'use client'

import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface SummaryCardProps {
  summary: string
  loading: boolean
}

export default function SummaryCard({ summary, loading }: SummaryCardProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex justify-center py-8"
      >
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm">Generating summary...</span>
        </div>
      </motion.div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      <Card className="bg-white/95 backdrop-blur-xl shadow-xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Search Summary</h3>
        <p className="text-base text-gray-700 leading-relaxed">{summary}</p>
      </Card>
    </motion.div>
  )
}
