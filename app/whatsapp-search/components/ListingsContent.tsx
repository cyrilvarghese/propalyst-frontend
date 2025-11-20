/**
 * ListingsContent - Client Component
 * ===================================
 *
 * Client component that handles search with debounce and displays listings.
 */

'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { searchCREAListings, fetchCREAListings, searchCREAListingsByLocation } from '@/lib/api/crea-listings'
import CREAListingsTable from './CREAListingsTable'
import SearchInput from './SearchInput'
import { CREAListing } from '@/lib/services/crea-listings.service'

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
    const [listings, setListings] = useState<CREAListing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [locationFilter, setLocationFilter] = useState('')
    const [isPending, startTransition] = useTransition()

    // Initial load
    useEffect(() => {
        const loadListings = async () => {
            setIsLoading(true)
            try {
                const data = await fetchCREAListings(100, 0)
                setListings(data)
            } catch (error) {
                console.error('Error loading listings:', error)
                setListings([])
            } finally {
                setIsLoading(false)
            }
        }
        loadListings()
    }, [])

    // Handle search - use useCallback to prevent unnecessary re-renders
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query)
        startTransition(async () => {
            setIsLoading(true)
            try {
                if (query.trim().length > 0) {
                    const results = await searchCREAListings(query, 100)
                    setListings(results)
                } else {
                    // If query is empty, check if location filter is active
                    if (locationFilter.trim().length > 0) {
                        const results = await searchCREAListingsByLocation(locationFilter, 100)
                        setListings(results)
                    } else {
                        // Reload all listings
                        const data = await fetchCREAListings(100, 0)
                        setListings(data)
                    }
                }
            } catch (error) {
                console.error('Error searching listings:', error)
                setListings([])
            } finally {
                setIsLoading(false)
            }
        })
    }, [locationFilter])

    // Handle location filter - just update state
    const handleLocationFilter = useCallback((location: string) => {
        setLocationFilter(location)
    }, [])

    // Effect to handle location filter changes with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            startTransition(async () => {
                setIsLoading(true)
                try {
                    if (locationFilter.trim().length > 0) {
                        const results = await searchCREAListingsByLocation(locationFilter, 100)
                        setListings(results)
                    } else if (searchQuery.trim().length > 0) {
                        // If location is cleared but search query exists, use search query
                        const results = await searchCREAListings(searchQuery, 100)
                        setListings(results)
                    } else if (locationFilter.length === 0 && searchQuery.length === 0) {
                        // Both cleared, reload all
                        const data = await fetchCREAListings(100, 0)
                        setListings(data)
                    }
                } catch (error) {
                    console.error('Error filtering by location:', error)
                    setListings([])
                } finally {
                    setIsLoading(false)
                }
            })
        }, 500)

        return () => clearTimeout(timer)
    }, [locationFilter, searchQuery])

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
                <div className="mb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 pt-8">
                        <span className="text-white">CREA</span> <span className="text-[#E6D3AF]">Listings</span>
                    </h1>
                    <p className="text-gray-200 text-lg">
                        Browse property listings from CREA
                    </p>
                </div>

                {/* Search Input */}
                <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-4 mb-6">
                    <SearchInput onSearch={handleSearch} isLoading={isLoading || isPending} />
                </Card>

                {/* Results header */}
                {/* {!isLoading && listings.length > 0 && (
                    <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl font-bold text-gray-600 mt-1">
                                    {listings.length} listings
                                    {searchQuery && ` matching "${searchQuery}"`}
                                </p>
                            </div>
                            <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                                Source: CREA
                            </div>
                        </div>
                    </Card>
                )} */}

                {/* No results found */}
                {!isLoading && listings.length === 0 && (
                    <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">🏠</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No listings found
                            </h3>
                            <p className="text-gray-500">
                                {searchQuery
                                    ? `No CREA listings match "${searchQuery}"`
                                    : 'No CREA listings are currently available'}
                            </p>
                        </div>
                    </Card>
                )}

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
                {!isLoading && listings.length > 0 && (
                    <CREAListingsTable
                        listings={listings}
                        onLocationFilter={handleLocationFilter}
                        locationFilter={locationFilter}
                    />
                )}
            </div>
        </div>
    )
}

