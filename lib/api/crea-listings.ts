/**
 * CREA Listings API
 * =================
 * 
 * Fetches CREA listings using the backend API.
 * This function is separated from the component for better organization.
 */

import { CREAListingsService, CREAListing } from '@/lib/services/crea-listings.service'

/**
 * Fetch CREA listings
 */
export async function fetchCREAListings(limit: number = 100, offset: number = 0): Promise<CREAListing[]> {
    console.log('🚀 fetchCREAListings called with:', { limit, offset })

    try {

        const response = await CREAListingsService.getListings({ limit, offset })

        console.log('✅ CREA listings fetch completed, results count:', response.data.length)

        return response.data
    } catch (error: any) {
        console.error('❌ Error fetching CREA listings:', error.message)
        // Return empty array on error - component will show "No listings found"
        return []
    }
}

/**
 * Search CREA listings by raw message
 */
export async function searchCREAListings(query: string, limit: number = 100): Promise<CREAListing[]> {
    console.log('🚀 searchCREAListings called with:', { query, limit })

    if (!query || query.trim().length === 0) {
        return []
    }

    try {
        const response = await CREAListingsService.searchMessages({ query: query.trim(), limit })

        console.log('✅ CREA search completed, results count:', response.data.length)

        return response.data
    } catch (error: any) {
        console.error('❌ Error searching CREA listings:', error.message)
        // Return empty array on error - component will show "No listings found"
        return []
    }
}

/**
 * Search CREA listings by location
 */
export async function searchCREAListingsByLocation(location: string, limit: number = 100): Promise<CREAListing[]> {
    console.log('🚀 searchCREAListingsByLocation called with:', { location, limit })

    if (!location || location.trim().length === 0) {
        return []
    }

    try {
        const response = await CREAListingsService.searchByLocation({ location: location.trim(), limit })

        console.log('✅ CREA location search completed, results count:', response.data.length)

        return response.data
    } catch (error: any) {
        console.error('❌ Error searching CREA listings by location:', error.message)
        // Return empty array on error - component will show "No listings found"
        return []
    }
}

/**
 * Search CREA listings by agent name
 */
export async function searchCREAListingsByAgent(agentName: string, limit: number = 100): Promise<CREAListing[]> {
    console.log('🚀 searchCREAListingsByAgent called with:', { agentName, limit })

    if (!agentName || agentName.trim().length === 0) {
        return []
    }

    try {
        const response = await CREAListingsService.searchByAgent({ agent_name: agentName.trim(), limit })

        console.log('✅ CREA agent search completed, results count:', response.data.length)

        return response.data
    } catch (error: any) {
        console.error('❌ Error searching CREA listings by agent:', error.message)
        // Return empty array on error - component will show "No listings found"
        return []
    }
}

/**
 * Search CREA listings by property query
 */
export async function searchCREAListingsByProperty(propertyQuery: string, limit: number = 100): Promise<CREAListing[]> {
    console.log('🚀 searchCREAListingsByProperty called with:', { propertyQuery, limit })

    if (!propertyQuery || propertyQuery.trim().length === 0) {
        return []
    }

    try {
        const response = await CREAListingsService.searchByProperty({ property_query: propertyQuery.trim(), limit })

        console.log('✅ CREA property search completed, results count:', response.data.length)

        return response.data
    } catch (error: any) {
        console.error('❌ Error searching CREA listings by property:', error.message)
        // Return empty array on error - component will show "No listings found"
        return []
    }
}

/**
 * Combined search CREA listings with agent, property, and location filters
 */
export async function searchCREAListingsCombined(filters: {
    agent_name?: string
    property_query?: string
    property_type?: string
    location?: string
    configuration?: string
    listing_type?: string
    transaction_type?: string
    min_price?: number
    max_price?: number
    limit?: number
    exactMatch?: boolean
}): Promise<CREAListing[]> {
    console.log('🚀 searchCREAListingsCombined called with:', filters)

    try {
        const response = await CREAListingsService.combinedSearch(filters)

        console.log('✅ CREA combined search completed, results count:', response.data.length)

        return response.data
    } catch (error: any) {
        console.error('❌ Error in combined CREA listings search:', error.message)
        return []
    }
}
