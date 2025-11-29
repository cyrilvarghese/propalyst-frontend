/**
 * WhatsApp Listings API
 * =====================
 * 
 * Fetches WhatsApp listings using the backend API.
 * Uses the new /api/whatsapp-listings endpoints.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface WhatsAppListing {
    id: string
    source_message_id: string
    message_date: string
    agent_contact: string | null
    agent_name: string | null
    company_name: string | null
    raw_message: string
    message_type: string
    property_type: string | null
    area_sqft: number | null
    bedroom_count: number | null
    price: number | null
    price_text: string | null
    location: string | null
    project_name: string | null
    furnishing_status: string | null
    parking_count: number | null
    parking_text: string | null
    facing_direction: string | null
    special_features: string[] | null
    llm_json: any | null
    created_at: string
}

export interface WhatsAppListingsResponse {
    success: boolean
    data: WhatsAppListing[]
    count: number
    message: string
    metadata?: {
        source?: string
        filters?: string
        filters_applied?: {
            agent_name?: string | null
            property_query?: string | null
            location?: string | null
            message_type?: string | null
        }
        exact_matches?: number
        fuzzy_matches?: number
        search_strategy?: string
    }
}

export interface WhatsAppListingsSearchParams {
    agent_name?: string
    property_query?: string
    location?: string
    message_type?: string
    limit?: number
    similarity_threshold?: number
}

/**
 * Fetch WhatsApp listings with pagination
 */
// export async function fetchWhatsAppListings(
//     limit: number = 100,
//     offset: number = 0
// ): Promise<WhatsAppListingsResponse> {
//     console.log('🚀 fetchWhatsAppListings called with:', { limit, offset })

//     try {
//         const params = new URLSearchParams({
//             limit: limit.toString(),
//             offset: offset.toString(),
//         })

//         const response = await fetch(`${API_BASE_URL}/api/whatsapp-listings?${params.toString()}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         })

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
//             throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
//         }

//         const result = await response.json()
//         console.log('✅ WhatsApp listings fetch completed, results count:', result.count || result.data?.length || 0)
//         return result
//     } catch (error: any) {
//         console.error('❌ Error fetching WhatsApp listings:', error.message)
//         throw error
//     }
// }

// /**
//  * Search WhatsApp listings with column-level filters
//  */
// export async function searchWhatsAppListings(
//     params: WhatsAppListingsSearchParams
// ): Promise<WhatsAppListingsResponse> {
//     console.log('🚀 searchWhatsAppListings called with:', params)

//     try {
//         // Build query parameters
//         const queryParams = new URLSearchParams()

//         if (params.agent_name) queryParams.append('agent_name', params.agent_name)
//         if (params.property_query) queryParams.append('property_query', params.property_query)
//         if (params.location) queryParams.append('location', params.location)
//         if (params.message_type) queryParams.append('message_type', params.message_type)
//         if (params.limit) queryParams.append('limit', params.limit.toString())
//         if (params.similarity_threshold !== undefined) {
//             queryParams.append('similarity_threshold', params.similarity_threshold.toString())
//         }

//         // At least one search parameter is required
//         if (queryParams.toString().length === 0) {
//             throw new Error('At least one search parameter is required')
//         }

//         const response = await fetch(`${API_BASE_URL}/api/whatsapp-listings/search?${queryParams.toString()}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         })

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
//             throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`)
//         }

//         const result = await response.json()
//         console.log('✅ WhatsApp listings search completed, results count:', result.count || result.data?.length || 0)
//         return result
//     } catch (error: any) {
//         console.error('❌ Error searching WhatsApp listings:', error.message)
//         throw error
//     }
// }

/**
 * Search WhatsApp listings by raw message content
 */
export async function searchWhatsAppListingsByMessage(
    query: string = '',
    limit: number = 100,
    offset: number = 0
): Promise<WhatsAppListingsResponse> {
    console.log('🚀 searchWhatsAppListingsByMessage called with:', { query, limit, offset })

    try {
        const queryParams = new URLSearchParams({
            query: query.trim(),
            limit: limit.toString(),
            offset: offset.toString(),
        })

        const response = await fetch(`${API_BASE_URL}/api/whatsapp-listings/search/message?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('✅ WhatsApp message search completed, results count:', result.count || result.data?.length || 0)
        return result
    } catch (error: any) {
        console.error('❌ Error searching WhatsApp listings by message:', error.message)
        throw error
    }
}

