/**
 * WhatsApp Listings API
 * =====================
 * 
 * Fetches WhatsApp listings using the backend API.
 * Uses the new /api/whatsapp-listings endpoints.
 * Requests go through Next.js proxy to avoid CORS issues.
 */

// Use relative URL to go through Next.js proxy (configured in next.config.js)
const API_BASE_URL = ''

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
    bedrooms: number | null // Changed from bedroom_count to match API response
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
    sender_name: string | null
}

/**
 * RB Property - Real Broker Property schema
 * Renamed from verified_proper in the API response
 */
export interface RBProperty {
    id: string
    source: string
    title: string
    description: string | null
    property_type: string // Maps to transaction_type in WhatsApp listings - "Sale" or "Rent"
    bedrooms: number | null // Maps to bedroom_count in WhatsApp listings (different field name)
    bathrooms: number | null // New field, not present in WhatsApp listings
    sqft: number | null // Maps to area_sqft/size_sqft in WhatsApp listings (different field name)
    price: number | null
    price_text: string | null
    location: string | null
    project_name: string | null
    furnishing_status: string | null // Same field name as WhatsApp listings
    facing_direction: string | null // Same field name as WhatsApp listings
    parking_count: number | null // Same field name as WhatsApp listings
    special_features: string[] | null // Same field name as WhatsApp listings
    images: string[] // New field, not in WhatsApp listings - array of image URLs
    agent_name: string | null
    agent_contact: string | null // Same field name but verify format compatibility
    agent_email: string | null // New field, not in WhatsApp listings
    company_name: string | null // Same field name as WhatsApp listings
    agent_avatar: string | null // New field, not in WhatsApp listings
    agent_vanity_url: string | null // New field, not in WhatsApp listings
    owner_name: string | null // New field, not in WhatsApp listings
    owner_number: string | null // New field, not in WhatsApp listings
    status: string | null // Same field name, maps to status in WhatsApp listings (e.g., "Sold")
    created_at: string // Same field name, use for date display
    updated_at: string // New field, not in WhatsApp listings
    message_type: string | null // May be null for RB properties
    raw_message: string | null // May be null for RB properties
    static_flyer_url: string | null // New field, not in WhatsApp listings
    static_html_url: string | null // New field, property detail page URL
    verified_by: string | null // New field, not in WhatsApp listings
    view_count: number | null // New field, not in WhatsApp listings
    currency: string | null // New field, not in WhatsApp listings
    source_key: string | null // New field, not in WhatsApp listings
}

/**
 * Listing Response - Contains multiple data sources
 * The API response now contains whatsapp_listings, rb_properties, counts, and total_count
 */
export interface ListingResponse {
    whatsapp_listings: WhatsAppListing[]
    rb_properties: RBProperty[]
    counts: {
        whatsapp: number
        properties: number
    }
    total_count: number
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
// ): Promise<ListingResponse> {
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
// ): Promise<ListingResponse> {
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
    offset: number = 0,
    property_type?: string,
    message_type?: string
): Promise<ListingResponse> {
    console.log('🚀 searchWhatsAppListingsByMessage called with:', { query, limit, offset, property_type, message_type })

    try {
        const queryParams = new URLSearchParams({
            query: query.trim(),
            limit: limit.toString(),
            offset: offset.toString(),
        })

        // Add optional filters if provided
        if (property_type && property_type.trim()) {
            queryParams.append('property_type', property_type.trim())
        }
        if (message_type && message_type.trim()) {
            queryParams.append('message_type', message_type.trim())
        }

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

        const result = await response.json() as ListingResponse
        console.log('✅ Listing search completed, results count:', result.total_count || 0)
        console.log('  - WhatsApp listings:', result.counts?.whatsapp || 0)
        console.log('  - RB Properties:', result.counts?.properties || 0)
        return result
    } catch (error: any) {
        console.error('❌ Error searching WhatsApp listings by message:', error.message)
        throw error
    }
}

