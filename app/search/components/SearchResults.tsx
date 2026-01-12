/**
 * SearchResults - Google-style Results Page
 * ==========================================
 *
 * Displays search results in a Google-like format.
 * Header with logo and search bar, filters, and result cards.
 */

'use client'

import { useState, KeyboardEvent, useCallback, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Search, X, ChevronLeft, ChevronRight, Loader2, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { WhatsAppListing, RBProperty } from '@/lib/api/whatsapp-listings'
import ResultCard from './ResultCard'

interface SearchResultsProps {
    query: string
    listings: WhatsAppListing[]
    rbProperties: RBProperty[]
    isLoading: boolean
    onSearch: (query: string, propertyType?: string, messageType?: string) => void
    onBackToLanding: () => void
    // Pagination
    hasNext: boolean
    hasPrevious: boolean
    onNext: () => void
    onPrevious: () => void
    onPageChange: (page: number) => void
    startIndex: number
    endIndex: number
    totalCount: number
    currentPage: number
    totalPages: number
    // Tabs
    activeTab: 'all' | 'verified'
    onTabChange: (tab: 'all' | 'verified') => void
    // Filters
    filters: {
        location: string
        agent: string
        bedroomCount: string
        minPrice: string
        maxPrice: string
        propertyType: string
        messageType: string
    }
    onFilterChange: (filterName: string, value: string) => void
}

export default function SearchResults({
    query: initialQuery,
    listings,
    rbProperties,
    isLoading,
    onSearch,
    onBackToLanding,
    hasNext,
    hasPrevious,
    onNext,
    onPrevious,
    startIndex,
    endIndex,
    totalCount,
    currentPage,
    totalPages,
    onPageChange,
    activeTab,
    onTabChange,
    filters,
    onFilterChange
}: SearchResultsProps) {
    const [query, setQuery] = useState(initialQuery)
    const [showFilters, setShowFilters] = useState(false) // Default to closed on mobile

    // Sync query with prop changes
    useEffect(() => {
        setQuery(initialQuery)
    }, [initialQuery])

    const handleSearch = () => {
        onSearch(query.trim(), filters.propertyType, filters.messageType)
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    const handleClear = () => {
        setQuery('')
        onSearch('', filters.propertyType, filters.messageType)
    }

    const handleClearFilters = useCallback(() => {
        onFilterChange('location', '')
        onFilterChange('agent', '')
        onFilterChange('bedroomCount', '')
        onFilterChange('minPrice', '')
        onFilterChange('maxPrice', '')
        onFilterChange('propertyType', '')
        onFilterChange('messageType', '')
    }, [onFilterChange])

    // Combine listings and properties for display
    const allResults = useMemo(() => {
        // For now, show listings first then properties
        const results: { type: 'listing' | 'property', data: WhatsAppListing | RBProperty }[] = []
        listings.forEach(l => results.push({ type: 'listing', data: l }))
        rbProperties.forEach(p => results.push({ type: 'property', data: p }))
        return results
    }, [listings, rbProperties])

    const hasActiveFilters = filters.location || filters.agent ||
        (filters.bedroomCount && filters.bedroomCount !== 'all') ||
        filters.minPrice || filters.maxPrice ||
        (filters.propertyType && filters.propertyType !== 'all') ||
        (filters.messageType && filters.messageType !== 'all')

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [currentPage])

    return (
        <div className="min-h-screen bg-white flex flex-col" style={{ scrollbarGutter: 'stable' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                        {/* Logo */}
                        <button
                            onClick={onBackToLanding}
                            className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity"
                        >
                            <div className="relative h-10 w-32 md:h-10 md:w-40">
                                <Image
                                    src="/propalyst-mls-logo.png"
                                    alt="Propalyst MLS"
                                    fill
                                    className="object-contain object-left"
                                    priority
                                />
                            </div>
                        </button>

                        {/* Search Bar */}
                        <div className="w-full md:flex-1 max-w-2xl flex items-center">
                            <div className="relative flex items-center w-full bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <Search className="absolute left-4 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search properties..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                    className="w-full pl-11 pr-20 py-2.5 text-sm border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                />
                                {query && (
                                    <button
                                        onClick={handleClear}
                                        className="absolute right-12 p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <Button
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    size="sm"
                                    className="absolute right-1.5 h-8 px-3 bg-accent hover:bg-accent/90 text-white rounded-full"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </header>

            {/* Mobile Filters Toggle */}
            <div className="md:hidden px-4 py-2 bg-white flex items-center justify-between sticky top-[73px] z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80",
                            hasActiveFilters ? "text-accent" : "text-gray-500"
                        )}
                    >
                        <span>Filters</span>
                        {showFilters ? (
                            <ChevronUp className="w-3.5 h-3.5 text-gray-400 translate-y-[1px]" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 translate-y-[1px]" />
                        )}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <div className={cn(
                "bg-white border-b md:border-b-0 border-gray-100",
                !showFilters && "hidden md:block"
            )}>
                <div className="max-w-5xl mx-auto px-4 py-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {/* Agent Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">Agent</label>
                            <Input
                                type="text"
                                placeholder="Name..."
                                value={filters.agent}
                                onChange={(e) => onFilterChange('agent', e.target.value)}
                                className={cn(
                                    "h-9 text-sm",
                                    filters.agent && "border-accent bg-accent/10"
                                )}
                            />
                        </div>

                        {/* Asset Type */}
                        {/* Asset Type */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">Property Type</label>
                            <Select
                                value={filters.propertyType || 'all'}
                                onValueChange={(value) => onFilterChange('propertyType', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger className={cn(
                                    "h-9 w-full text-sm",
                                    filters.propertyType && filters.propertyType !== 'all' && "border-accent bg-accent/10"
                                )}>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="apartment">Apartment</SelectItem>
                                    <SelectItem value="villa">Villa</SelectItem>
                                    <SelectItem value="independent_house">Independent House</SelectItem>
                                    <SelectItem value="plot">Plot</SelectItem>
                                    <SelectItem value="office">Office</SelectItem>
                                    <SelectItem value="retail">Retail</SelectItem>
                                    <SelectItem value="warehouse">Warehouse</SelectItem>
                                    <SelectItem value="pg_hostel">PG/Hostel</SelectItem>
                                    <SelectItem value="farmhouse">Farmhouse</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Bedrooms */}
                        {/* Bedrooms */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">Bedrooms</label>
                            <Select
                                value={filters.bedroomCount || 'all'}
                                onValueChange={(value) => onFilterChange('bedroomCount', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger className={cn(
                                    "h-9 w-full text-sm",
                                    filters.bedroomCount && filters.bedroomCount !== 'all' && "border-accent bg-accent/10"
                                )}>
                                    <SelectValue placeholder="Any" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any</SelectItem>
                                    <SelectItem value="1">1 BHK</SelectItem>
                                    <SelectItem value="2">2 BHK</SelectItem>
                                    <SelectItem value="3">3 BHK</SelectItem>
                                    <SelectItem value="4">4 BHK</SelectItem>
                                    <SelectItem value="5">5 BHK</SelectItem>
                                    <SelectItem value="6">6+ BHK</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Location */}
                        {/* Location */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">Location</label>
                            <Input
                                type="text"
                                placeholder="Area..."
                                value={filters.location}
                                onChange={(e) => onFilterChange('location', e.target.value)}
                                className={cn(
                                    "h-9 text-sm",
                                    filters.location && "border-accent bg-accent/10"
                                )}
                            />
                        </div>

                        {/* Message Type */}
                        {/* Message Type */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">Listing Type</label>
                            <Select
                                value={filters.messageType || 'all'}
                                onValueChange={(value) => onFilterChange('messageType', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger className={cn(
                                    "h-9 w-full text-sm",
                                    filters.messageType && filters.messageType !== 'all' && "border-accent bg-accent/10"
                                )}>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="supply_sale">For Sale</SelectItem>
                                    <SelectItem value="supply_rent">For Rent</SelectItem>
                                    <SelectItem value="demand_buy">Looking to Buy</SelectItem>
                                    <SelectItem value="demand_rent">Looking to Rent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Min Price */}
                        {/* Min Price */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">Min Price</label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="₹ 0"
                                value={filters.minPrice}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '' || /^\d*$/.test(value)) {
                                        onFilterChange('minPrice', value)
                                    }
                                }}
                                className={cn(
                                    "h-9 text-sm",
                                    filters.minPrice && "border-accent bg-accent/10"
                                )}
                            />
                        </div>

                        {/* Max Price */}
                        {/* Max Price */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700">Max Price</label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="₹ Any"
                                value={filters.maxPrice}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '' || /^\d*$/.test(value)) {
                                        onFilterChange('maxPrice', value)
                                    }
                                }}
                                className={cn(
                                    "h-9 text-sm",
                                    filters.maxPrice && "border-accent bg-accent/10"
                                )}
                            />
                        </div>

                    </div>

                    {/* Desktop Clear Filters */}
                    {hasActiveFilters && (
                        <div className="hidden md:flex justify-end mt-2">
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-accent transition-colors py-1 px-2 rounded-md hover:bg-gray-50"
                            >
                                <X className="w-3 h-3" />
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-6">
                        <button
                            onClick={() => onTabChange('all')}
                            className={cn(
                                "py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'all'
                                    ? "border-accent text-accent"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            )}
                        >
                            MLS Listings
                        </button>
                        <button
                            onClick={() => onTabChange('verified')}
                            className={cn(
                                "py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'verified'
                                    ? "border-accent text-accent"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Verified RB Listings
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <main className="flex-1">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    {/* Results count */}
                    {!isLoading && (
                        <p className="text-sm text-gray-600 mb-2">
                            {totalCount > 0
                                ? `About ${totalCount.toLocaleString()} results`
                                : 'No results found'}
                        </p>
                    )}

                    {/* Loading state */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
                                <p className="text-gray-500">Searching properties...</p>
                            </div>
                        </div>
                    )}

                    {/* Results list */}
                    {!isLoading && allResults.length > 0 && (
                        <div className="divide-y divide-gray-100">
                            {allResults.map((result, index) => (
                                <ResultCard
                                    key={`${result.type}-${result.data.id}-${index}`}
                                    listing={result.type === 'listing' ? result.data as WhatsAppListing : undefined}
                                    property={result.type === 'property' ? result.data as RBProperty : undefined}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && allResults.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🏠</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No properties found
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Try adjusting your search or filters
                            </p>
                            <Button
                                onClick={onBackToLanding}
                                variant="outline"
                            >
                                Back to Search
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && allResults.length > 0 && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-0.5 py-8 border-t border-gray-100 mt-4 select-none">
                            {currentPage > 1 && (
                                <span
                                    onClick={() => onPrevious()}
                                    className="px-2 md:px-3 py-1 cursor-pointer hover:bg-gray-100 rounded text-xs md:text-sm text-blue-600 font-medium select-none mr-2"
                                >
                                    Previous
                                </span>
                            )}

                            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                                // Logic to show window of pages around current page
                                let pageNum = i + 1;

                                // Adjust window if we have more than 10 pages
                                if (totalPages > 10) {
                                    if (currentPage <= 6) {
                                        // Start of list: 1 2 3 4 5 6 ...
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 4) {
                                        // End of list: ... 95 96 97 98 99 100
                                        pageNum = totalPages - 9 + i;
                                    } else {
                                        // Middle: ... 45 46 47 48 49 ...
                                        pageNum = currentPage - 5 + i;
                                    }
                                }

                                return (
                                    <span
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={cn(
                                            "w-8 h-8 flex items-center justify-center cursor-pointer rounded-full text-sm",
                                            currentPage === pageNum
                                                ? "text-black font-bold"
                                                : "text-blue-600 hover:text-blue-800 hover:bg-gray-50"
                                        )}
                                    >
                                        {pageNum}
                                    </span>
                                );
                            })}

                            {currentPage < totalPages && (
                                <span
                                    onClick={() => onNext()}
                                    className="px-2 md:px-3 py-1 cursor-pointer hover:bg-gray-100 rounded text-xs md:text-sm text-blue-600 font-medium select-none ml-2"
                                >
                                    Next
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 px-6 bg-gray-100 border-t border-gray-200">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 text-sm text-gray-600">
                    <span className="text-center md:text-left">
                        © 2026 <a href="https://propalyst.com" target="_blank" rel="noopener noreferrer" className="text-[#e74c3c]">Propalyst</a>. All rights reserved.
                    </span>
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <span>Want to add your listing?</span>
                        <a
                            href="https://chat.whatsapp.com/J827YjNq8RU5Zwf0NWhXHY"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-full transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Join
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
