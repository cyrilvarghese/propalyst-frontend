/**
 * ListingsContent - Client Component
 * ===================================
 *
 * Client component that handles WhatsApp listings search with server-side pagination.
 */

'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { searchWhatsAppListingsByMessage, WhatsAppListing, WhatsAppListingsResponse } from '@/lib/api/whatsapp-listings'
import CREAListingsTable from '../../whatsapp-search/components/CREAListingsTable'
import SearchInput from './SearchInput'
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
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [locationFilter, setLocationFilter] = useState('')
    const [agentFilter, setAgentFilter] = useState('')
    const [propertyFilter, setPropertyFilter] = useState('')
    const [bedroomCountFilter, setBedroomCountFilter] = useState('')
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('')
    const [exactMatch, setExactMatch] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    // Prefetched results storage
    // Stores all fetched results locally for pagination
    const [localResults, setLocalResults] = useState<WhatsAppListing[]>([])
    const [unfilteredResults, setUnfilteredResults] = useState<WhatsAppListing[]>([]) // Original unfiltered results
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
            bedroomCount?: string
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

        // Filter by property type (exact match from dropdown)
        if (filters.property && filters.property.trim().length > 0) {
            filtered = filtered.filter(listing => {
                return listing.property_type === filters.property
            })
        }

        // Filter by bedroom count
        if (filters.bedroomCount && filters.bedroomCount.trim().length > 0) {
            const bedroomCount = parseInt(filters.bedroomCount)
            filtered = filtered.filter(listing => {
                if (!listing.bedroom_count) return false
                // For "6+", show 6 or more bedrooms
                if (bedroomCount === 6) {
                    return listing.bedroom_count >= 6
                }
                return listing.bedroom_count === bedroomCount
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
        const filtered = applyLocalFilters(unfilteredResults, {
            location: locationFilter,
            agent: agentFilter,
            property: propertyFilter,
            bedroomCount: bedroomCountFilter,
            transactionType: transactionTypeFilter,
            exactMatch: exactMatch
        })
        setLocalResults(filtered)
    }, [
        unfilteredResults,
        locationFilter,
        agentFilter,
        propertyFilter,
        bedroomCountFilter,
        transactionTypeFilter,
        exactMatch,
        applyLocalFilters
    ])

    // Get current page listings from local results
    const currentPageListings = getCurrentPageListings(currentPage, localResults)
    const convertedListings = currentPageListings.map(convertToCREAListing)

    // Use filtered count for display
    const displayTotalCount = localResults.length

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
     * Always uses /search/message API with current search query
     */
    const prefetchNextBatch = useCallback(async (query: string = '') => {
        if (isPrefetching) return // Already prefetching

        setIsPrefetching(true)
        const abortController = new AbortController()
        prefetchControllerRef.current = abortController

        try {
            // Always use /search/message API with current query (can be empty)
            const response = await searchWhatsAppListingsByMessage(
                query,
                MAX_RESULTS_PER_API_CALL
            )

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

    // Initial load - call /search/message with empty query
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true)
            try {
                const response = await searchWhatsAppListingsByMessage('', MAX_RESULTS_PER_API_CALL)
                setUnfilteredResults(response.data)
                setTotalCount(response.count)

                // Prefetch next batch if more results available
                if (response.count > MAX_RESULTS_PER_API_CALL) {
                    prefetchNextBatch('')
                }
            } catch (error) {
                console.error('Error loading initial listings:', error)
                setUnfilteredResults([])
                setTotalCount(0)
            } finally {
                setIsLoading(false)
                hasInitialized.current = true
            }
        }
        loadInitialData()
    }, [prefetchNextBatch])

    // Filters are applied locally via useEffect - no separate handler needed

    // Handle search - always uses /search/message API
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page on new search

        startTransition(async () => {
            setIsLoading(true)
            try {
                // Always call /search/message API with query (can be empty)
                const response = await searchWhatsAppListingsByMessage(
                    query.trim(),
                    MAX_RESULTS_PER_API_CALL
                )

                // Store results locally
                setUnfilteredResults(response.data)
                setTotalCount(response.count)

                // Prefetch next batch if more results available
                if (response.count > MAX_RESULTS_PER_API_CALL) {
                    prefetchNextBatch(query.trim())
                }
            } catch (error) {
                console.error('Error searching listings:', error)
                setUnfilteredResults([])
                setTotalCount(0)
            } finally {
                setIsLoading(false)
            }
        })
    }, [prefetchNextBatch])

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

    const handleBedroomCountFilter = useCallback((bedroomCount: string) => {
        setBedroomCountFilter(bedroomCount)
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
        setBedroomCountFilter('')
        setTransactionTypeFilter('')
        setExactMatch(false)
        setCurrentPage(1)
    }, [])

    /**
     * Handle page changes - pagination is local-only, fetches more data when needed
     * - Navigation through pages uses localResults only (no API calls)
     * - When clicking Next on last available page, fetch next batch
     * - Prefetching happens in background when approaching end of current batch
     */
    const handlePageChange = useCallback(async (page: number) => {
        const currentTotalPages = Math.ceil(displayTotalCount / PAGE_SIZE)
        const isLastPage = page >= currentTotalPages
        const hasMoreData = totalCount > unfilteredResults.length

        // If clicking Next on last page and more data is available, fetch it
        if (isLastPage && hasMoreData && !isPrefetching) {
            setIsLoading(true)
            try {
                await prefetchNextBatch(searchQuery.trim())
                // After fetching, navigate to next page
                setCurrentPage(page)
            } catch (error) {
                console.error('Error fetching more data:', error)
            } finally {
                setIsLoading(false)
            }
        } else {
            // Normal navigation - just update page
            setCurrentPage(page)
        }

        // Check if we should prefetch next batch (when on second-to-last page of current batch)
        if (shouldPrefetchNextBatch(page, unfilteredResults.length) && !isPrefetching) {
            // Prefetch in background using current search query
            prefetchNextBatch(searchQuery.trim())
        }
    }, [
        displayTotalCount,
        unfilteredResults.length,
        totalCount,
        searchQuery,
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
    const totalPages = Math.ceil(displayTotalCount / PAGE_SIZE)

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
                        onBedroomCountFilter={handleBedroomCountFilter}
                        bedroomCountFilter={bedroomCountFilter}
                        onTransactionTypeFilter={handleTransactionTypeFilter}
                        transactionTypeFilter={transactionTypeFilter}
                        exactMatch={exactMatch}
                        onExactMatchToggle={handleExactMatchToggle}
                        onResetFilters={handleResetFilters}
                        // Server-side pagination props
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={displayTotalCount}
                        onPageChange={handlePageChange}
                        itemsPerPage={PAGE_SIZE}
                    />
                )}
            </div>
        </div>
    )
}

