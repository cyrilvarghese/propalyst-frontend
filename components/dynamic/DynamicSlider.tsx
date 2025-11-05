/**
 * DynamicSlider - Wrapper for shadcn Slider
 * ==========================================
 *
 * Adapts shadcn Slider to work with LangGraph agent props.
 */

'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface DynamicSliderProps {
  field: string
  min: number
  max: number
  step?: number
  defaultValue?: number
  label?: string
  format?: string
  onSubmit?: (value: string) => void
}

export default function DynamicSlider({
  field,
  min,
  max,
  step = 1,
  defaultValue,
  label = 'Select a value',
  format = '{value}',
  onSubmit
}: DynamicSliderProps) {
  // Use midpoint if defaultValue not provided
  const initialValue = defaultValue !== undefined
    ? defaultValue
    : Math.floor((min + max) / 2)

  const [value, setValue] = useState(initialValue)

  const handleChange = (values: number[]) => {
    const newValue = values[0]
    setValue(newValue)
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(value.toString())
    }
  }

  // Format value display (e.g., ₹75000)
  const formatValue = (val: number) => {
    return format.replace('{value}', val.toLocaleString('en-IN'))
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl">
      {/* Slider label and current value */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-gray-700">{label}</Label>
        <span className="text-3xl font-bold text-accent">
          {formatValue(value)}
        </span>
      </div>

      {/* The actual slider */}
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleChange}
        className="w-full"
      />

      {/* Min/Max labels */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      {/* Submit button */}
      {onSubmit && (
        <button
          onClick={handleSubmit}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Continue
        </button>
      )}
    </div>
  )
}
