/**
 * DynamicTextInput - Wrapper for shadcn Input
 * ============================================
 *
 * This component adapts the shadcn Input to work with props
 * coming from the LangGraph agent for Propalyst Q&A.
 *
 * Used for: Work location input (Q1)
 */

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface DynamicTextInputProps {
  field: string
  placeholder?: string
  label?: string
  onSubmit?: (value: string) => void
}

export default function DynamicTextInput({
  field,
  placeholder = '',
  label,
  onSubmit
}: DynamicTextInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <Label htmlFor={field} className="text-base font-medium">
          {label}
        </Label>
      )}

      {/* Input with submit button */}
      <div className="flex gap-2 w-full">
        <Input
          id={field}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 h-12 text-base border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-50 focus:bg-white rounded-xl shadow-sm"
          autoFocus
          autoComplete="off"
        />
        <Button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </Button>
      </div>
    </div>
  )
}
