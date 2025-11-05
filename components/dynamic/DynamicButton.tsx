/**
 * DynamicButton - Wrapper for shadcn Button
 * ==========================================
 *
 * This component adapts the shadcn Button to work with props
 * coming from the LangGraph agent.
 *
 * Why we need this wrapper:
 * ------------------------
 * - LangGraph sends: { label: "Click Me", variant: "primary" }
 * - shadcn expects: <Button variant="default">Click Me</Button>
 * - This wrapper maps agent props → shadcn props
 */

'use client'

import { Button } from '@/components/ui/button'

interface DynamicButtonProps {
  label: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

export default function DynamicButton({
  label,
  variant = 'primary',
  size = 'medium',
  onClick
}: DynamicButtonProps) {
  // Map our variants to shadcn variants
  const shadcnVariant = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline'
  }[variant] as 'default' | 'secondary' | 'outline'

  // Map our sizes to Tailwind classes
  const sizeClasses = {
    small: 'h-8 px-3 text-sm',
    medium: 'h-10 px-4',
    large: 'h-12 px-6 text-lg'
  }[size]

  return (
    <div className="space-y-2">
      {/* Label to show what this component is */}
      <div className="text-sm font-medium text-gray-700">
        Generated Button Component
      </div>

      {/* The actual button */}
      <Button
        variant={shadcnVariant}
        className={sizeClasses}
        onClick={onClick || (() => alert('Button clicked!'))}
      >
        {label}
      </Button>

      {/* Debug info */}
      <div className="text-xs text-gray-500 mt-2">
        Props: label="{label}", variant="{variant}", size="{size}"
      </div>
    </div>
  )
}
