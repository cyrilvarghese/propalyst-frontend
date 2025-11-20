/**
 * CREA Listings Service - API Client
 * ====================================
 *
 * This service handles API communication with the CREA listings backend.
 * It abstracts away fetch calls and provides a clean interface for components.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Request types
 */
export interface CREAListingsRequest {
    limit?: number
    offset?: number
}

export interface CREASearchRequest {
    query: string
    limit?: number
}

export interface CREALocationSearchRequest {
    location: string
    limit?: number
}

/**
 * Response types (matching backend models)
 */
export interface CREAListing {
    id: string
    created_at: string
    message_date: string
    agent_name: string
    agent_contact: string | null
    company_name: string | null
    listing_type: string | null
    transaction_type: string
    property_type: string
    configuration: string | null
    size_sqft: number
    price: number
    price_text: string
    location: string
    project_name: string | null
    facing: string | null
    floor: string | null
    furnishing: string | null
    parking: string | null
    status: string | null
    amenities: string | null
    raw_message: string
}

export interface CREAListingsResponse {
    success: boolean
    data: CREAListing[]
    count: number
    message: string
}

/**
 * CREA Listings Service
 */
export class CREAListingsService {
    /**
     * Get all listings with pagination
     */
    static async getListings(request: CREAListingsRequest = {}): Promise<CREAListingsResponse> {
        console.log('🔍 CREAListingsService.getListings called with:', request)

        const { limit = 100, offset = 0 } = request

        // Build query parameters
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        })

        const response = await fetch(`${API_BASE_URL}/api/crea/listings?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('✅ CREAListingsService.getListings completed, found', result.count, 'listings')
        return result
    }

    /**
     * Search raw messages
     */
    static async searchMessages(request: CREASearchRequest): Promise<CREAListingsResponse> {
        console.log('🔍 CREAListingsService.searchMessages called with:', request)

        const { query, limit = 100 } = request

        // Build query parameters
        const params = new URLSearchParams({
            query: query,
            limit: limit.toString(),
        })

        const response = await fetch(`${API_BASE_URL}/api/crea/listings/search/message?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('✅ CREAListingsService.searchMessages completed, found', result.count, 'listings')
        return result
    }

    /**
     * Search by location
     */
    static async searchByLocation(request: CREALocationSearchRequest): Promise<CREAListingsResponse> {
        console.log('🔍 CREAListingsService.searchByLocation called with:', request)

        const { location, limit = 100 } = request

        // Build query parameters
        const params = new URLSearchParams({
            location: location,
            limit: limit.toString(),
        })

        const response = await fetch(`${API_BASE_URL}/api/crea/listings/search/location?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('✅ CREAListingsService.searchByLocation completed, found', result.count, 'listings')
        return result
    }
}

