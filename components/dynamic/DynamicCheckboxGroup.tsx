/**
 * DynamicCheckboxGroup - Wrapper for shadcn Checkbox
 * ===================================================
 *
 * Creates a group of checkboxes from an array of options.
 * This is NOT a single shadcn component - we compose multiple Checkbox components.
 */

'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface DynamicCheckboxGroupProps {
  options: string[]
  label?: string
  value?: string[]
  onChange?: (selected: string[]) => void
}

export default function DynamicCheckboxGroup({
  options,
  label = 'Select options',
  value,
  onChange
}: DynamicCheckboxGroupProps) {
  const [selected, setSelected] = useState<string[]>(value || [])

  const handleToggle = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option]

    setSelected(newSelected)
    onChange?.(newSelected)
  }

  return (
    <div className="space-y-3">
      {/* Component label */}
      <div className="text-sm font-medium text-gray-700">
        Generated CheckboxGroup Component
      </div>

      {/* Group label */}
      <div className="font-medium">{label}</div>

      {/* Checkbox options */}
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${index}`}
              checked={selected.includes(option)}
              onCheckedChange={() => handleToggle(option)}
            />
            <Label
              htmlFor={`checkbox-${index}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>

      {/* Selected items display */}
      {selected.length > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          Selected: {selected.join(', ')}
        </div>
      )}

      {/* Debug info */}
      <div className="text-xs text-gray-500 mt-2">
        Props: options=[{options.join(', ')}]
      </div>
    </div>
  )
}
