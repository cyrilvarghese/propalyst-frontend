/**
 * ListingsContent - Client Component
 * ===================================
 *
 * Client component that handles WhatsApp listings search with server-side pagination.
 */

'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { fetchWhatsAppListings, searchWhatsAppListings, searchWhatsAppListingsByMessage, WhatsAppListing, WhatsAppListingsResponse } from '@/lib/api/whatsapp-listings'
import CREAListingsTable from '../../whatsapp-search/components/CREAListingsTable'
import SearchInput from '../../whatsapp-search/components/SearchInput'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

/**
 * PAGINATION CONFIGURATION
 * ========================
 * 
 * PAGE_SIZE: Number of records displayed per page in the UI
 * - Controls how many listings are shown on each page
 * - Used for client-side pagination of fetched data
 * 
 * MAX_RESULTS_PER_API_CALL: Maximum number of records fetched per API request
 * - Controls batch size when calling the API
 * - Larger batch = fewer API calls, but more data per request
 * - Used for server-side data fetching
 * 
 * PREFETCHING STRATEGY:
 * - Fetch MAX_RESULTS_PER_API_CALL records at a time
 * - Display PAGE_SIZE records per page
 * - When user navigates to the second-to-last page of current batch, prefetch next batch
 * - Example: PAGE_SIZE=200, MAX_RESULTS=600 means 3 pages per batch
 *   - Pages 1-3: Use first 600 records
 *   - On page 2, prefetch records 600-1200
 *   - Pages 4-6: Use records 600-1200
 *   - And so on...
 */
const PAGE_SIZE = 200 // Records displayed per page
const MAX_RESULTS_PER_API_CALL = 600 // Records fetched per API call

export default function ListingsContent() {
    const [listings, setListings] = useState<WhatsAppListing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [locationFilter, setLocationFilter] = useState('')
    const [agentFilter, setAgentFilter] = useState('')
    const [propertyFilter, setPropertyFilter] = useState('')
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('')
    const [exactMatch, setExactMatch] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isSearchMode, setIsSearchMode] = useState(false)

    // Prefetched results storage
    // Stores all fetched results locally for pagination
    const [localResults, setLocalResults] = useState<WhatsAppListing[]>([])
    const [unfilteredResults, setUnfilteredResults] = useState<WhatsAppListing[]>([]) // Original unfiltered results
    const [currentBatchStart, setCurrentBatchStart] = useState(0) // Starting index of current batch
    const [isPrefetching, setIsPrefetching] = useState(false)
    const prefetchControllerRef = useRef<AbortController | null>(null)

    const hasInitialized = useRef(false)

    // Convert WhatsAppListing to CREAListing format for the table component
    const convertToCREAListing = useCallback((listing: WhatsAppListing): any => {
        return {
            id: listing.id,
            created_at: listing.created_at,
            message_date: listing.message_date,
            agent_name: listing.agent_name || '',
            agent_contact: listing.agent_contact,
            company_name: listing.company_name,
            listing_type: listing.message_type,
            transaction_type: listing.message_type,
            property_type: listing.property_type || '',
            configuration: listing.bedroom_count ? `${listing.bedroom_count}BHK` : null,
            size_sqft: listing.area_sqft || 0,
            price: listing.price || 0,
            price_text: listing.price_text || '',
            location: listing.location || '',
            project_name: listing.project_name,
            facing: listing.facing_direction,
            floor: null,
            furnishing: listing.furnishing_status,
            parking: listing.parking_text || (listing.parking_count ? `${listing.parking_count} parking` : null),
            status: null,
            amenities: listing.special_features?.join(', ') || null,
            raw_message: listing.raw_message,
        }
    }, [])

    /**
     * Apply local filters to results (client-side filtering)
     * Filters the provided results based on active filter states
     */
    const applyLocalFilters = useCallback((
        results: WhatsAppListing[],
        filters: {
            location?: string
            agent?: string
            property?: string
            transactionType?: string
            exactMatch?: boolean
        }
    ): WhatsAppListing[] => {
        let filtered = [...results]

        // Filter by location
        if (filters.location && filters.location.trim().length > 0) {
            const locationLower = filters.location.trim().toLowerCase()
            filtered = filtered.filter(listing => {
                const listingLocation = (listing.location || '').toLowerCase()
                if (filters.exactMatch) {
                    return listingLocation === locationLower
                }
                return listingLocation.includes(locationLower)
            })
        }

        // Filter by agent name
        if (filters.agent && filters.agent.trim().length > 0) {
            const agentLower = filters.agent.trim().toLowerCase()
            filtered = filtered.filter(listing => {
                const agentName = (listing.agent_name || '').toLowerCase()
                const companyName = (listing.company_name || '').toLowerCase()
                if (filters.exactMatch) {
                    return agentName === agentLower || companyName === agentLower
                }
                return agentName.includes(agentLower) || companyName.includes(agentLower)
            })
        }

        // Filter by property type or project name
        if (filters.property && filters.property.trim().length > 0) {
            const propertyLower = filters.property.trim().toLowerCase()
            filtered = filtered.filter(listing => {
                const propertyType = (listing.property_type || '').toLowerCase()
                const projectName = (listing.project_name || '').toLowerCase()
                if (filters.exactMatch) {
                    return propertyType === propertyLower || projectName === propertyLower
                }
                return propertyType.includes(propertyLower) || projectName.includes(propertyLower)
            })
        }

        // Filter by transaction type (message_type)
        if (filters.transactionType && filters.transactionType.trim().length > 0) {
            filtered = filtered.filter(listing => {
                return listing.message_type === filters.transactionType
            })
        }

        return filtered
    }, [])

    /**
     * Get listings for current page from local results
     */
    const getCurrentPageListings = useCallback((page: number, results: WhatsAppListing[]): WhatsAppListing[] => {
        const startIndex = (page - 1) * PAGE_SIZE
        const endIndex = startIndex + PAGE_SIZE
        return results.slice(startIndex, endIndex)
    }, [])

    // Apply local filters to unfiltered results whenever filters or unfilteredResults change
    useEffect(() => {
        // Only apply filters if we're not in search mode (search uses its own filtering via API)
        if (!isSearchMode) {
            const filtered = applyLocalFilters(unfilteredResults, {
                location: locationFilter,
                agent: agentFilter,
                property: propertyFilter,
                transactionType: transactionTypeFilter,
                exactMatch: exactMatch
            })
            setLocalResults(filtered)
        }
    }, [
        unfilteredResults,
        locationFilter,
        agentFilter,
        propertyFilter,
        transactionTypeFilter,
        exactMatch,
        isSearchMode,
        applyLocalFilters
    ])

    // Get current page listings from local results
    const currentPageListings = getCurrentPageListings(currentPage, localResults)
    const convertedListings = currentPageListings.map(convertToCREAListing)

    // Use filtered count if filtering, otherwise use total count
    const displayTotalCount = isSearchMode ? totalCount : localResults.length

    /**
     * Calculate which batch a page belongs to
     * Each batch contains MAX_RESULTS_PER_API_CALL records, displayed as pages of PAGE_SIZE
     */
    const getBatchForPage = (page: number): number => {
        const recordsNeeded = (page - 1) * PAGE_SIZE
        return Math.floor(recordsNeeded / MAX_RESULTS_PER_API_CALL)
    }

    /**
     * Calculate the starting record index for a batch
     */
    const getBatchStartIndex = (batch: number): number => {
        return batch * MAX_RESULTS_PER_API_CALL
    }

    /**
     * Check if we need to prefetch the next batch
     * Prefetch when user is on the second-to-last page of current batch
     */
    const shouldPrefetchNextBatch = (page: number, localCount: number): boolean => {
        const currentBatch = getBatchForPage(page)
        const nextBatch = currentBatch + 1
        const nextBatchStart = getBatchStartIndex(nextBatch)

        // Check if we're on second-to-last page of current batch
        const pagesPerBatch = Math.floor(MAX_RESULTS_PER_API_CALL / PAGE_SIZE)
        const pageInBatch = ((page - 1) % pagesPerBatch) + 1

        // Prefetch if we're on second-to-last page and don't have next batch yet
        return pageInBatch >= pagesPerBatch - 1 && localCount <= nextBatchStart
    }

    /**
     * Prefetch next batch of results in the background
     */
    const prefetchNextBatch = useCallback(async (batchNumber: number, searchParams?: {
        query?: string
        filters?: {
            agent_name?: string
            property_query?: string
            location?: string
            message_type?: string
            exactMatch?: boolean
        }
    }) => {
        if (isPrefetching) return // Already prefetching

        setIsPrefetching(true)
        const abortController = new AbortController()
        prefetchControllerRef.current = abortController

        try {
            const offset = getBatchStartIndex(batchNumber)

            let response: WhatsAppListingsResponse

            if (searchParams?.query) {
                // Message search
                response = await searchWhatsAppListingsByMessage(
                    searchParams.query,
                    MAX_RESULTS_PER_API_CALL
                )
            } else if (searchParams?.filters) {
                // Column filter search
                const { agent_name, property_query, location, message_type, exactMatch } = searchParams.filters
                response = await searchWhatsAppListings({
                    agent_name,
                    property_query,
                    location,
                    message_type,
                    limit: MAX_RESULTS_PER_API_CALL,
                    similarity_threshold: exactMatch ? 1.0 : 0.3,
                })
            } else {
                // Regular listing fetch with offset
                response = await fetchWhatsAppListings(MAX_RESULTS_PER_API_CALL, offset)
            }

            if (!abortController.signal.aborted) {
                setUnfilteredResults(prev => {
                    // Avoid duplicates
                    const existingIds = new Set(prev.map((item: WhatsAppListing) => item.id))
                    const newItems = response.data.filter((item: WhatsAppListing) => !existingIds.has(item.id))
                    return [...prev, ...newItems]
                })
                // localResults will be updated by the filter effect
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error prefetching batch:', error)
            }
        } finally {
            if (!abortController.signal.aborted) {
                setIsPrefetching(false)
            }
        }
    }, [isPrefetching])

    // Initial load - NO API CALLS
    // Start empty, wait for user to search
    useEffect(() => {
        setIsLoading(false)
        setUnfilteredResults([])
        setLocalResults([])
        setTotalCount(0)
        setIsSearchMode(false)
        hasInitialized.current = true
    }, [])

    // Handle filters - LOCAL FILTERING ONLY (no API calls)
    // Filters are applied client-side to the already-loaded unfilteredResults
    const handleFilters = useCallback(() => {
        // Reset to page 1 when filters change
        setCurrentPage(1)

        // Filters are automatically applied via the applyLocalFilters function
        // No API calls needed - filtering happens locally on unfilteredResults
    }, [])

    // Handle search - use useCallback to prevent unnecessary re-renders
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page on new search
        setCurrentBatchStart(0)

        startTransition(async () => {
            setIsLoading(true)
            try {
                if (query.trim().length > 0) {
                    // Fetch first batch with message search API
                    const response = await searchWhatsAppListingsByMessage(
                        query.trim(),
                        MAX_RESULTS_PER_API_CALL
                    )

                    // Store results locally (unfiltered for search results)
                    setUnfilteredResults(response.data)
                    setLocalResults(response.data)
                    setTotalCount(response.count)
                    setIsSearchMode(true)

                    // Prefetch next batch if more results available
                    if (response.count > MAX_RESULTS_PER_API_CALL) {
                        prefetchNextBatch(1, { query: query.trim() })
                    }
                } else {
                    // Clear search - reload unfiltered results from initial load
                    // Reset to show all listings without search
                    setCurrentPage(1)
                    setIsSearchMode(false)
                }
            } catch (error) {
                console.error('Error searching listings:', error)
                setLocalResults([])
                setTotalCount(0)
                setIsSearchMode(false)
            } finally {
                setIsLoading(false)
            }
        })
    }, [handleFilters, prefetchNextBatch])

    // Handle filter changes
    const handleLocationFilter = useCallback((location: string) => {
        setLocationFilter(location)
        setCurrentPage(1)
    }, [])

    const handleAgentFilter = useCallback((agent: string) => {
        setAgentFilter(agent)
        setCurrentPage(1)
    }, [])

    const handlePropertyFilter = useCallback((property: string) => {
        setPropertyFilter(property)
        setCurrentPage(1)
    }, [])

    const handleTransactionTypeFilter = useCallback((type: string) => {
        setTransactionTypeFilter(type)
        setCurrentPage(1)
    }, [])

    const handleExactMatchToggle = useCallback((exact: boolean) => {
        setExactMatch(exact)
        setCurrentPage(1)
    }, [])

    const handleResetFilters = useCallback(() => {
        setLocationFilter('')
        setAgentFilter('')
        setPropertyFilter('')
        setTransactionTypeFilter('')
        setExactMatch(false)
        setCurrentPage(1)
    }, [])

    /**
     * Handle page changes with prefetching
     * - Displays data from localResults (filtered results)
     * - Prefetches next batch of unfilteredResults when approaching end of current batch
     */
    const handlePageChange = useCallback(async (page: number) => {
        // For pagination, we work with unfilteredResults for prefetching decisions
        // but display filteredResults (localResults)
        const recordsNeeded = page * PAGE_SIZE
        const currentBatch = getBatchForPage(page)

        // Check if we need more unfiltered data (for prefetching)
        // Use unfilteredResults.length for prefetching decisions, not localResults.length
        const needsMoreData = recordsNeeded > unfilteredResults.length && recordsNeeded <= totalCount

        if (needsMoreData && !isSearchMode) {
            // Need to fetch more unfiltered data
            setIsLoading(true)
            try {
                // Fetch next batch of unfiltered results
                await prefetchNextBatch(currentBatch)
            } catch (error) {
                console.error('Error fetching page data:', error)
            } finally {
                setIsLoading(false)
            }
        } else if (needsMoreData && isSearchMode) {
            // For search mode, fetch more search results
            setIsLoading(true)
            try {
                await prefetchNextBatch(currentBatch, { query: searchQuery.trim() })
            } catch (error) {
                console.error('Error fetching search page data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        // Check if we should prefetch next batch (when on second-to-last page of current batch)
        // Use unfilteredResults.length for prefetching threshold
        if (shouldPrefetchNextBatch(page, unfilteredResults.length) && !isPrefetching) {
            const nextBatch = currentBatch + 1

            // Prefetch in background
            if (isSearchMode && searchQuery.trim().length > 0) {
                prefetchNextBatch(nextBatch, { query: searchQuery.trim() })
            } else {
                // Prefetch more unfiltered results (filters will be applied locally)
                prefetchNextBatch(nextBatch)
            }
        }
    }, [
        unfilteredResults.length,
        totalCount,
        searchQuery,
        isSearchMode,
        prefetchNextBatch,
        isPrefetching
    ])

    // Filter changes are automatically handled by the useEffect that applies local filters
    // No debounce needed - filtering is instant and local

    // Effect to handle page changes
    useEffect(() => {
        if (!hasInitialized.current) {
            return
        }

        handlePageChange(currentPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage])

    const backgroundImage = BACKGROUND_IMAGES[0]
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

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
                <div className="mb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 pt-8">
                        <span className="text-white">WhatsApp</span> <span className="text-[#E6D3AF]">Listings</span>
                    </h1>
                    <p className="text-gray-200 text-lg">
                        Browse property listings from WhatsApp messages
                    </p>
                </div>
                <div className="mb-8">
                    <Link href="/search" className="text-white hover:text-[#E6D3AF] hover:underline inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Search
                    </Link>
                </div>

                {/* Search Input */}
                <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-4 mb-6">
                    <SearchInput onSearch={handleSearch} isLoading={isLoading || isPending} />
                </Card>

                {/* Loading state */}
                {isLoading && (
                    <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4 animate-pulse">🏠</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                {searchQuery ? 'Searching...' : 'Loading listings...'}
                            </h3>
                        </div>
                    </Card>
                )}

                {/* Listings Table */}
                {!isLoading && (
                    <CREAListingsTable
                        listings={convertedListings}
                        onLocationFilter={handleLocationFilter}
                        locationFilter={locationFilter}
                        onAgentFilter={handleAgentFilter}
                        agentFilter={agentFilter}
                        onPropertyFilter={handlePropertyFilter}
                        propertyFilter={propertyFilter}
                        onTransactionTypeFilter={handleTransactionTypeFilter}
                        transactionTypeFilter={transactionTypeFilter}
                        exactMatch={exactMatch}
                        onExactMatchToggle={handleExactMatchToggle}
                        onResetFilters={handleResetFilters}
                        // Server-side pagination props
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        onPageChange={(page: number) => {
                            setCurrentPage(page)
                        }}
                        itemsPerPage={PAGE_SIZE}
                    />
                )}
            </div>
        </div>
    )
}

