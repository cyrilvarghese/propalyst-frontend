/**
 * ListingsContent - Client Component
 * ===================================
 *
 * Client component that handles WhatsApp listings search with server-side pagination.
 */

'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { fetchWhatsAppListings, searchWhatsAppListings, searchWhatsAppListingsByMessage, WhatsAppListing } from '@/lib/api/whatsapp-listings'
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

const ITEMS_PER_PAGE = 200

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

    // Server-side pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isSearchMode, setIsSearchMode] = useState(false)

    // Store full search results for pagination
    const [fullSearchResults, setFullSearchResults] = useState<WhatsAppListing[]>([])

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

    const convertedListings = listings.map(convertToCREAListing)

    // Initial load
    useEffect(() => {
        const loadListings = async () => {
            setIsLoading(true)
            try {
                const response = await fetchWhatsAppListings(ITEMS_PER_PAGE, 0)
                setListings(response.data)
                setTotalCount(response.count)
                setIsSearchMode(false)
            } catch (error) {
                console.error('Error loading listings:', error)
                setListings([])
                setTotalCount(0)
            } finally {
                setIsLoading(false)
                hasInitialized.current = true
            }
        }
        loadListings()
    }, [])

    // Handle filters
    const handleFilters = useCallback(async () => {
        // Reset to page 1 when filters change
        setCurrentPage(1)

        const hasFilters = agentFilter.trim().length > 0 ||
            propertyFilter.trim().length > 0 ||
            locationFilter.trim().length > 0 ||
            transactionTypeFilter.trim().length > 0

        if (hasFilters) {
            setIsLoading(true)
            try {
                // Use message_type directly from filter
                const messageType = transactionTypeFilter.trim() || undefined

                const response = await searchWhatsAppListings({
                    agent_name: agentFilter.trim() || undefined,
                    property_query: propertyFilter.trim() || undefined,
                    location: locationFilter.trim() || undefined,
                    message_type: messageType,
                    limit: ITEMS_PER_PAGE, // Fetch large number for client-side pagination
                    similarity_threshold: exactMatch ? 1.0 : 0.3,
                })

                // For search results, paginate client-side (page 1)
                const startIndex = 0
                const endIndex = ITEMS_PER_PAGE
                const paginatedResults = response.data.slice(startIndex, endIndex)

                setListings(paginatedResults)
                setTotalCount(response.count)
                setIsSearchMode(true)
            } catch (error) {
                console.error('Error filtering listings:', error)
                setListings([])
                setTotalCount(0)
            } finally {
                setIsLoading(false)
            }
        } else {
            // No filters, load all listings with server-side pagination (page 1)
            setIsLoading(true)
            try {
                const response = await fetchWhatsAppListings(ITEMS_PER_PAGE, 0)
                setListings(response.data)
                setTotalCount(response.count)
                setIsSearchMode(false)
            } catch (error) {
                console.error('Error loading listings:', error)
                setListings([])
                setTotalCount(0)
            } finally {
                setIsLoading(false)
            }
        }
    }, [agentFilter, propertyFilter, locationFilter, transactionTypeFilter, exactMatch])

    // Handle search - use useCallback to prevent unnecessary re-renders
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page on new search

        startTransition(async () => {
            setIsLoading(true)
            try {
                if (query.trim().length > 0) {
                    // Use message search API
                    const response = await searchWhatsAppListingsByMessage(query.trim(), ITEMS_PER_PAGE)

                    // Store full results for pagination
                    setFullSearchResults(response.data)

                    // Client-side pagination for search results (page 1)
                    const startIndex = 0
                    const endIndex = ITEMS_PER_PAGE
                    const paginatedResults = response.data.slice(startIndex, endIndex)

                    setListings(paginatedResults)
                    setTotalCount(response.count)
                    setIsSearchMode(true)
                } else {
                    // Clear search results when query is empty
                    setFullSearchResults([])
                    // If query is empty, check if any filters are active
                    handleFilters()
                }
            } catch (error) {
                console.error('Error searching listings:', error)
                setListings([])
                setTotalCount(0)
                setIsSearchMode(false)
            } finally {
                setIsLoading(false)
            }
        })
    }, [handleFilters])

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

    // Handle pagination - server-side
    const handlePageChange = useCallback(async (page: number) => {
        setIsLoading(true)
        try {
            const offset = (page - 1) * ITEMS_PER_PAGE

            // Check if we're in search mode (search query active)
            const hasSearchQuery = searchQuery.trim().length > 0

            // Check if we have column filters active
            const hasFilters = agentFilter.trim().length > 0 ||
                propertyFilter.trim().length > 0 ||
                locationFilter.trim().length > 0 ||
                transactionTypeFilter.trim().length > 0

            if (hasSearchQuery) {
                // For message search, use stored results if available, otherwise fetch
                let results = fullSearchResults
                if (results.length === 0 || offset === 0) {
                    // Fetch if not already stored or if going back to page 1
                    const response = await searchWhatsAppListingsByMessage(searchQuery.trim(), 10000)
                    results = response.data
                    setFullSearchResults(results)
                    setTotalCount(response.count)
                }

                // Client-side pagination for search results
                const startIndex = offset
                const endIndex = offset + ITEMS_PER_PAGE
                const paginatedResults = results.slice(startIndex, endIndex)

                setListings(paginatedResults)
            } else if (hasFilters) {
                // For search with filters, fetch all matching results
                // Note: Search API doesn't support offset, so we fetch all and paginate client-side
                const messageType = transactionTypeFilter.trim() || undefined

                const response = await searchWhatsAppListings({
                    agent_name: agentFilter.trim() || undefined,
                    property_query: propertyFilter.trim() || undefined,
                    location: locationFilter.trim() || undefined,
                    message_type: messageType,
                    limit: 10000, // Fetch large number for client-side pagination
                    similarity_threshold: exactMatch ? 1.0 : 0.3,
                })

                // Client-side pagination for search results
                const startIndex = offset
                const endIndex = offset + ITEMS_PER_PAGE
                const paginatedResults = response.data.slice(startIndex, endIndex)

                setListings(paginatedResults)
                setTotalCount(response.count)
            } else {
                // Load all listings with server-side pagination (limit/offset)
                const response = await fetchWhatsAppListings(ITEMS_PER_PAGE, offset)
                setListings(response.data)
                setTotalCount(response.count)
            }
        } catch (error) {
            console.error('Error loading page:', error)
            setListings([])
            setTotalCount(0)
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery, agentFilter, propertyFilter, locationFilter, transactionTypeFilter, exactMatch])

    // Effect to handle filter changes with debounce
    useEffect(() => {
        // Skip on initial mount
        if (!hasInitialized.current) {
            return
        }

        const timer = setTimeout(() => {
            handleFilters()
        }, 500)

        return () => clearTimeout(timer)
    }, [agentFilter, propertyFilter, locationFilter, transactionTypeFilter, exactMatch, handleFilters])

    // Effect to handle page changes
    useEffect(() => {
        if (!hasInitialized.current) {
            return
        }

        handlePageChange(currentPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage])

    const backgroundImage = BACKGROUND_IMAGES[0]
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

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
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                )}
            </div>
        </div>
    )
}

