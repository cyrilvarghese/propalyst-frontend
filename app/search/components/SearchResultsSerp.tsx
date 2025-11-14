/**
 * SearchResultsSerp - ASYNC Server Component
 * ==========================================
 *
 * This component uses SerpAPI to fetch Google Search results
 * for property listings.
 *
 * Why Server Component?
 * - Fetches data from SerpAPI on the server
 * - Can be async (use await directly)
 * - Keeps API keys secure
 * - No JavaScript shipped to browser
 * - Better SEO
 */

import { Card } from '@/components/ui/card'
import ResultCard from './ResultCard'
import { SerpPropertySearchService, SerpProperty } from '@/lib/services'

interface SearchResultsSerpProps {
  query: string
  sources: string
  provider: string
}

/**
 * Fetch properties using SerpAPI
 */
async function fetchPropertiesWithSerp(query: string, sources: string, provider: string): Promise<SerpProperty[]> {
  console.log('🚀 fetchPropertiesWithSerp called with:', { query, sources, provider })

  // Don't call API if query is missing
  // Note: sources is now optional - if empty, search across all domains
  if (!query) {
    console.log('⏭️  Skipping SERP API call - missing query')
    return []
  }

  try {
    console.log('📡 About to call SerpPropertySearchService.search')

    // Create new SERP service instance
    const serpService = new SerpPropertySearchService()

    // Call the SERP service
    const properties = await serpService.search({
      query,
      sources,
      provider: 'serpapi'
    })

    console.log('✅ SERP search completed, results count:', properties.length)
    return properties

  } catch (error: any) {
    console.error('❌ Error fetching properties from SERP:', error.message)
    // Return empty array on error - component will show "No properties found"
    return []
  }
}

/**
 * SearchResultsSerp Component
 * Uses SerpAPI for Google Search results
 */
export default async function SearchResultsSerp({ query, sources, provider }: SearchResultsSerpProps) {
  const timestamp = new Date().toISOString()
  console.log(`\n⏰ [${timestamp}] SearchResultsSerp component rendered (SERPAPI)`)
  console.log('📝 Props received:', { query, sources, provider })
  console.log('🎯 Using: SerpAPI - Real-time Google Search')

  // Initial empty state - no filters selected yet
  if (!query && !sources && !provider) {
    console.log('🔴 Rendering empty state - no params provided')

    return (
      <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-purple-600"
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

            <p className="text-gray-600 mb-4 leading-relaxed">
              Using <span className="font-semibold text-purple-600">SerpAPI</span> for Google Search results
            </p>

            <p className="text-gray-600 mb-8 leading-relaxed text-sm">
              Enter your search query to discover properties. Optionally select data sources to narrow results.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Enter query</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <span>Optional: Select sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <span>Search</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Fetch properties using SerpAPI
  const properties = await fetchPropertiesWithSerp(query, sources, provider)

  // No results found (after search)
  if (properties.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-12">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No properties found
          </h3>
          <p className="text-gray-500 mb-4">
            {query || provider
              ? 'Try adjusting your search query or selecting different data sources'
              : 'Enter a search query to get started'}
          </p>
          <p className="text-xs text-gray-400">
            Powered by SerpAPI • Google Search Results
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
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Found {properties.length} properties
              {query && ` matching "${query}"`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs text-gray-600 bg-purple-50 px-3 py-1.5 rounded-full font-medium border border-purple-200">
              🌐 Powered by SerpAPI
            </div>
            <div className="text-xs text-gray-500">
              Source: {sources || 'All sources'}
            </div>
          </div>
        </div>
      </Card>

      {/* Property cards */}
      <div className="grid grid-cols-1 gap-6">
        {properties.map((property) => (
          <ResultCard key={property.id} property={property} />
        ))}
      </div>

      {/* Footer note */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-4">
        <p className="text-xs text-gray-600 text-center">
          Results fetched from Google Search via SerpAPI • Real-time property listings {sources ? `from ${sources}` : 'from all property websites'}
        </p>
      </Card>
    </div>
  )
}
