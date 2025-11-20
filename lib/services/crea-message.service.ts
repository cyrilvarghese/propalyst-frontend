/**
 * CREA Message Service - API Client
 * ===================================
 *
 * This service handles API communication for generating welcome messages
 * using LLM with listing raw text.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Request types
 */
export interface CREAMessageRequest {
    raw_message: string
    agent_name: string
    tone?: string
    include_emojis?: boolean
}

/**
 * Response types
 */
export interface CREAMessageResponse {
    success: boolean
    formatted_message: string
    original_message: string
    message: string
    error?: string
}

/**
 * CREA Message Service
 */
export class CREAMessageService {
    /**
     * Format broker message using LLM
     */
    static async formatMessage(request: CREAMessageRequest): Promise<CREAMessageResponse> {
        console.log('🔍 CREAMessageService.formatMessage called with:', request)

        const response = await fetch(`${API_BASE_URL}/api/crea/get-whatsapp-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                raw_message: request.raw_message,
                agent_name: request.agent_name,
                tone: request.tone || 'professional_friendly',
                include_emojis: request.include_emojis !== undefined ? request.include_emojis : true,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('✅ CREAMessageService.formatMessage completed')
        return result
    }
}

