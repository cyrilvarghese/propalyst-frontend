'use client'

import { Textarea } from '@/components/ui/textarea'

interface SummaryDisplayProps {
  summary: string
  loading: boolean
}

export default function SummaryDisplay({ summary, loading }: SummaryDisplayProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm">Generating summary...</span>
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Your Search Summary
      </label>
      <Textarea
        value={summary}
        readOnly
        className="w-full min-h-[100px] text-base text-gray-800 bg-gray-50 border-gray-300 resize-none focus:ring-0 focus:border-gray-300"
      />
    </div>
  )
}
