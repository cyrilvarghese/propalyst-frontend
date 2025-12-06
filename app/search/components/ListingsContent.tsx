/**
 * ListingsContent - Client Component
 * ===================================
 *
 * Main component for displaying WhatsApp listings with search, filters, and pagination.
 * Uses custom hooks for clean separation of concerns.
 */

'use client'

import { useEffect, useMemo, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import CREAListingsTable from '../../whatsapp-obs/components/CREAListingsTable'
import SearchInput, { SearchBar } from './SearchInput'
import { useChunkedPagination } from '../hooks/useChunkedPagination'
import { useListingsFilters } from '../hooks/useListingsFilters'
import { useListingConverter } from '../hooks/useListingConverter'
import { searchWhatsAppListingsByMessage, WhatsAppListing } from '@/lib/api/whatsapp-listings'

// High-end residential property background images
const BACKGROUND_IMAGES = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2070',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2074',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070',
]

export default function ListingsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isUpdatingURL = useRef(false)

    // Read initial values from URL params
    const initialSearch = searchParams.get('query') || ''
    const initialLocation = searchParams.get('location') || ''
    const initialAgent = searchParams.get('agent') || ''
    const initialPropertyType = searchParams.get('property_type') || '' // Server-side filter
    const initialMessageType = searchParams.get('message_type') || '' // Server-side filter
    const initialBedrooms = searchParams.get('bedrooms') || ''
    const initialExactMatch = searchParams.get('exactMatch') === 'true'
    const leadId = searchParams.get('lead_id') || ''

    // Batch fetcher function for chunked pagination
    const fetchBatch = useCallback(async (
        offset: number,
        limit: number,
        query?: string,
        propertyType?: string,
        messageType?: string
    ): Promise<{ data: WhatsAppListing[], count: number }> => {
        const response = await searchWhatsAppListingsByMessage(
            query || '',
            limit,
            offset,
            propertyType,
            messageType
        )
        return {
            data: response.data,
            count: response.count
        }
    }, [])

    // Chunked pagination - fetches 1000 records, shows 200 per page
    const {
        currentPageListings: rawListings,
        isLoading,
        error,
        isLoadingNextBatch,
        hasNext,
        hasPrevious,
        startIndex,
        endIndex,
        goToNext,
        goToPrevious,
        goToPage,
        reset: resetListings
    } = useChunkedPagination({
        fetchBatch,
        initialQuery: initialSearch,
        initialPropertyType: initialPropertyType,
        initialMessageType: initialMessageType
    })

    // Filtering logic - initialize from URL
    const {
        filters,
        setLocation,
        setAgent,
        setProperty,
        setBedroomCount,
        setTransactionType,
        setExactMatch,
        resetFilters,
        applyFilters,
        hasActiveFilters
    } = useListingsFilters()

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0
        if (initialPropertyType && initialPropertyType !== 'all') count++
        if (initialMessageType && initialMessageType !== 'all') count++
        if (filters.location?.trim()) count++
        if (filters.agent?.trim()) count++
        if (filters.bedroomCount && filters.bedroomCount !== 'all') count++
        return count
    }, [initialPropertyType, initialMessageType, filters.location, filters.agent, filters.bedroomCount])

    // Update URL params when filters or search change
    const updateURLParams = useCallback((updates: {
        query?: string
        location?: string
        agent?: string
        property_type?: string
        message_type?: string
        bedrooms?: string
        exactMatch?: boolean
        lead_id?: string
    }) => {
        if (isUpdatingURL.current) return

        isUpdatingURL.current = true
        const params = new URLSearchParams(searchParams.toString())

        if (updates.query !== undefined) {
            if (updates.query) params.set('query', updates.query)
            else params.delete('query')
        }
        if (updates.location !== undefined) {
            if (updates.location) params.set('location', updates.location)
            else params.delete('location')
        }
        if (updates.agent !== undefined) {
            if (updates.agent) params.set('agent', updates.agent)
            else params.delete('agent')
        }
        if (updates.property_type !== undefined) {
            if (updates.property_type && updates.property_type !== 'all') params.set('property_type', updates.property_type)
            else params.delete('property_type')
        }
        if (updates.message_type !== undefined) {
            if (updates.message_type && updates.message_type !== 'all') params.set('message_type', updates.message_type)
            else params.delete('message_type')
        }
        if (updates.bedrooms !== undefined) {
            if (updates.bedrooms && updates.bedrooms !== 'all') params.set('bedrooms', updates.bedrooms)
            else params.delete('bedrooms')
        }
        if (updates.exactMatch !== undefined) {
            if (updates.exactMatch) params.set('exactMatch', 'true')
            else params.delete('exactMatch')
        }
        if (updates.lead_id !== undefined) {
            if (updates.lead_id) params.set('lead_id', updates.lead_id)
            else params.delete('lead_id')
        }

        const newURL = params.toString() ? `?${params.toString()}` : ''
        router.replace(newURL, { scroll: false })
        setTimeout(() => {
            isUpdatingURL.current = false
        }, 100)
    }, [router, searchParams])

    // Initialize filters from URL on mount (only once)
    const hasInitialized = useRef(false)
    useEffect(() => {
        if (!hasInitialized.current) {
            // Initialize client-side filters from URL params (property_type and message_type are server-side, handled separately)
            if (initialLocation) setLocation(initialLocation)
            if (initialAgent) setAgent(initialAgent)
            if (initialBedrooms) setBedroomCount(initialBedrooms)
            if (initialExactMatch) setExactMatch(true)
            hasInitialized.current = true
        }
    }, []) // Only run on mount - filters are already in URL, don't update again

    // Convert listings format
    const { convertListings } = useListingConverter()

    // Apply filters to raw listings
    const filteredListings = useMemo(() => {
        return applyFilters(rawListings)
    }, [rawListings, applyFilters])

    // Convert to CREA format
    const convertedListings = useMemo(() => {
        return convertListings(filteredListings)
    }, [filteredListings, convertListings])

    // Handle search - update URL params and trigger reset
    const handleSearch = useCallback(async (query: string, propertyType?: string, messageType?: string) => {
        goToPage(1) // Reset to first page
        updateURLParams({
            query: query,
            property_type: propertyType,
            message_type: messageType
        })
        await resetListings(query, propertyType, messageType)
    }, [goToPage, resetListings, updateURLParams])

    // Handle filter changes (reset to first page when filters change and update URL)
    const handleLocationFilter = useCallback((location: string) => {
        setLocation(location)
        updateURLParams({ location })
        goToPage(1)
    }, [setLocation, updateURLParams, goToPage])

    const handleAgentFilter = useCallback((agent: string) => {
        setAgent(agent)
        updateURLParams({ agent })
        goToPage(1)
    }, [setAgent, updateURLParams, goToPage])

    const handleBedroomCountFilter = useCallback((bedroomCount: string) => {
        setBedroomCount(bedroomCount)
        updateURLParams({ bedrooms: bedroomCount })
        goToPage(1)
    }, [setBedroomCount, updateURLParams, goToPage])

    const handleExactMatchToggle = useCallback((exact: boolean) => {
        setExactMatch(exact)
        updateURLParams({ exactMatch: exact })
        goToPage(1)
    }, [setExactMatch, updateURLParams, goToPage])

    const handleResetFilters = useCallback(async () => {
        resetFilters()
        updateURLParams({
            location: '',
            agent: '',
            bedrooms: '',
            exactMatch: false,
            property_type: '',
            message_type: ''
        })
        goToPage(1)
        // Also reset server-side filters by triggering a new search
        await resetListings('', '', '')
    }, [resetFilters, updateURLParams, goToPage, resetListings])

    const backgroundImage = BACKGROUND_IMAGES[0]

    return (
        <div
            className="min-h-screen bg-[#1a1a1a] py-4 relative"
            style={{
                backgroundImage: `url('${backgroundImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}
        >
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/80 z-0" />

            <div className="max-w-7xl mx-auto px-4 relative z-10 min-h-[calc(100vh-2rem)] h-auto md:h-[calc(100vh-2rem)] flex flex-col">
                {/* Page Header */}
                {/* <div className="mb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 pt-8">
                        <span className="text-white">WhatsApp</span> <span className="text-[#E6D3AF]">Listings</span>
                    </h1>
                    <p className="text-gray-200 text-lg">
                        Browse property listings from WhatsApp messages
                    </p>
                </div> */}


                {/* Error state */}
                {error && (
                    <Card className="bg-red-50/95 backdrop-blur-xl shadow-lg border border-red-200/20 p-6 mb-6">
                        <div className="text-center py-4">
                            <p className="text-red-700 font-semibold">{error}</p>
                            <button
                                onClick={() => {
                                    if (error) {
                                        resetListings(initialSearch, initialPropertyType || undefined, initialMessageType || undefined)
                                    }
                                }}
                                className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    </Card>
                )}

                {/* Combined Search and Table Card */}
                <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 mb-6 flex-1 flex flex-col min-h-0">
                    <div className="p-4 pb-0 flex-shrink-0">
                        {/* Table Title and Search Bar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                            <h2 className="text-xl font-semibold text-slate-800">
                                {initialSearch ? (
                                    `Search: "${initialSearch}"`
                                ) : (
                                    <div className="relative h-10 w-48 md:h-12 md:w-64">
                                        <Image
                                            src="/propalyst-mls-logo.png"
                                            alt="Propalyst MLS"
                                            fill
                                            className="object-contain object-left"
                                            priority
                                        />
                                    </div>
                                )}
                            </h2>
                            <div className="w-full md:w-auto">
                                <SearchBar
                                    onSearch={(query) => handleSearch(query, initialPropertyType || undefined, initialMessageType || undefined)}
                                    isLoading={isLoading}
                                    initialValue={initialSearch}
                                    activeFilterCount={activeFilterCount}
                                    onResetFilters={handleResetFilters}
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="pb-4">
                            <SearchInput
                                onSearch={handleSearch}
                                isLoading={isLoading}
                                initialValue={initialSearch}
                                initialPropertyType={initialPropertyType}
                                initialMessageType={initialMessageType}
                                onLocationFilter={handleLocationFilter}
                                locationFilter={filters.location}
                                onAgentFilter={handleAgentFilter}
                                agentFilter={filters.agent}
                                onBedroomCountFilter={handleBedroomCountFilter}
                                bedroomCountFilter={filters.bedroomCount}
                                initialLocation={initialLocation}
                                initialAgent={initialAgent}
                                initialBedrooms={initialBedrooms}
                                onResetFilters={handleResetFilters}
                            />
                        </div>
                    </div>

                    <div className="px-4 pb-4 flex-1 flex flex-col min-h-0 md:overflow-hidden">
                        {/* Loading state */}
                        {isLoading && (
                            <div className="text-center py-12 flex-shrink-0">
                                <div className="text-gray-400 text-5xl mb-4 animate-pulse">🏠</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    Loading listings...
                                </h3>
                                {isLoadingNextBatch && (
                                    <p className="text-sm text-gray-500">Loading more results in the background...</p>
                                )}
                            </div>
                        )}

                        {/* Listings Table */}
                        {!isLoading && (
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <CREAListingsTable
                                    listings={convertedListings}
                                    onLocationFilter={handleLocationFilter}
                                    locationFilter={filters.location}
                                    onAgentFilter={handleAgentFilter}
                                    agentFilter={filters.agent}
                                    onBedroomCountFilter={handleBedroomCountFilter}
                                    bedroomCountFilter={filters.bedroomCount}
                                    exactMatch={filters.exactMatch}
                                    onExactMatchToggle={handleExactMatchToggle}
                                    onResetFilters={handleResetFilters}
                                    // Pagination props
                                    onPrevious={goToPrevious}
                                    onNext={goToNext}
                                    hasPrevious={hasPrevious}
                                    hasNext={hasNext}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                    totalCount={0} // Don't show "of X" since total count is unknown
                                />
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
