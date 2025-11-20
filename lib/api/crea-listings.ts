/**
 * CREA Listings API
 * =================
 * 
 * Fetches CREA listings using the backend API.
 * This function is separated from the component for better organization.
 */

import { CREAListingsService, CREAListing, CREALocationSearchRequest } from '@/lib/services/crea-listings.service'

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

