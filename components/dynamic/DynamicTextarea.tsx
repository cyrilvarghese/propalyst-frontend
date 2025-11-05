/**
 * DynamicTextarea - Wrapper for shadcn Textarea
 * ==============================================
 *
 * Adapts shadcn Textarea to work with LangGraph agent props.
 */

'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface DynamicTextareaProps {
  placeholder?: string
  rows?: number
  label?: string
  onChange?: (value: string) => void
}

export default function DynamicTextarea({
  placeholder = 'Type here...',
  rows = 4,
  label = 'Text Input',
  onChange
}: DynamicTextareaProps) {
  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="space-y-2">
      {/* Component label */}
      <div className="text-sm font-medium text-gray-700">
        Generated Textarea Component
      </div>

      {/* Label for the textarea */}
      <Label htmlFor="dynamic-textarea">{label}</Label>

      {/* The actual textarea */}
      <Textarea
        id="dynamic-textarea"
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        className="resize-none"
      />

      {/* Character count */}
      <div className="text-xs text-gray-500">
        {value.length} characters
      </div>

      {/* Debug info */}
      <div className="text-xs text-gray-500 mt-2">
        Props: placeholder="{placeholder}", rows={rows}
      </div>
    </div>
  )
}
