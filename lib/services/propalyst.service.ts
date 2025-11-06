/**
 * Propalyst Service - API Client
 * ================================
 *
 * This service handles all API communication with the Propalyst backend.
 * It abstracts away fetch calls and provides a clean interface for components.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Request types
 */
export interface ChatRequest {
  session_id: string
  user_input: string | null
  field?: string
}

export interface SummaryRequest {
  session_id: string
}

export interface AreasRequest {
  session_id: string
}

/**
 * Response types
 */
export interface ChatResponse {
  component: {
    type: string
    props: Record<string, any>
  } | null
  message: string
  messages: Array<{
    role: 'user' | 'agent'
    content: string
  }>
  session_id: string
  current_step: number
  completed: boolean
}

export interface SummaryResponse {
  summary: string
  session_id: string
}

export interface Area {
  areaName: string
  image: string
  childFriendlyScore: number
  schoolsNearby: number
  averageCommute: string
  budgetRange: string
  highlights: string[]
}

export interface AreasResponse {
  areas: Area[]
  session_id: string
}

/**
 * Propalyst Service
 */
export class PropalystService {
  /**
   * Send chat message to backend
   */
  static async sendChat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/propalyst/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Fetch conversation summary
   */
  static async fetchSummary(request: SummaryRequest): Promise<SummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/propalyst/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Fetch recommended areas
   */
  static async fetchAreas(request: AreasRequest): Promise<AreasResponse> {
    const response = await fetch(`${API_BASE_URL}/api/propalyst/areas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}
