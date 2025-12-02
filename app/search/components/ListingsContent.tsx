/**
 * ListingsContent - Client Component
 * ===================================
 *
 * Main component for displaying WhatsApp listings with search, filters, and pagination.
 * Uses custom hooks for clean separation of concerns.
 */

'use client'

import { useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CREAListingsTable from '../../whatsapp-obs/components/CREAListingsTable'
import SearchInput from './SearchInput'
import { useWhatsAppListings } from '../hooks/useWhatsAppListings'
import { usePagination } from '../hooks/usePagination'
import { useListingsFilters } from '../hooks/useListingsFilters'
import { useListingConverter } from '../hooks/useListingConverter'

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

const PAGE_SIZE = 200 // Records per page

export default function ListingsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isUpdatingURL = useRef(false)

    // Read initial values from URL params
    const initialSearch = searchParams.get('query') || ''
    const initialLocation = searchParams.get('location') || ''
    const initialAgent = searchParams.get('agent') || ''
    const initialProperty = searchParams.get('property') || ''
    const initialBedrooms = searchParams.get('bedrooms') || ''
    const initialTransactionType = searchParams.get('transactionType') || ''
    const initialExactMatch = searchParams.get('exactMatch') === 'true'

    // API calls and data fetching
    const {
        listings: rawListings,
        totalCount,
        isLoading,
        error,
        offset,
        search,
        loadPage,
        reset: resetListings
    } = useWhatsAppListings({ pageSize: PAGE_SIZE, initialQuery: initialSearch })

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

    // Update URL params when filters or search change
    const updateURLParams = useCallback((updates: {
        query?: string
        location?: string
        agent?: string
        property?: string
        bedrooms?: string
        transactionType?: string
        exactMatch?: boolean
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
        if (updates.property !== undefined) {
            if (updates.property && updates.property !== 'all') params.set('property', updates.property)
            else params.delete('property')
        }
        if (updates.bedrooms !== undefined) {
            if (updates.bedrooms && updates.bedrooms !== 'all') params.set('bedrooms', updates.bedrooms)
            else params.delete('bedrooms')
        }
        if (updates.transactionType !== undefined) {
            if (updates.transactionType && updates.transactionType !== 'all') params.set('transactionType', updates.transactionType)
            else params.delete('transactionType')
        }
        if (updates.exactMatch !== undefined) {
            if (updates.exactMatch) params.set('exactMatch', 'true')
            else params.delete('exactMatch')
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
            // Initialize filters from URL params without triggering URL updates
            if (initialLocation) setLocation(initialLocation)
            if (initialAgent) setAgent(initialAgent)
            if (initialProperty) setProperty(initialProperty)
            if (initialBedrooms) setBedroomCount(initialBedrooms)
            if (initialTransactionType) setTransactionType(initialTransactionType)
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

    // Pagination logic - totalCount is optional since we don't always know the total
    // Always allow "Next" - API will return empty results if there are no more pages
    const pagination = usePagination({
        pageSize: PAGE_SIZE,
        totalCount: undefined, // Don't rely on totalCount
        initialOffset: 0
    })

    // Sync pagination offset with API calls
    useEffect(() => {
        if (pagination.offset !== offset) {
            loadPage(pagination.offset)
        }
    }, [pagination.offset, offset, loadPage])

    // Initial load - use URL param if exists, otherwise empty
    useEffect(() => {
        if (initialSearch) {
            search(initialSearch)
        } else {
            search('')
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Handle search - update URL param
    const handleSearch = useCallback(async (query: string) => {
        pagination.goToPage(1) // Reset to first page
        updateURLParams({ query: query })
        await search(query)
    }, [pagination, search, updateURLParams])

    // Handle pagination navigation
    const handleNext = async () => {
        pagination.goToNext()
    }

    const handlePrevious = async () => {
        pagination.goToPrevious()
    }

    // Handle filter changes (reset to first page when filters change and update URL)
    const handleLocationFilter = useCallback((location: string) => {
        setLocation(location)
        updateURLParams({ location })
        pagination.goToPage(1)
    }, [setLocation, updateURLParams, pagination])

    const handleAgentFilter = useCallback((agent: string) => {
        setAgent(agent)
        updateURLParams({ agent })
        pagination.goToPage(1)
    }, [setAgent, updateURLParams, pagination])

    const handlePropertyFilter = useCallback((property: string) => {
        setProperty(property)
        updateURLParams({ property })
        pagination.goToPage(1)
    }, [setProperty, updateURLParams, pagination])

    const handleBedroomCountFilter = useCallback((bedroomCount: string) => {
        setBedroomCount(bedroomCount)
        updateURLParams({ bedrooms: bedroomCount })
        pagination.goToPage(1)
    }, [setBedroomCount, updateURLParams, pagination])

    const handleTransactionTypeFilter = useCallback((type: string) => {
        setTransactionType(type)
        updateURLParams({ transactionType: type })
        pagination.goToPage(1)
    }, [setTransactionType, updateURLParams, pagination])

    const handleExactMatchToggle = useCallback((exact: boolean) => {
        setExactMatch(exact)
        updateURLParams({ exactMatch: exact })
        pagination.goToPage(1)
    }, [setExactMatch, updateURLParams, pagination])

    const handleResetFilters = useCallback(() => {
        resetFilters()
        updateURLParams({
            location: '',
            agent: '',
            property: '',
            bedrooms: '',
            transactionType: '',
            exactMatch: false
        })
        pagination.goToPage(1)
    }, [resetFilters, updateURLParams, pagination])

    const backgroundImage = BACKGROUND_IMAGES[0]

    return (
        <div
            className="min-h-screen bg-[#1a1a1a] py-8 relative"
            style={{
                backgroundImage: `url('${backgroundImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}
        >
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/80 z-0" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Page Header */}
                {/* <div className="mb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 pt-8">
                        <span className="text-white">WhatsApp</span> <span className="text-[#E6D3AF]">Listings</span>
                    </h1>
                    <p className="text-gray-200 text-lg">
                        Browse property listings from WhatsApp messages
                    </p>
                </div> */}

                <div className="mb-8 flex flex-row items-center justify-start">
                    <Link href="/search-web" className="text-blue-500    hover:text-blue-600 hover:underline inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Web Search |
                    </Link>
                    <p className="text-gray-200 text-lg ml-2">
                        Browse property listings from WhatsApp messages
                    </p>

                </div>

                {/* Search Input */}
                <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-4 mb-6">
                    <SearchInput
                        onSearch={handleSearch}
                        isLoading={isLoading}
                        initialValue={initialSearch}
                    />
                </Card>

                {/* Error state */}
                {error && (
                    <Card className="bg-red-50/95 backdrop-blur-xl shadow-lg border border-red-200/20 p-6 mb-6">
                        <div className="text-center py-4">
                            <p className="text-red-700 font-semibold">{error}</p>
                            <button
                                onClick={() => {
                                    if (error) {
                                        search('')
                                    }
                                }}
                                className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    </Card>
                )}

                {/* Loading state */}
                {isLoading && (
                    <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4 animate-pulse">🏠</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Loading listings...
                            </h3>
                        </div>
                    </Card>
                )}

                {/* Listings Table */}
                {!isLoading && (
                    <CREAListingsTable
                        listings={convertedListings}
                        onLocationFilter={handleLocationFilter}
                        locationFilter={filters.location}
                        onAgentFilter={handleAgentFilter}
                        agentFilter={filters.agent}
                        onPropertyFilter={handlePropertyFilter}
                        propertyFilter={filters.property}
                        onBedroomCountFilter={handleBedroomCountFilter}
                        bedroomCountFilter={filters.bedroomCount}
                        onTransactionTypeFilter={handleTransactionTypeFilter}
                        transactionTypeFilter={filters.transactionType}
                        exactMatch={filters.exactMatch}
                        onExactMatchToggle={handleExactMatchToggle}
                        onResetFilters={handleResetFilters}
                        // Pagination props
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        hasPrevious={pagination.hasPrevious}
                        hasNext={pagination.hasNext}
                        startIndex={pagination.startIndex}
                        endIndex={pagination.startIndex + filteredListings.length}
                        totalCount={0} // Don't show "of X" since total count is unknown
                    />
                )}
            </div>
        </div>
    )
}
