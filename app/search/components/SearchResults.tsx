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
import { QueryOptimizerService } from '@/lib/services'
import { fetchProperties } from '@/lib/api/property-search'

interface SearchResultsProps {
  query: string
  sources: string
  provider: string
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
  let results = await fetchProperties(query, sources || undefined, provider)

  // Determine if we're showing raw JSON or parsed properties
  const isTavilyRaw = provider === 'tavily'

  // Client-side filtering by sources (backend doesn't filter)
  // Parse sources string into array and filter results
  if (sources && sources.trim().length > 0) {
    const sourcesArray = sources.split(',').map(s => s.trim().toLowerCase())
    const filteredResults = results.filter((result: any) => {
      // Check if result has a source property and it matches selected sources
      return result.source && sourcesArray.includes(result.source.toLowerCase())
    })

    // Only use filtered results if we actually found matches
    if (filteredResults.length > 0) {
      results = filteredResults
    }
  }


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
