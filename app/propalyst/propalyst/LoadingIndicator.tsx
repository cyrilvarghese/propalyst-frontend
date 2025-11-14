/**
 * LoadingIndicator - Reusable loading dots bubble
 * =================================================
 *
 * Shows animated bouncing dots with optional message.
 * Used for loading states in chat conversations.
 */

'use client'

import { Bot } from 'lucide-react'

interface LoadingIndicatorProps {
  message?: string // Optional message to show alongside dots
}

export default function LoadingIndicator({ message }: LoadingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-2 max-w-[75%]">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex items-center gap-2">
            {/* Animated dots */}
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            {/* Optional message */}
            {message && (
              <span className="text-sm text-muted-foreground ml-1">{message}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
