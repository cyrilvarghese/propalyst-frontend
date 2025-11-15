/**
 * Tavily Property Search Service
 * ================================
 *
 * Uses Tavily Search API to find property listings.
 * Works with optimized queries from QueryOptimizerService.
 *
 * API Docs: https://docs.tavily.com/
 */

import { tavily } from '@tavily/core'
import { unstable_cache } from 'next/cache'

const TAVILY_API_KEY = process.env.NEXT_PUBLIC_TAVILY_API_KEY || process.env.TAVILY_API_KEY

/**
 * Property Result (matches ResultCard expectations)
 */
export interface TavilyProperty {
    id: string
    title: string
    location: string
    price: number
    bedrooms: number
    bathrooms: number
    area: number
    imageUrl: string
    description: string
    propertyFor?: 'rent' | 'sale'
    url?: string
    source?: string
}

/**
 * Tavily API Response Types
 */
interface TavilySearchResult {
    title: string
    url: string
    content: string
    score: number
}

interface TavilySearchResponse {
    results: TavilySearchResult[]
    query: string
}

/**
 * Internal function to call Tavily API (no caching)
 */
async function _callTavilyAPI(query: string, searchOptions: any): Promise<TavilySearchResponse> {
    if (!TAVILY_API_KEY) {
        throw new Error('TAVILY_API_KEY not configured. Please add NEXT_PUBLIC_TAVILY_API_KEY to your .env.local file')
    }

    const tavilyClient = tavily({ apiKey: TAVILY_API_KEY })
    return await tavilyClient.search(query, searchOptions)
}

/**
 * Cached Tavily API call with revalidation
 */
const cachedTavilySearch = unstable_cache(
    async (query: string, sources: string | undefined, searchOptions: any) => {
        return await _callTavilyAPI(query, searchOptions)
    },
    ['tavily-search'], // Cache key prefix
    {
        tags: ['tavily', 'property-search'],
        revalidate: 3600, // Revalidate after 1 hour (3600 seconds)
    }
)

/**
 * Tavily Property Search Service
 */
export class TavilyPropertySearchService {
    private searchId: string
    private tavilyClient: any

    constructor() {
        this.searchId = `tavily-${Date.now()}-${Math.random().toString(36).substring(7)}`

        if (!TAVILY_API_KEY) {
            throw new Error('TAVILY_API_KEY not configured. Please add NEXT_PUBLIC_TAVILY_API_KEY to your .env.local file')
        }

        this.tavilyClient = tavily({ apiKey: TAVILY_API_KEY })
        console.log(`[TavilyPropertySearch:${this.searchId}] 🚀 Initialized with Tavily`)
    }

    /**
     * Main search method using Tavily API
     * Returns raw results for debugging
     */
    async search(optimizedQuery: string, sources?: string): Promise<any[]> {
        console.log(`[TavilyPropertySearch:${this.searchId}] 🔍 Searching with optimized query:`, optimizedQuery)
        console.log(`[TavilyPropertySearch:${this.searchId}] 📋 Sources:`, sources || 'All sources')

        try {
            const tavilyResults = await this.tavilyApiSearch(optimizedQuery, sources)

            console.log(`[TavilyPropertySearch:${this.searchId}] ✅ Found ${tavilyResults.results?.length || 0} results`)
            console.log(`[TavilyPropertySearch:${this.searchId}] 📄 Raw response:`, JSON.stringify(tavilyResults, null, 2))

            // Return raw results for debugging
            return tavilyResults.results || []

        } catch (error: any) {
            console.error(`[TavilyPropertySearch:${this.searchId}] ❌ Error:`, error.message)
            throw error
        }
    }

    /**
     * Call Tavily API to get search results
     */
    private async tavilyApiSearch(query: string, sources?: string): Promise<TavilySearchResponse> {
        console.log(`[TavilyPropertySearch:${this.searchId}] 🌐 Calling Tavily API`)

        // // Build domain list for filtering (if sources specified)
        // let includeDomains: string[] | undefined
        // if (sources) {
        //     const sourcesList = sources.split(',').map(s => s.trim())
        //     const domainMap: Record<string, string> = {
        //         'magicbricks': 'magicbricks.com',
        //         'housing': 'housing.com',
        //         '99acres': '99acres.com',
        //         'nobroker': 'nobroker.com',
        //         'commonfloor': 'commonfloor.com',
        //         'squareyards': 'squareyards.com'
        //     }
        //     includeDomains = sourcesList
        //         .map(s => domainMap[s.toLowerCase()] || `${s}.com`)
        //         .filter(Boolean)
        // }

        // Build search options object
        // Note: Tavily JS SDK uses camelCase parameter names
        const searchOptions: any = {
            searchDepth: 'advanced',
            maxResults: 20,
            includeAnswer: true,
            includeRawContent: 'markdown',
            topic: 'general',
            country: 'india',
        }

        // Add domain filtering if sources specified
        // if (includeDomains && includeDomains.length > 0) {
        //     searchOptions.includeDomains = includeDomains
        //     console.log(`[TavilyPropertySearch:${this.searchId}] 🎯 Filtering domains:`, includeDomains)
        // } else {
        console.log(`[TavilyPropertySearch:${this.searchId}] 🌍 Searching all domains`)
        // }

        // Call cached Tavily API
        const response = await cachedTavilySearch(query, sources, searchOptions)

        console.log(`[TavilyPropertySearch:${this.searchId}] 📝 Received ${response.results?.length || 0} results`)
        return response
    }


}

/**
 * Static helper for easy usage
 */
export const searchWithTavily = async (optimizedQuery: string, sources?: string): Promise<TavilyProperty[]> => {
    const service = new TavilyPropertySearchService()
    return service.search(optimizedQuery, sources)
}
