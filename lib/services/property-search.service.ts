/**
 * Property Search Service - API Client
 * =====================================
 *
 * This service handles all API communication with the Property Search backend.
 * It abstracts away fetch calls and provides a clean interface for components.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Request types
 */
export interface PropertySearchRequest {
    query: string
    sources: string
    provider: string
}

/**
 * Response types (matching backend models)
 */
export interface PropertySearchParams {
    property_type?: string | null
    category: string
    location?: string | null
    budget_min?: number | null
    budget_max?: number | null
    keywords: string[]
    city: string
}

export interface PropertyResult {
    title: string
    url: string
    snippet: string
    price?: string | null
    location?: string | null
    property_type?: string | null
    source: string
}

export interface GroundingSource {
    title: string
    url: string
    snippet?: string | null
}

export interface PropertySearchResponse {
    results: PropertyResult[]
    extracted_params: PropertySearchParams
    sources: GroundingSource[]
    total_results: number
    provider: string
}

/**
 * Property Search Service
 */
export class PropertySearchService {
    /**
     * Search for properties using natural language query
     */
    static async search(request: PropertySearchRequest): Promise<PropertySearchResponse> {
        console.log('🔍 PropertySearchService.search called with:', request)
        console.trace('Call stack:')

        const response = await fetch(`${API_BASE_URL}/api/property-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('✅ PropertySearchService.search completed')
        return result
    }
}

