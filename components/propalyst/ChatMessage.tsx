/**
 * ChatMessage - Individual message bubble
 * ========================================
 *
 * Displays a single message in the chat conversation.
 * Different styling for agent vs user messages.
 */

'use client'

import { Card } from '@/components/ui/card'
import { Bot, User } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/lib/types/propalyst'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAgent = message.role === 'agent'

  return (
    <div className={`flex w-full ${isAgent ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-start gap-2 max-w-[85%] ${isAgent ? '' : 'flex-row-reverse'}`}>
        {/* Avatar - only show for agent */}
        {isAgent && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground">
            <Bot className="w-5 h-5" />
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-sm break-words
            ${isAgent
              ? 'bg-muted text-foreground rounded-tl-none'
              : 'bg-secondary text-secondary-foreground rounded-tr-none'
            }
          `}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
