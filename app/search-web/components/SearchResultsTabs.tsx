/**
 * SearchResultsTabs - Client Component
 * =====================================
 * 
 * Wraps search results in tabs for different data sources
 */

'use client'

import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'

interface SearchResultsTabsProps {
    query: string
    provider: string
    results: any[] // All results from backend
}

export default function SearchResultsTabs({ query, provider, results }: SearchResultsTabsProps) {
    const router = useRouter()

    // Define available sources
    const sources = [
        { value: 'magicbricks', label: 'MagicBricks', status: true },
        { value: 'housing', label: 'Housing', status: false },
        { value: '99acres', label: '99acres', status: false },
        { value: 'nobroker', label: 'NoBroker', status: false },
        { value: 'commonfloor', label: 'CommonFloor', status: false },
        { value: 'squareyards', label: 'SquareYards', status: true },
    ]

    // Handle card click - navigate to listing page
    const handleCardClick = (url: string) => {
        if (!url) return

        // Encode the URL for the query parameter
        const encodedUrl = encodeURIComponent(url)

        // Navigate to listing page with URL and original query
        router.push(`/search/listing?url=${encodedUrl}&orig_query=${encodeURIComponent(query)}`)
    }

    // Filter results by source
    const filterBySource = (sourceValue: string) => {
        return results.filter((result: any) => {
            // Normalize both values for comparison
            const resultSource = (result.source || '').toLowerCase().trim()
            const targetSource = sourceValue.toLowerCase().trim()

            // Check if result URL or source matches
            if (resultSource === targetSource) return true
            if (result.url && result.url.toLowerCase().includes(targetSource)) return true

            return false
        })
    }

    // Calculate counts for each source
    const sourceCounts = sources.map(source => ({
        ...source,
        count: filterBySource(source.value).length
    }))

    return (
        <div className="space-y-6">
            {/* Results header */}
            {/* <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {results.length} results
              {query && ` matching "${query}"`}
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            Provider: {provider}
          </div>
        </div>
      </Card> */}

            {/* Tabs for different sources */}
            <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                <Tabs defaultValue="magicbricks" className="w-full">
                    <TabsList>
                        {sourceCounts
                            .filter(source => source.status === true)
                            .map(source => (
                                <TabsTrigger key={source.value} value={source.value}>
                                    {source.label} ({source.count})
                                </TabsTrigger>
                            ))}
                    </TabsList>

                    {sources
                        .filter(source => source.status === true)
                        .map(source => {
                            const filteredResults = filterBySource(source.value)

                            return (
                                <TabsContent key={source.value} value={source.value} className="mt-6">
                                    {filteredResults.length > 0 ? (
                                        <div className="space-y-4">
                                            {filteredResults.map((result: any, index: number) => (
                                                <Card
                                                    key={result.url || index}
                                                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                                    onClick={() => handleCardClick(result.url)}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                                                            {result.title || `Result #${index + 1}`}
                                                        </h3>
                                                        {result.score && (
                                                            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                Score: {result.score.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {result.url && (
                                                        <p className="text-indigo-600 text-sm mb-3 truncate">
                                                            {result.url}
                                                        </p>
                                                    )}

                                                    {/* {result.content && (
                                                    <div className="mb-3">
                                                        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">CONTENT</p>
                                                        <p className="text-gray-700 text-sm">{result.content}</p>
                                                    </div>
                                                )} */}
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-gray-400 text-5xl mb-4">🏠</div>
                                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                                No {source.label} properties found
                                            </h3>
                                            <p className="text-gray-500">
                                                Try adjusting your search query or check another source
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            )
                        })}
                </Tabs>
            </Card>
        </div>
    )
}

