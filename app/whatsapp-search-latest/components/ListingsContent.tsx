/**
 * ListingsContent - Client Component
 * ===================================
 *
 * Main component for displaying WhatsApp listings with search, filters, and pagination.
 * Uses custom hooks for clean separation of concerns.
 */

'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CREAListingsTable from '../../whatsapp-search/components/CREAListingsTable'
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
    } = useWhatsAppListings({ pageSize: PAGE_SIZE })

    // Filtering logic
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

    // Initial load
    useEffect(() => {
        search('')
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Handle search
    const handleSearch = async (query: string) => {
        pagination.goToPage(1) // Reset to first page
        await search(query)
    }

    // Handle pagination navigation
    const handleNext = async () => {
        pagination.goToNext()
    }

    const handlePrevious = async () => {
        pagination.goToPrevious()
    }

    // Handle filter changes (reset to first page when filters change)
    const handleLocationFilter = (location: string) => {
        setLocation(location)
        pagination.goToPage(1)
    }

    const handleAgentFilter = (agent: string) => {
        setAgent(agent)
        pagination.goToPage(1)
    }

    const handlePropertyFilter = (property: string) => {
        setProperty(property)
        pagination.goToPage(1)
    }

    const handleBedroomCountFilter = (bedroomCount: string) => {
        setBedroomCount(bedroomCount)
        pagination.goToPage(1)
    }

    const handleTransactionTypeFilter = (type: string) => {
        setTransactionType(type)
        pagination.goToPage(1)
    }

    const handleExactMatchToggle = (exact: boolean) => {
        setExactMatch(exact)
        pagination.goToPage(1)
    }

    const handleResetFilters = () => {
        resetFilters()
        pagination.goToPage(1)
    }

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
                    <Link href="/search" className="text-blue-500    hover:text-blue-600 hover:underline inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Search |
                    </Link>
                    <p className="text-gray-200 text-lg ml-2">
                        Browse property listings from WhatsApp messages
                    </p>

                </div>

                {/* Search Input */}
                <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-4 mb-6">
                    <SearchInput onSearch={handleSearch} isLoading={isLoading} />
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
