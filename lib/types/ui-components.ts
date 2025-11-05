/**
 * TypeScript Type Definitions for UI Components
 * ==============================================
 *
 * This file defines the prop types for all our UI components.
 * This ensures type safety when rendering components dynamically.
 *
 * Key Concepts:
 * -------------
 * - Interface = Shape of an object
 * - Type-safe props prevent runtime errors
 * - IDEs can autocomplete and type-check
 */

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export interface ButtonProps {
  /**
   * The text displayed on the button
   */
  label: string

  /**
   * Visual style variant
   * - primary: Blue, main action
   * - secondary: Purple, secondary action
   * - outline: Bordered, subtle action
   */
  variant?: 'primary' | 'secondary' | 'outline'

  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Click handler (optional for demo)
   */
  onClick?: () => void
}

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export interface TextAreaProps {
  /**
   * Placeholder text shown when empty
   */
  placeholder?: string

  /**
   * Number of visible rows
   */
  rows?: number

  /**
   * Label above the textarea
   */
  label?: string

  /**
   * Change handler (optional for demo)
   */
  onChange?: (value: string) => void
}

// ============================================================================
// CHECKBOX GROUP COMPONENT
// ============================================================================

export interface CheckboxGroupProps {
  /**
   * Array of checkbox options
   */
  options: string[]

  /**
   * Label for the entire group
   */
  label?: string

  /**
   * Currently selected options
   */
  value?: string[]

  /**
   * Change handler (optional for demo)
   */
  onChange?: (selected: string[]) => void
}

// ============================================================================
// SLIDER COMPONENT
// ============================================================================

export interface SliderProps {
  /**
   * Minimum value
   */
  min: number

  /**
   * Maximum value
   */
  max: number

  /**
   * Default/initial value
   */
  defaultValue?: number

  /**
   * Label above the slider
   */
  label?: string

  /**
   * Change handler (optional for demo)
   */
  onChange?: (value: number) => void
}

// ============================================================================
// COMPONENT REGISTRY TYPE
// ============================================================================

/**
 * Union type of all possible component types
 * This ensures we only use valid component names
 */
export type ComponentType = 'Button' | 'TextArea' | 'CheckboxGroup' | 'Slider'

/**
 * Configuration for a component to be rendered
 * This is what the backend sends to the frontend
 */
export interface ComponentConfig {
  /**
   * The type of component to render
   */
  type: ComponentType

  /**
   * The props to pass to the component
   * Uses Record<string, any> for flexibility
   */
  props: Record<string, any>
}

/**
 * API Response from backend
 */
export interface GenerateUIResponse {
  component: ComponentConfig | null
  message: string
  error: string | null
}
