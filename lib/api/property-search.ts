/**
 * Property Search API
 * ===================
 * 
 * Fetches properties using Python backend (FastAPI + LangChain) or Tavily.
 * This function is separated from the component for better organization.
 */

import { PropertySearchService, PropertyResult, QueryOptimizerService, TavilyPropertySearchService } from '@/lib/services'
import { SerpProperty } from '@/lib/services/serp-property-search.service'
import { TavilyProperty } from '@/lib/services/tavily-property-search.service'

// Union type for all property types
export type Property = SerpProperty | TavilyProperty

/**
 * Internal function to fetch properties (no caching)
 */
async function _fetchProperties(query: string, sources: string | undefined, provider: string): Promise<Property[] | any[]> {
    console.log('🚀 fetchProperties called with:', { query, sources, provider })

    // Don't call API if query is missing
    // Note: sources is now optional - if empty, search across all domains
    if (!query || !provider) {
        console.log('⏭️  Skipping API call - missing query or provider')
        return []
    }

    try {
        // Check if we should use Tavily
        if (provider === 'tavily') {
            console.log('📡 Using Tavily flow: Query Optimizer → Tavily Search')

            // Step 1: Optimize query using Gemini
            const optimizer = new QueryOptimizerService()
            const optimizedQuery = await optimizer.optimize(query)
            console.log('🎯 Query optimized:', optimizedQuery)

            // Step 2: Search with Tavily using optimized query
            const tavilyService = new TavilyPropertySearchService()
            const rawResults = await tavilyService.search(optimizedQuery, sources || '')

            console.log('✅ Tavily search completed, results count:', rawResults.length)
            console.log('📄 Returning RAW Tavily results (not parsed)')

            // Return raw results for JSON display
            return rawResults

        } else {
            // Use Python backend for other providers (openai, gemini)
            console.log('📡 About to call Python Backend (PropertySearchService)')

            const response = await PropertySearchService.search({
                query,
                sources: sources || '', // Send empty string if no sources
                provider,
            })

            console.log('✅ Backend search completed, results count:', response.results.length)

            // Transform backend response to Property format
            const properties: Property[] = response.results.map((result: PropertyResult, index: number) => {
                // Extract bedrooms from property_type
                const bhkMatch = result.property_type?.match(/(\d+)BHK/i)
                const bedrooms = bhkMatch ? parseInt(bhkMatch[1]) : 2

                // Estimate bathrooms based on bedrooms
                const bathrooms = bedrooms >= 3 ? 2 : 1

                // Parse price from string to number
                let price = 0
                let propertyFor: 'rent' | 'sale' = 'rent'

                if (result.price) {
                    const priceMatch = result.price.match(/(\d+(?:\.\d+)?)/)
                    if (priceMatch) {
                        const priceValue = parseFloat(priceMatch[1])
                        // If price contains "Cr" or "crore", it's a sale
                        if (result.price.toLowerCase().includes('cr') || result.price.toLowerCase().includes('crore')) {
                            price = priceValue * 10000000 // Convert crores to rupees
                            propertyFor = 'sale'
                        } else if (result.price.toLowerCase().includes('lakh')) {
                            price = priceValue * 100000 // Convert lakhs to rupees
                            propertyFor = price > 500000 ? 'sale' : 'rent'
                        } else {
                            price = priceValue // Assume it's already in rupees
                        }
                    }
                }

                // Extract area from snippet if available
                const areaMatch = result.snippet?.match(/(\d+)\s*(?:sq\.?\s*ft|sqft|square feet)/i)
                const area = areaMatch ? parseInt(areaMatch[1]) : bedrooms * 500

                // Use placeholder image
                const imageUrl = `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&sig=${index}`

                return {
                    id: result.url || `property-${index}-${Date.now()}`,
                    title: result.title,
                    location: result.location || 'Location not specified',
                    price: price || (propertyFor === 'sale' ? 40000000 : 25000),
                    bedrooms,
                    bathrooms,
                    area,
                    imageUrl,
                    description: result.snippet || 'No description available',
                    propertyFor,
                    url: result.url,
                    source: result.source
                }
            })

            return properties
        }

    } catch (error: any) {
        console.error('❌ Error fetching properties:', error.message)
        // Return empty array on error - component will show "No properties found"
        return []
    }
}

/**
 * Fetch properties
 */
export const fetchProperties = _fetchProperties

