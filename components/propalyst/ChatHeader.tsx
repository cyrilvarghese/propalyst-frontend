'use client'

import { Bot } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ChatHeaderProps {
  completed: boolean
}

export default function ChatHeader({ completed }: ChatHeaderProps) {
  return (
    <Card className="p-5 mb-4 bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Propalyst Assistant</h2>
            <p className="text-sm text-gray-500">Let's find your ideal home</p>
          </div>
        </div>
        {completed && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Complete</span>
          </div>
        )}
      </div>
    </Card>
  )
}
