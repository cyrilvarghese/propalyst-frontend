/**
 * SearchResults - ASYNC Server Component
 * ========================================
 *
 * This is a Server Component (no 'use client' needed).
 *
 * Why Server Component?
 * - Fetches data from API on the server
 * - Can be async (use await directly - no useEffect!)
 * - Keeps API keys secure on server
 * - No JavaScript shipped to browser
 * - Better SEO (content available immediately)
 */

import { Card } from '@/components/ui/card'
import ResultCard from './ResultCard'
import JsonResultCard from './JsonResultCard'
import { PropertySearchService, PropertyResult, QueryOptimizerService, TavilyPropertySearchService } from '@/lib/services'
import { SerpProperty } from '@/lib/services/serp-property-search.service'
import { TavilyProperty } from '@/lib/services/tavily-property-search.service'

// Union type for all property types
type Property = SerpProperty | TavilyProperty

interface SearchResultsProps {
  query: string
  sources: string
  provider: string
}

/**
 * Deduplicate properties based on URL
 * Keeps the first occurrence of each unique URL
 */
function deduplicatePropertiesByUrl<T extends { url?: string }>(properties: T[]): T[] {
  const seenUrls = new Set<string>()

  return properties.filter(property => {
    if (!property.url) return true // Include properties without URLs

    const normalizedUrl = property.url.toLowerCase().replace(/\/$/, '')
    if (seenUrls.has(normalizedUrl)) return false

    seenUrls.add(normalizedUrl)
    return true
  })
}

/**
 * Fetch properties using Python backend (FastAPI + LangChain) or Tavily
 */
async function fetchProperties(query: string, sources: string, provider: string): Promise<Property[] | any[]> {
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
      const rawResults = await tavilyService.search(optimizedQuery, sources)

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
 * SearchResults Component
 * This is an ASYNC Server Component - notice the 'async' keyword!
 */
export default async function SearchResults({ query, sources, provider }: SearchResultsProps) {
  const timestamp = new Date().toISOString()
  console.log(`\n⏰ [${timestamp}] SearchResults component rendered (PYTHON BACKEND)`)
  console.log('📝 Props received:', { query, sources, provider })
  console.log('🎯 Using: Python Backend (FastAPI + LangChain)')

  // Initial empty state - no filters selected yet
  if (!query && !sources && !provider) {
    console.log('🔴 Rendering empty state - no params provided')

    return (
      <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Start Your Property Search
            </h3>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Choose a search provider and enter your search query. Optionally select data sources to narrow results.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span>Choose provider</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <span>Enter query</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <span>Search</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // ✨ This is the magic of Server Components!
  // We can use 'await' directly - no useEffect, no useState needed!
  const results = await fetchProperties(query, sources, provider)

  // Determine if we're showing raw JSON or parsed properties
  const isTavilyRaw = provider === 'tavily'

  // For Tavily, optimize the query to show optimized version instead of original
  let displayQuery = query
  if (isTavilyRaw && query) {
    try {
      const optimizer = new QueryOptimizerService()
      const optimizedQuery = await optimizer.optimize(query)
      displayQuery = optimizedQuery
    } catch (error) {
      console.warn('Failed to optimize query for display:', error)
      // Fall back to original query if optimization fails
    }
  }

  // No results found (after search)
  if (results.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No properties found
          </h3>
          <p className="text-gray-500">
            {query || provider
              ? 'Try adjusting your search query or selecting different data sources'
              : 'Enter a search query and choose a provider to get started'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results header in card */}
      <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            {/* <h2 className="text-xl font-bold text-gray-900">
              {isTavilyRaw ? 'Raw JSON Results (Tavily)' : 'Search Results'}
            </h2> */}
            <p className=" text-xl font-bold text-gray-600 mt-1">
              {results.length} {isTavilyRaw ? 'results' : 'properties'}
              {query && ` matching "${displayQuery}"`}
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            Source: {sources || 'All sources'} | Provider: {provider}
          </div>
        </div>
      </Card>

      {/* Property cards or JSON results */}
      <div className="grid grid-cols-1 gap-6">
        {isTavilyRaw ? (
          // Show raw JSON for Tavily results
          results.map((result: any, index: number) => (
            <JsonResultCard key={result.url || index} result={result} index={index} origQuery={displayQuery} />
          ))
        ) : (
          // Show parsed property cards for other providers
          results.map((property: any) => (
            <ResultCard key={property.id} property={property} />
          ))
        )}
      </div>
    </div>
  )
}
