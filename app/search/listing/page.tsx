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
 * - Uses custom hooks for batch fetching and filtering
 * 
 * Refactored with React Best Practices:
 * - Extracted constants to separate file
 * - Extracted types to separate file
 * - Extracted custom hooks for state management
 * - Extracted presentational components
 * - Main page focuses on composition
 */

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Hooks
import { usePropertyStream } from './hooks/usePropertyStream'
import { usePropertyFilters } from './hooks/usePropertyFilters'
import { useCacheReset } from './hooks/useCacheReset'

// Components
import { ListingHeader } from './components/ListingHeader'
import { PropertyFilters } from './components/PropertyFilters'
import { PropertyGrid } from './components/PropertyGrid'
import { NoUrlState, LoadingState, ErrorState } from './components/EmptyStates'

// Types
import { PROPERTY_SOURCES } from './constants/listing.constants'

/**
 * Main Listing Content Component
 * Wrapped in Suspense boundary to handle useSearchParams
 */
function ListingContent() {
    // ========================================================================
    // SETUP
    // ========================================================================

    const router = useRouter()
    const searchParams = useSearchParams()

    // Get URL from query params
    const url = searchParams.get('url') || ''
    const origQuery = searchParams.get('orig_query') || undefined
    const decodedUrl = url ? decodeURIComponent(url) : ''

    // ========================================================================
    // FETCH DATA
    // ========================================================================

    /**
     * usePropertyStream: Streams properties from backend via SSE
     * 
     * Returns:
     * - properties: Array of properties (accumulates as they stream in)
     * - isLoading: Is stream in progress?
     * - error: Error if stream failed
     * - isComplete: Has stream completed?
     * - source: 'magicbricks' or 'squareyards'
     * - (other metadata fields)
     */
    const { properties, isLoading, error, isComplete, source } = usePropertyStream(
        decodedUrl,
        origQuery
    )

    // ========================================================================
    // FILTER & GROUP PROPERTIES
    // ========================================================================

    /**
     * usePropertyFilters: Manages all filtering logic
     * 
     * Returns:
     * - filters: Current filter values
     * - costBounds: Slider bounds for cost
     * - areaBounds: Slider bounds for area
     * - groupedProperties: Filtered and grouped properties
     * - updateSearchQuery, updateCostRange, etc.: Update callbacks
     */
    const {
        filters,
        costBounds,
        areaBounds,
        groupedProperties,
        updateSearchQuery,
        updateCostRange,
        updateAreaRange,
        updateRelevanceThreshold,
    } = usePropertyFilters(properties)

    // ========================================================================
    // CACHE MANAGEMENT
    // ========================================================================

    /**
     * useCacheReset: Manages cache deletion
     * 
     * Returns:
     * - cacheState: { isDeleting, success, error }
     * - resetCache: Function to trigger reset
     */
    const { cacheState, resetCache } = useCacheReset(decodedUrl)

    // ========================================================================
    // DETERMINE PROPERTY SOURCE
    // ========================================================================

    /**
     * Check if properties are from MagicBricks
     * Used to determine which card component to render
     */
    const isMagicBricks = source === PROPERTY_SOURCES.MAGIC_BRICKS

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={(e) => {
                        e.preventDefault()
                        router.back()
                    }}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Search</span>
                </Button>

                {/* ============================================================ */}
                {/* STATE: No URL provided */}
                {/* ============================================================ */}
                {!url && <NoUrlState />}

                {/* ============================================================ */}
                {/* STATE: Loading */}
                {/* ============================================================ */}
                {url && isLoading && properties.length === 0 && (
                    <LoadingState message="Scraping property listings..." />
                )}

                {/* ============================================================ */}
                {/* STATE: Error */}
                {/* ============================================================ */}
                {error && <ErrorState error={error} />}

                {/* ============================================================ */}
                {/* STATE: Display properties */}
                {/* ============================================================ */}
                {url && !error && (properties.length > 0 || isComplete) && (
                    <div className="space-y-6">
                        {/* Sticky Header Section */}
                        <div className="sticky top-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 pb-6 -mx-4 px-4 pt-2 -mt-2">
                            {/* Header with title and reset button */}
                            <ListingHeader
                                url={url}
                                origQuery={origQuery}
                                propertyCount={properties.length}
                                isLoading={isLoading}
                                cacheState={cacheState}
                                onResetCache={resetCache}
                            />

                            {/* Filter controls - only show if we have properties */}
                            {properties.length > 0 && (
                                <PropertyFilters
                                    filters={filters}
                                    costBounds={costBounds}
                                    areaBounds={areaBounds}
                                    groupedProperties={groupedProperties}
                                    onSearchChange={updateSearchQuery}
                                    onCostChange={updateCostRange}
                                    onAreaChange={updateAreaRange}
                                    onRelevanceChange={updateRelevanceThreshold}
                                />
                            )}
                        </div>

                        {/* Property grid or empty state */}
                        <PropertyGrid
                            groupedProperties={groupedProperties}
                            isMagicBricks={isMagicBricks}
                            relevanceThreshold={filters.relevanceThreshold}
                            isComplete={isComplete}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Main Listing Page Component
 * 
 * Wraps ListingContent in Suspense to satisfy Next.js requirements
 * for useSearchParams() in production builds
 */
export default function ListingPage() {
    return (
        <Suspense fallback={<LoadingState message="Loading property listings..." />}>
            <ListingContent />
        </Suspense>
    )
}
