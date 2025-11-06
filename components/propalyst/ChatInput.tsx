'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import type { LoadingState } from '@/lib/types/propalyst'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  loadingState: LoadingState
  completed: boolean
  inputRef: React.RefObject<HTMLInputElement>
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onKeyPress,
  loadingState,
  completed,
  inputRef
}: ChatInputProps) {
  return (
    <div className="w-full flex justify-center">
      <div className="relative flex items-center bg-white backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-gray-200 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/30 transition-all duration-200 max-w-3xl w-full">
        <Input
          ref={inputRef}
          type="text"
          placeholder={completed ? "Refine your search..." : "Type your message..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          disabled={loadingState === 'loading'}
          className="flex-1 h-12 text-sm sm:text-base border-0 bg-transparent rounded-xl focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-20 sm:pr-24 pl-3 sm:pl-4"
        />
        <Button
          onClick={onSubmit}
          disabled={!value.trim() || loadingState === 'loading'}
          className="absolute right-1.5 h-9 px-2 sm:px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 text-primary-foreground font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-lg"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </div>
  )
}
