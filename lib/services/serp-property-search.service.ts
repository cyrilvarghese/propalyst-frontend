/**
 * SERP API Property Search Service
 * =================================
 *
 * This service uses SerpAPI (https://serpapi.com) to search for properties
 * using Google Search with advanced operators.
 *
 * SerpAPI provides structured Google Search results without rate limits.
 */

const SERP_API_KEY = process.env.NEXT_PUBLIC_SERP_API_KEY || process.env.SERP_API_KEY
const SERP_API_BASE_URL = 'https://serpapi.com/search'

/**
 * Request types
 */
export interface SerpPropertySearchRequest {
    query: string
    sources: string
    provider: string
}

/**
 * Property Result (matches ResultCard expectations)
 */
export interface SerpProperty {
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
 * SERP API Response Types
 */
interface SerpOrganicResult {
    position: number
    title: string
    link: string
    snippet: string
    displayed_link?: string
}

interface SerpSearchResponse {
    organic_results: SerpOrganicResult[]
    search_metadata: {
        status: string
        total_results: number
    }
}

/**
 * SERP Property Search Service
 */
export class SerpPropertySearchService {
    private searchId: string

    constructor() {
        this.searchId = `serp-${Date.now()}-${Math.random().toString(36).substring(7)}`

        if (!SERP_API_KEY) {
            throw new Error('SERP_API_KEY not configured. Please add NEXT_PUBLIC_SERP_API_KEY to your .env.local file')
        }

        console.log(`[SerpPropertySearch:${this.searchId}] 🚀 Initialized with SerpAPI`)
    }

    /**
     * Main search method using SerpAPI
     */
    async search(request: SerpPropertySearchRequest): Promise<SerpProperty[]> {
        console.log(`[SerpPropertySearch:${this.searchId}] 🔍 Searching with:`, request)

        try {
            const searchQuery = this.buildOptimizedSearchQuery(request.query, request.sources)
            const serpResults = await this.serpApiSearch(searchQuery)
            const properties = this.parseSerpResults(serpResults)

            console.log(`[SerpPropertySearch:${this.searchId}] ✅ Found ${properties.length} properties`)
            return properties

        } catch (error: any) {
            console.error(`[SerpPropertySearch:${this.searchId}] ❌ Error:`, error.message)
            throw error
        }
    }

    /**
     * Build optimized search query using Google Search operators
     */
    private buildOptimizedSearchQuery(query: string, sources: string): string {
        const sourcesList = sources.split(',').map(s => s.trim())
        const lowerQuery = query.toLowerCase()

        // Detect if it's a sale or rental query
        const isSale = lowerQuery.includes('buy') ||
                       lowerQuery.includes('sale') ||
                       lowerQuery.includes('purchase') ||
                       lowerQuery.includes('crore') ||
                       lowerQuery.includes('lakh')

        // Extract property type
        const bhkMatch = query.match(/(\d+)\s*BHK/i)
        const propertyType = bhkMatch ? `"${bhkMatch[0]}"` : '"apartment" OR "flat" OR "house"'

        // Extract location
        const locationMatch = query.match(/(?:in|at|near)\s+([a-zA-Z\s]+?)(?:\s+bangalore|\s+under|\s+\d+|\s*$)/i)
        const location = locationMatch ? `"${locationMatch[1].trim()}"` : ''

        // Extract price range
        let priceRange = ''
        const croreRangeMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:crores?|cr)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:crores?|cr)/i)
        const lakhRangeMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|l)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|l)/i)
        const underCroreMatch = query.match(/under\s+(\d+(?:\.\d+)?)\s*(?:crores?|cr)/i)
        const underLakhMatch = query.match(/under\s+(\d+(?:\.\d+)?)\s*(?:lakhs?|l)/i)
        const underPlainMatch = query.match(/under\s+(\d+)/i)

        if (croreRangeMatch) {
            const min = parseFloat(croreRangeMatch[1]) * 10000000
            const max = parseFloat(croreRangeMatch[2]) * 10000000
            priceRange = `${min}..${max}`
        } else if (lakhRangeMatch) {
            const min = parseFloat(lakhRangeMatch[1]) * 100000
            const max = parseFloat(lakhRangeMatch[2]) * 100000
            priceRange = `${min}..${max}`
        } else if (underCroreMatch) {
            const max = parseFloat(underCroreMatch[1]) * 10000000
            priceRange = `0..${max}`
        } else if (underLakhMatch) {
            const max = parseFloat(underLakhMatch[1]) * 100000
            priceRange = `0..${max}`
        } else if (underPlainMatch) {
            priceRange = `0..${underPlainMatch[1]}`
        }

        // Build site restrictions (only if sources are specified)
        let siteRestrictions = ''
        if (sourcesList.length > 0 && sourcesList[0] !== '') {
            siteRestrictions = sourcesList.map(source => {
                const siteMap: Record<string, string> = {
                    'magicbricks': 'site:magicbricks.com',
                    'housing': 'site:housing.com',
                    '99acres': 'site:99acres.com',
                    'nobroker': 'site:nobroker.com',
                    'commonfloor': 'site:commonfloor.com',
                    'squareyards': 'site:squareyards.com'
                }
                return siteMap[source.toLowerCase()] || `site:${source}.com`
            }).join(' OR ')
        }

        // Combine all operators
        let optimizedQuery = ''
        if (siteRestrictions) {
            optimizedQuery = `(${siteRestrictions}) `
        }
        optimizedQuery += propertyType

        // Add sale/rental intent
        if (isSale) {
            optimizedQuery += ` "for sale" OR "sale" OR intitle:"sale"`
        } else {
            optimizedQuery += ` "for rent" OR "rental" OR intitle:"rent"`
        }

        if (location) optimizedQuery += ` ${location}`
        if (priceRange) optimizedQuery += ` ${priceRange}`
        optimizedQuery += ` "Bangalore" OR "Bengaluru"`

        console.log(`[SerpPropertySearch:${this.searchId}] 🔍 Optimized query:`, optimizedQuery)
        console.log(`[SerpPropertySearch:${this.searchId}] 📊 Query type: ${isSale ? 'SALE' : 'RENTAL'}`)
        return optimizedQuery
    }

    /**
     * Call SerpAPI to get Google Search results
     */
    private async serpApiSearch(query: string): Promise<SerpSearchResponse> {
        console.log(`[SerpPropertySearch:${this.searchId}] 🌐 Calling SerpAPI`)

        const params = new URLSearchParams({
            api_key: SERP_API_KEY!,
        
            q: query,
            num: '20', // Get up to 20 results
            location: 'Bangalore, Karnataka, India',
            hl: 'en',
            gl: 'in'
        })

        const url = `${SERP_API_BASE_URL}?${params.toString()}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            throw new Error(errorData.error || `SERP API error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log(`[SerpPropertySearch:${this.searchId}] 📝 Received ${data.organic_results?.length || 0} results`)
        return data
    }

    /**
     * Parse SERP API results into Property format
     */
    private parseSerpResults(serpResponse: SerpSearchResponse): SerpProperty[] {
        if (!serpResponse.organic_results || serpResponse.organic_results.length === 0) {
            console.warn(`[SerpPropertySearch:${this.searchId}] ⚠️ No organic results found`)
            return []
        }

        return serpResponse.organic_results.map((result, index) => {
            // Extract property details from title and snippet
            const bhkMatch = result.title.match(/(\d+)\s*BHK/i) || result.snippet.match(/(\d+)\s*BHK/i)
            const bedrooms = bhkMatch ? parseInt(bhkMatch[1]) : 2

            // Estimate bathrooms based on bedrooms
            const bathrooms = bedrooms >= 3 ? 2 : 1

            // Extract price from snippet
            let price = 0
            let propertyFor: 'rent' | 'sale' = 'rent'

            // Try to find price in crores (sale)
            const croreMatch = result.snippet.match(/₹?\s*(\d+(?:\.\d+)?)\s*(?:Cr|Crore)/i)
            if (croreMatch) {
                price = parseFloat(croreMatch[1]) * 10000000
                propertyFor = 'sale'
            } else {
                // Try to find price in lakhs (sale or high-end rental)
                const lakhMatch = result.snippet.match(/₹?\s*(\d+(?:\.\d+)?)\s*(?:L|Lakh)/i)
                if (lakhMatch) {
                    price = parseFloat(lakhMatch[1]) * 100000
                    // If less than 5 lakhs, assume rental, else sale
                    propertyFor = price < 500000 ? 'rent' : 'sale'
                } else {
                    // Try to find plain numbers (rental)
                    const plainPriceMatch = result.snippet.match(/₹\s*([\d,]+)/i)
                    if (plainPriceMatch) {
                        price = parseInt(plainPriceMatch[1].replace(/,/g, ''))
                    }
                }
            }

            // Extract location from title or snippet
            const locationMatch = result.title.match(/in\s+([A-Z][a-zA-Z\s]+?)(?:,|$|\||for)/i) ||
                                  result.snippet.match(/in\s+([A-Z][a-zA-Z\s]+?)(?:,|$|\||for)/i)
            const location = locationMatch ? locationMatch[1].trim() : 'Bangalore'

            // Extract area (sq.ft) from snippet
            const areaMatch = result.snippet.match(/(\d+)\s*(?:sq\.?\s*ft|sqft|square feet)/i)
            const area = areaMatch ? parseInt(areaMatch[1]) : bedrooms * 500 // Estimate based on bedrooms

            // Extract source from URL
            const urlObj = new URL(result.link)
            const hostname = urlObj.hostname.replace('www.', '')
            const source = hostname.split('.')[0]

            // Use placeholder image
            const imageUrl = `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&sig=${index}`

            return {
                id: result.link || `property-${index}-${Date.now()}`,
                title: result.title,
                location: location,
                price: price || (propertyFor === 'sale' ? 40000000 : 25000),
                bedrooms,
                bathrooms,
                area,
                imageUrl,
                description: result.snippet,
                propertyFor,
                url: result.link,
                source
            }
        })
    }
}

/**
 * Static helper for easy usage
 */
export const searchWithSerp = async (request: SerpPropertySearchRequest): Promise<SerpProperty[]> => {
    const service = new SerpPropertySearchService()
    return service.search(request)
}
