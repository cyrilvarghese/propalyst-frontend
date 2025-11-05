/**
 * DynamicButtonGroup - Multiple choice buttons with icons
 * ========================================================
 *
 * This component renders a group of buttons for multiple choice questions.
 * Used for: Kids (Q2), Commute (Q3), Property Type (Q4)
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Check,
  X,
  Clock,
  Home,
  Building,
  Building2
} from 'lucide-react'

interface DynamicButtonGroupProps {
  field: string
  options: string[]
  onSelect?: (value: string) => void
}

// Icon mapping based on option text
const getIcon = (option: string, field: string) => {
  // Yes/No questions
  if (option === 'Yes') return <Check className="w-5 h-5" />
  if (option === 'No') return <X className="w-5 h-5" />

  // Time-based options
  if (option.includes('min')) return <Clock className="w-5 h-5" />

  // Property types
  if (option === 'Villa') return <Home className="w-5 h-5" />
  if (option === 'Apartment') return <Building className="w-5 h-5" />
  if (option === 'Row House') return <Building2 className="w-5 h-5" />

  return null
}

export default function DynamicButtonGroup({
  field,
  options,
  onSelect
}: DynamicButtonGroupProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (option: string) => {
    setSelected(option)
    if (onSelect) {
      onSelect(option)
    }
  }

  return (
    <div className="flex flex-wrap gap-3 w-full">
      {options.map((option) => {
        const icon = getIcon(option, field)
        const isYesNo = option === 'Yes' || option === 'No'

        return (
          <Button
            key={option}
            variant="ghost"
            size="lg"
            onClick={() => handleSelect(option)}
            className={`
              flex items-center justify-center gap-2 h-12 text-base font-medium
              rounded-xl text-gray-700
              ${isYesNo ? 'flex-1 min-w-[120px]' : 'px-6'}
              ${selected === option
                ? 'bg-primary border-0 shadow-lg'
                : 'bg-white border-2 border-gray-200'
              }
            `}
          >
            {icon}
            <span className="whitespace-nowrap">{option}</span>
          </Button>
        )
      })}
    </div>
  )
}
