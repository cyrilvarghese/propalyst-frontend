/**
 * Listing Details Page - Client Component
 * =========================================
 *
 * This page displays scraped property listings from a URL.
 * Uses batch API to fetch all properties at once.
 *
 * Why Client Component?
 * - Needs to handle async data fetching (useEffect, useState)
 * - Needs to manage loading and error states
 * - Uses custom hook for batch fetching
 */

'use client'

import { useMemo, Fragment, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import CompactPropertyCard from './components/CompactPropertyCard'
import CompactMagicBricksCard from './components/CompactMagicBricksCard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePropertyBatch } from './hooks/usePropertyBatch'
import { ScrapedProperty, MagicBricksProperty } from '@/lib/services/property-scrape.service'


/**
 * Main Listing Page Component
 */
export default function ListingPage() {
    const searchParams = useSearchParams()
    const url = searchParams.get('url') || ''
    const origQuery = searchParams.get('orig_query') || undefined

    // Decode URL if it exists
    const decodedUrl = url ? decodeURIComponent(url) : ''

    // Use batch fetch hook
    const { properties, isLoading, error, isComplete, apiCallsMade, source, relevanceScore, relevanceReason } = usePropertyBatch(decodedUrl, origQuery)

    // Check if properties are MagicBricks type
    const isMagicBricks = source === 'magicbricks'

    // Relevance threshold slider state
    const [relevanceThreshold, setRelevanceThreshold] = useState([5])

    // Group properties by relevance (dynamic threshold)
    // Both MagicBricks and SquareYards use per-property relevance scores
    const groupedProperties = useMemo(() => {
        // Filter properties by relevance score
        const allProps = properties as (ScrapedProperty | MagicBricksProperty)[]
        const threshold = relevanceThreshold[0]
        const mostRelevant = allProps.filter(p => (p.relevance_score ?? 0) >= threshold)
        const others = allProps.filter(p => (p.relevance_score ?? 0) < threshold)

        // Sort each group by relevance score descending
        const sortByRelevance = (a: ScrapedProperty | MagicBricksProperty, b: ScrapedProperty | MagicBricksProperty) => {
            const scoreA = a.relevance_score ?? -1
            const scoreB = b.relevance_score ?? -1
            return scoreB - scoreA
        }

        return {
            mostRelevant: mostRelevant.sort(sortByRelevance),
            others: others.sort(sortByRelevance)
        }
    }, [properties, relevanceThreshold])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Back Button */}
                <Link
                    href="/search"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Search</span>
                </Link>

                {/* No URL State */}
                {!url && (
                    <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                        <div className="text-center py-12">
                            <p className="text-gray-600">No URL provided</p>
                            <Link
                                href="/search"
                                className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
                            >
                                Go back to search
                            </Link>
                        </div>
                    </Card>
                )}

                {/* Loading State */}
                {url && isLoading && properties.length === 0 && (
                    <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="text-gray-600 mt-4">Scraping property listings...</p>
                        </div>
                    </Card>
                )}

                {/* Error State */}
                {error && (
                    <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                        <div className="text-center py-12">
                            <div className="text-red-400 text-5xl mb-4">⚠️</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Error loading properties
                            </h3>
                            <p className="text-gray-500">{error.message}</p>
                        </div>
                    </Card>
                )}

                {/* Properties Display */}
                {url && !error && (properties.length > 0 || isComplete) && (
                    <div className="space-y-6">
                        {/* Header Card */}
                        <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Property Listings
                                    </h2>
                                    {properties.length > 0 && origQuery ? (
                                        <p className="text-xl text-gray-500 mt-1">
                                            Found {properties.length} {properties.length === 1 ? 'property' : 'properties'} matching "{decodeURIComponent(origQuery)}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-600 mt-1">
                                            No properties found for the query "{decodeURIComponent(origQuery || '')}"
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        <a href={decodeURIComponent(url || '')} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 hover:underline break-all cursor-pointer">{decodeURIComponent(url || '')}</a> URL
                                    </p>

                                    {isLoading && (
                                        <div className="text-xs text-gray-600 bg-indigo-100 px-3 py-1.5 rounded-full font-medium">
                                            Loading...
                                        </div>
                                    )}

                                </div>
                            </div>
                        </Card>

                        {/* Relevance Filter Control */}
                        {properties.length > 0 && (
                            <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Relevance Filter
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Show properties with score ≥ {relevanceThreshold[0]}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {groupedProperties.mostRelevant.length} / {properties.length}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-medium text-gray-600 w-8">0</span>
                                        <Slider
                                            value={relevanceThreshold}
                                            onValueChange={setRelevanceThreshold}
                                            min={0}
                                            max={10}
                                            step={1}
                                            className="flex-1"
                                        />
                                        <span className="text-xs font-medium text-gray-600 w-8">10</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>All</span>
                                        <span>Moderate</span>
                                        <span>High</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Property Cards - Grouped by Relevance */}
                        {(groupedProperties.mostRelevant.length > 0 || groupedProperties.others.length > 0) ? (
                            <div className="space-y-6">
                                {/* Most Relevant Section */}
                                {groupedProperties.mostRelevant.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Matching Properties (Score ≥ {relevanceThreshold[0]})
                                            </h3>
                                            <Badge className="bg-green-500 text-white text-xs">
                                                {groupedProperties.mostRelevant.length}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {groupedProperties.mostRelevant.map((property, index) => {
                                                const key = typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `most-relevant-${index}`;
                                                return (
                                                    <Fragment key={key}>
                                                        {isMagicBricks ? (
                                                            <CompactMagicBricksCard
                                                                property={property as MagicBricksProperty}
                                                            />
                                                        ) : (
                                                            <CompactPropertyCard
                                                                property={property as ScrapedProperty}
                                                            />
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Others Section */}
                                {groupedProperties.others.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-lg font-semibold text-gray-700">
                                                Others (Score &lt; {relevanceThreshold[0]})
                                            </h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {groupedProperties.others.length}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {groupedProperties.others.map((property, index) => {
                                                const key = typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `others-${index}`;
                                                return (
                                                    <Fragment key={key}>
                                                        {isMagicBricks ? (
                                                            <CompactMagicBricksCard
                                                                property={property as MagicBricksProperty}
                                                            />
                                                        ) : (
                                                            <CompactPropertyCard
                                                                property={property as ScrapedProperty}
                                                            />
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : isComplete ? (
                            <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-5xl mb-4">🏠</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        No properties found
                                    </h3>
                                    <p className="text-gray-500">
                                        The URL did not return any property listings
                                    </p>
                                </div>
                            </Card>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    )
}
