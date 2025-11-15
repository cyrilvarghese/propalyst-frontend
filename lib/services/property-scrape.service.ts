/**
 * Property Scrape Service - API Client
 * ======================================
 *
 * This service handles scraping property URLs to get structured data.
 * It calls the FastAPI backend directly, following the same pattern as other services.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Property source type
 */
export type PropertySource = 'magicbricks' | 'squareyards' | 'unknown'

/**
 * Detect property source from URL
 */
export function detectSourceFromUrl(url: string): PropertySource {
    try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname.toLowerCase().replace('www.', '')

        if (hostname.includes('magicbricks.com')) {
            return 'magicbricks'
        } else if (hostname.includes('squareyards.com')) {
            return 'squareyards'
        }

        return 'unknown'
    } catch (error) {
        console.warn('Failed to parse URL:', url, error)
        return 'unknown'
    }
}

/**
 * Scraped Property (SquareYards format - matching backend response structure)
 */
export interface ScrapedProperty {
    title: string
    location: string
    price: string // e.g., "₹ 4.2 Cr"
    price_crore: string // Same as price
    bedrooms: string // e.g., "5 BHK + 5 Bath"
    bathrooms: string // Same as bedrooms
    area: string // e.g., "1200Sq.Ft."
    facing?: string // e.g., "West Facing"
    parking?: string // e.g., "1 Covered + 1 Open"
    flooring?: string // e.g., "Marble Flooring"
    furnishing?: string // e.g., "Unfurnished"
    stairs?: string // e.g., "3 floors"
    road_view?: string // e.g., "Road View"
    description: string
    image_url: string
    agent_name?: string // e.g., "Lakshminaryana N"
    agent_rating?: string // e.g., "4.7"
    agent_url?: string // Agent profile URL
    property_url: string
    relevance_score?: number // Relevance score (0-10 typically)
    relevance_reason?: string // Explanation for the relevance score
    matches?: string[] // Array of matching criteria
    mismatches?: string[] // Array of mismatching criteria
}

/**
 * MagicBricks Property (matching MagicBricks backend response structure)
 */
export interface MagicBricksProperty {
    photo_count?: string // e.g., "11+ Photos"
    posted_date?: string // e.g., "Posted: Yesterday"
    agent_name?: string // e.g., "Medsea Properties"
    buyers_served?: string // e.g., "15560+ Buyers Served"
    title: string // e.g., "3 BHK Flat for Sale in Indira Nagar, Bangalore"
    society_name?: string // e.g., "Century Regalia"
    society_url?: string // e.g., "https://www.magicbricks.com/century-regalia-indira-nagar-bangalore-pdpld-4d4235343233353303"
    area?: string // e.g., "2375 sqft"
    carpet_area?: string // e.g., "2000 sqft"
    super_area?: string // e.g., "2375 sqft"
    status?: string // e.g., "Poss. by Apr '29"
    floor?: string // e.g., "5 out of 11"
    transaction?: string // e.g., "New Property"
    furnishing?: string // e.g., "Unfurnished"
    facing?: string // e.g., "East"
    overlooking?: string // e.g., "Garden/Park, Pool, Main Road"
    ownership?: string // e.g., "Freehold"
    parking?: string // e.g., "2 Covered"
    bathroom?: string // e.g., "3"
    balcony?: string // e.g., "1"
    description: string
    description2?: string // e.g., "Description 2"
    price?: string // e.g., "₹5.34 Cr"
    price_per_sqft?: string // e.g., "₹22526 per sqft"
    property_url: string
    relevance_score?: number // Relevance score (0-10 typically)
    relevance_reason?: string // Explanation for the relevance score
    matches?: string[] // Array of matching criteria
    mismatches?: string[] // Array of mismatching criteria
}

/**
 * Scrape Response (SquareYards format - matching backend response structure)
 */
export interface PropertyScrapeResponse {
    success: boolean
    count: number
    source: string
    scraped_at: string
    properties: ScrapedProperty[]
    api_calls_made?: number
    error?: string
}

/**
 * MagicBricks Scrape Response (with top-level relevance)
 */
export interface MagicBricksScrapeResponse {
    success: boolean
    count: number
    source: string
    scraped_at: string
    properties: MagicBricksProperty[]
    relevance_score?: number // Top-level relevance score
    relevance_reason?: string // Top-level relevance reason
    api_calls_made?: number
    error?: string
}

/**
 * Property Scrape Service
 */
export class PropertyScrapeService {
    /**
     * Scrape a property URL to get structured data (legacy - returns all at once)
     * 
     * @param url - The property listing URL to scrape
     * @returns Structured property data from the scraped URL
     */
    static async scrapeProperty(url: string): Promise<PropertyScrapeResponse> {
        console.log('🔍 PropertyScrapeService.scrapeProperty called with URL:', url)

        // Call FastAPI backend directly (same pattern as PropertySearchService)
        const encodedUrl = encodeURIComponent(url)
        const response = await fetch(`${API_BASE_URL}/api/get_listing_details_batch?url=${encodedUrl}`, {
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
        console.log('✅ PropertyScrapeService.scrapeProperty completed, found', result.count, 'properties')
        return result
    }

    /**
     * Fetch properties in batch (non-streaming)
     * Returns all properties at once after scraping
     * Automatically detects source and routes to appropriate API endpoint
     * 
     * @param url - The property listing URL to scrape
     * @param origQuery - Optional original search query for relevance scoring
     * @param batchSize - Optional batch size (defaults to 10)
     * @returns Promise with all properties (SquareYards or MagicBricks format)
     */
    static async fetchPropertiesBatch(
        url: string,
        origQuery?: string,
        batchSize: number = 10
    ): Promise<PropertyScrapeResponse | MagicBricksScrapeResponse> {
        console.log('🔍 PropertyScrapeService.fetchPropertiesBatch called with URL:', url, 'origQuery:', origQuery)

        // Detect source from URL
        const source = detectSourceFromUrl(url)
        console.log('📍 Detected source:', source)

        // Build URL with query parameters
        const params = new URLSearchParams({
            url: url,
            batch_size: batchSize.toString()
        })

        if (origQuery) {
            params.set('orig_query', origQuery)
        } else {
            params.set('orig_query', '')
        }

        // Select API endpoint based on source
        let endpoint: string
        if (source === 'magicbricks') {
            endpoint = '/api/get_listing_details_batch_magicbricks'
        } else if (source === 'squareyards') {
            endpoint = '/api/get_listing_details_batch'
        } else {
            // Default to SquareYards endpoint for unknown sources
            endpoint = '/api/get_listing_details_batch'
        }

        const apiUrl = `${API_BASE_URL}${endpoint}?${params.toString()}`
        console.log('🌐 Fetching from:', apiUrl)

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch properties')
        }

        console.log('✅ PropertyScrapeService.fetchPropertiesBatch completed')
        console.log(`📊 Found ${result.count} properties with ${result.api_calls_made} API calls`)
        console.log(`🏢 Source: ${result.source || source}`)

        return result
    }
}


