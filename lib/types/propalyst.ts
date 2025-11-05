/**
 * Propalyst Type Definitions
 * ==========================
 *
 * Types for the Propalyst conversational property search flow.
 */

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request payload for Propalyst chat API
 */
export interface PropalystChatRequest {
  session_id: string
  user_input?: string | null
  field?: string | null
}

/**
 * Response from Propalyst chat API
 */
export interface PropalystChatResponse {
  component: UIComponent | null
  message: string
  session_id: string
  current_step: number
  completed: boolean
}

// ============================================================================
// UI Component Types
// ============================================================================

/**
 * Generic UI component configuration
 */
export interface UIComponent {
  type: string
  props: Record<string, any>
}

/**
 * TextInput component props
 */
export interface TextInputProps {
  field: string
  placeholder?: string
  label?: string
}

/**
 * ButtonGroup component props
 */
export interface ButtonGroupProps {
  field: string
  options: string[]
}

/**
 * Slider component props
 */
export interface SliderProps {
  field: string
  min: number
  max: number
  step: number
  defaultValue: number
  label: string
  format: string
}

// ============================================================================
// Chat Message Types
// ============================================================================

/**
 * Chat message in conversation history
 */
export interface ChatMessage {
  role: 'agent' | 'user'
  content: string
  timestamp?: Date
}

// ============================================================================
// Propalyst State Types (Frontend copy of backend state)
// ============================================================================

/**
 * User's property search preferences
 * This mirrors the backend PropalystState
 */
export interface PropalystState {
  session_id: string

  // User answers (Q1-Q5)
  work_location?: string | null
  has_kids?: boolean | null
  commute_time_max?: number | null
  property_type?: string | null
  budget_max?: number | null

  // UI state
  messages: ChatMessage[]
  current_step: number
  completed: boolean
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * API error response
 */
export interface APIError {
  detail: string
}

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
