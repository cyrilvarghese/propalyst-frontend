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
    sender_name: string | null
}

export interface CREAListingsResponse {
    success: boolean
    data: CREAListing[]
    count: number
    message: string
}

export interface UpdateListingResponse {
    success: boolean
    status: string
    message: string
    data?: CREAListing
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

    /**
     * Search by agent name (fuzzy search)
     */
    static async searchByAgent(request: { agent_name: string; limit?: number }): Promise<CREAListingsResponse> {
        console.log('🔍 CREAListingsService.searchByAgent called with:', request)

        const { agent_name, limit = 100 } = request

        const params = new URLSearchParams({
            agent_name: agent_name,
            limit: limit.toString(),
        })

        const response = await fetch(`${API_BASE_URL}/api/crea/listings/search/agent?${params.toString()}`, {
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
        console.log('✅ CREAListingsService.searchByAgent completed, found', result.count, 'listings')
        return result
    }

    /**
     * Search by property (fuzzy search)
     */
    static async searchByProperty(request: { property_query: string; limit?: number }): Promise<CREAListingsResponse> {
        console.log('🔍 CREAListingsService.searchByProperty called with:', request)

        const { property_query, limit = 100 } = request

        const params = new URLSearchParams({
            property_query: property_query,
            limit: limit.toString(),
        })

        const response = await fetch(`${API_BASE_URL}/api/crea/listings/search/property?${params.toString()}`, {
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
        console.log('✅ CREAListingsService.searchByProperty completed, found', result.count, 'listings')
        return result
    }

    /**
     * Combined search with agent, property, and location filters
     * @param exactMatch - If true, uses exact match endpoint (/api/crea/listings/search), otherwise uses fuzzy search (/api/crea/search)
     */
    static async combinedSearch(request: {
        agent_name?: string
        property_query?: string
        property_type?: string
        location?: string
        configuration?: string
        transaction_type?: string
        min_price?: number
        max_price?: number
        limit?: number
        exactMatch?: boolean
    }): Promise<CREAListingsResponse> {
        console.log('🔍 CREAListingsService.combinedSearch called with:', request)

        const {
            agent_name,
            property_query,
            property_type,
            location,
            configuration,
            transaction_type,
            min_price,
            max_price,
            limit = 100,
            exactMatch = false
        } = request

        const params = new URLSearchParams({
            limit: limit.toString(),
        })

        // Add optional parameters only if they have values
        if (location && location.trim().length > 0) {
            params.set('location', location.trim())
        }
        if (configuration && configuration.trim().length > 0) {
            params.set('configuration', configuration.trim())
        }
        if (transaction_type && transaction_type.trim().length > 0) {
            params.set('transaction_type', transaction_type.trim())
        }
        if (min_price !== undefined) {
            params.set('min_price', min_price.toString())
        }
        if (max_price !== undefined) {
            params.set('max_price', max_price.toString())
        }

        // For exact match: use agent_name and property_type
        // For fuzzy match: use agent_name and property_query
        if (exactMatch) {
            if (agent_name && agent_name.trim().length > 0) {
                params.set('agent_name', agent_name.trim())
            }
            if (property_type && property_type.trim().length > 0) {
                params.set('property_type', property_type.trim())
            }
        } else {
            if (agent_name && agent_name.trim().length > 0) {
                params.set('agent_name', agent_name.trim())
            }
            if (property_query && property_query.trim().length > 0) {
                params.set('property_query', property_query.trim())
            }
        }

        // Choose endpoint based on exactMatch flag
        const endpoint = exactMatch
            ? `${API_BASE_URL}/api/crea/listings/search`  // Exact match endpoint
            : `${API_BASE_URL}/api/crea/search`          // Fuzzy search endpoint

        const response = await fetch(`${endpoint}?${params.toString()}`, {
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
        console.log(`✅ CREAListingsService.combinedSearch (${exactMatch ? 'exact' : 'fuzzy'}) completed, found`, result.count, 'listings')
        return result
    }

    /**
     * Update a listing
     * Uses PATCH method to update listing data
     */
    static async updateListing(
        listingId: string,
        updateData: Partial<CREAListing>
    ): Promise<UpdateListingResponse> {
        console.log('🔍 CREAListingsService.updateListing called with:', { listingId, updateData })

        const response = await fetch(`${API_BASE_URL}/api/crea/listings/${listingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('✅ CREAListingsService.updateListing completed:', result.message)
        return result
    }
}

