/**
 * SearchContainer - State Manager
 * ================================
 *
 * Manages the landing vs results view transition.
 * Handles URL params, search state, filters, and pagination.
 * Reuses existing hooks from /app/search/hooks/
 */

'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchLanding from './SearchLanding'
import SearchResults from './SearchResults'
import { searchWhatsAppListingsByMessage, WhatsAppListing, RBProperty } from '@/lib/api/whatsapp-listings'

// Page sizes
const PAGE_SIZE = 20
const BATCH_SIZE = 1000

interface Filters {
    location: string
    agent: string
    bedroomCount: string
    minPrice: string
    maxPrice: string
    propertyType: string
    messageType: string
}

export default function SearchContainer() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isUpdatingURL = useRef(false)

    // Read initial values from URL
    const initialQuery = searchParams.get('query') || ''
    const initialPropertyType = searchParams.get('property_type') || ''
    const initialMessageType = searchParams.get('message_type') || ''
    const initialLocation = searchParams.get('location') || ''
    const initialAgent = searchParams.get('agent') || ''
    const initialBedrooms = searchParams.get('bedrooms') || ''
    const initialMinPrice = searchParams.get('min_price') || ''
    const initialMaxPrice = searchParams.get('max_price') || ''

    // Determine if we should show results based on URL params
    const hasSearchParams = !!(initialQuery || initialPropertyType || initialMessageType)

    // State
    const [showResults, setShowResults] = useState(hasSearchParams)
    const [query, setQuery] = useState(initialQuery)
    const [listings, setListings] = useState<WhatsAppListing[]>([])
    const [rbProperties, setRbProperties] = useState<RBProperty[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [activeTab, setActiveTab] = useState<'all' | 'verified'>('all')

    // Filters state
    const [filters, setFilters] = useState<Filters>({
        location: initialLocation,
        agent: initialAgent,
        bedroomCount: initialBedrooms,
        minPrice: initialMinPrice,
        maxPrice: initialMaxPrice,
        propertyType: initialPropertyType,
        messageType: initialMessageType
    })

    // Update URL params
    const updateURLParams = useCallback((updates: Partial<{
        query: string
        property_type: string
        message_type: string
        location: string
        agent: string
        bedrooms: string
        min_price: string
        max_price: string
    }>) => {
        if (isUpdatingURL.current) return
        isUpdatingURL.current = true

        const params = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        const newURL = params.toString() ? `?${params.toString()}` : '/search'
        router.replace(newURL, { scroll: false })

        setTimeout(() => {
            isUpdatingURL.current = false
        }, 100)
    }, [router, searchParams])

    // Fetch search results
    const fetchResults = useCallback(async (
        searchQuery: string,
        propertyType?: string,
        messageType?: string
    ) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await searchWhatsAppListingsByMessage(
                searchQuery,
                BATCH_SIZE,
                0,
                propertyType,
                messageType
            )

            setListings(response.whatsapp_listings)
            setRbProperties(response.rb_properties)
            setTotalCount(response.total_count)
            setCurrentPage(1)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch results')
            console.error('Search error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Handle search from landing page
    const handleSearch = useCallback((searchQuery: string) => {
        setQuery(searchQuery)
        setShowResults(true)
        updateURLParams({ query: searchQuery })
        fetchResults(searchQuery, filters.propertyType, filters.messageType)
    }, [filters.propertyType, filters.messageType, fetchResults, updateURLParams])

    // Handle browse all
    const handleBrowseAll = useCallback(() => {
        setQuery('')
        setFilters({
            location: '',
            agent: '',
            bedroomCount: '',
            minPrice: '',
            maxPrice: '',
            propertyType: '',
            messageType: ''
        })
        setShowResults(true)
        updateURLParams({
            query: '',
            property_type: '',
            message_type: '',
            location: '',
            agent: '',
            bedrooms: '',
            min_price: '',
            max_price: ''
        })
        fetchResults('', '', '')
    }, [fetchResults, updateURLParams])

    // Handle search from results page
    const handleResultsSearch = useCallback((searchQuery: string, propertyType?: string, messageType?: string) => {
        setQuery(searchQuery)
        const newPropertyType = propertyType || ''
        const newMessageType = messageType || ''

        setFilters(prev => ({
            ...prev,
            propertyType: newPropertyType,
            messageType: newMessageType
        }))

        updateURLParams({
            query: searchQuery,
            property_type: newPropertyType,
            message_type: newMessageType
        })

        fetchResults(searchQuery, newPropertyType, newMessageType)
    }, [fetchResults, updateURLParams])

    // Handle back to landing
    const handleBackToLanding = useCallback(() => {
        setShowResults(false)
        setQuery('')
        setListings([])
        setRbProperties([])
        router.replace('/search', { scroll: false })
    }, [router])

    // Handle filter changes
    const handleFilterChange = useCallback((filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }))
        setCurrentPage(1)

        // Update URL
        const urlKey = filterName === 'bedroomCount' ? 'bedrooms'
            : filterName === 'propertyType' ? 'property_type'
                : filterName === 'messageType' ? 'message_type'
                    : filterName === 'minPrice' ? 'min_price'
                        : filterName === 'maxPrice' ? 'max_price'
                            : filterName

        updateURLParams({ [urlKey]: value })

        // For server-side filters (propertyType, messageType), re-fetch
        if (filterName === 'propertyType' || filterName === 'messageType') {
            const newPropertyType = filterName === 'propertyType' ? value : filters.propertyType
            const newMessageType = filterName === 'messageType' ? value : filters.messageType
            fetchResults(query, newPropertyType, newMessageType)
        }
    }, [query, filters.propertyType, filters.messageType, fetchResults, updateURLParams])

    // Apply client-side filters
    const filteredListings = useMemo(() => {
        return listings.filter(listing => {
            // Location filter
            if (filters.location) {
                const loc = listing.location?.toLowerCase() || ''
                if (!loc.includes(filters.location.toLowerCase())) return false
            }

            // Agent filter
            if (filters.agent) {
                const agent = listing.agent_name?.toLowerCase() || listing.sender_name?.toLowerCase() || ''
                if (!agent.includes(filters.agent.toLowerCase())) return false
            }

            // Bedroom filter
            if (filters.bedroomCount && filters.bedroomCount !== 'all') {
                const beds = parseInt(filters.bedroomCount)
                if (filters.bedroomCount === '6') {
                    if (!listing.bedrooms || listing.bedrooms < 6) return false
                } else {
                    if (listing.bedrooms !== beds) return false
                }
            }

            // Price filters
            if (filters.minPrice) {
                const min = parseInt(filters.minPrice)
                if (!listing.price || listing.price < min) return false
            }
            if (filters.maxPrice) {
                const max = parseInt(filters.maxPrice)
                if (!listing.price || listing.price > max) return false
            }

            return true
        })
    }, [listings, filters])

    const filteredProperties = useMemo(() => {
        return rbProperties.filter(property => {
            // Location filter
            if (filters.location) {
                const loc = property.location?.toLowerCase() || ''
                if (!loc.includes(filters.location.toLowerCase())) return false
            }

            // Agent filter
            if (filters.agent) {
                const agent = property.agent_name?.toLowerCase() || ''
                if (!agent.includes(filters.agent.toLowerCase())) return false
            }

            // Bedroom filter
            if (filters.bedroomCount && filters.bedroomCount !== 'all') {
                const beds = parseInt(filters.bedroomCount)
                if (filters.bedroomCount === '6') {
                    if (!property.bedrooms || property.bedrooms < 6) return false
                } else {
                    if (property.bedrooms !== beds) return false
                }
            }

            // Price filters
            if (filters.minPrice) {
                const min = parseInt(filters.minPrice)
                if (!property.price || property.price < min) return false
            }
            if (filters.maxPrice) {
                const max = parseInt(filters.maxPrice)
                if (!property.price || property.price > max) return false
            }

            return true
        })
    }, [rbProperties, filters])

    // Combine all filtered results for pagination
    const allFilteredResults = useMemo(() => {
        const combined: { type: 'listing' | 'property', data: WhatsAppListing | RBProperty }[] = []

        if (activeTab === 'all') {
            filteredListings.forEach(l => combined.push({ type: 'listing', data: l }))
            // filteredProperties.forEach(p => combined.push({ type: 'property', data: p })) // Exclude verified from 'all' per user request
        } else {
            // verified only
            filteredProperties.forEach(p => combined.push({ type: 'property', data: p }))
        }

        return combined
    }, [filteredListings, filteredProperties, activeTab])

    // Pagination - slice combined results
    const totalFiltered = allFilteredResults.length
    const totalPages = Math.ceil(totalFiltered / PAGE_SIZE)
    const startIndex = (currentPage - 1) * PAGE_SIZE
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalFiltered)

    const paginatedResults = useMemo(() => {
        return allFilteredResults.slice(startIndex, endIndex)
    }, [allFilteredResults, startIndex, endIndex])

    // Split back to listings and properties for the component
    const paginatedListings = useMemo(() =>
        paginatedResults.filter(r => r.type === 'listing').map(r => r.data as WhatsAppListing)
        , [paginatedResults])

    const paginatedProperties = useMemo(() =>
        paginatedResults.filter(r => r.type === 'property').map(r => r.data as RBProperty)
        , [paginatedResults])

    const hasNext = currentPage < totalPages
    const hasPrevious = currentPage > 1

    // Initial load if URL has search params
    useEffect(() => {
        if (hasSearchParams && listings.length === 0 && !isLoading) {
            fetchResults(initialQuery, initialPropertyType, initialMessageType)
        }
    }, []) // Only run on mount

    // Render
    if (!showResults) {
        return (
            <SearchLanding
                onSearch={handleSearch}
                onBrowseAll={handleBrowseAll}
                isLoading={isLoading}
            />
        )
    }

    return (
        <SearchResults
            query={query}
            listings={paginatedListings}
            rbProperties={paginatedProperties}
            isLoading={isLoading}
            onSearch={handleResultsSearch}
            onBackToLanding={handleBackToLanding}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onNext={() => setCurrentPage(p => p + 1)}
            onPrevious={() => setCurrentPage(p => Math.max(1, p - 1))}
            startIndex={startIndex}
            endIndex={endIndex}
            totalCount={totalFiltered}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            activeTab={activeTab}
            onTabChange={(tab) => {
                setActiveTab(tab)
                setCurrentPage(1)
            }}
            filters={filters}
            onFilterChange={handleFilterChange}
        />
    )
}
