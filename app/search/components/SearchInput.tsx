/**
 * SearchInput - Client Component
 * ================================
 *
 * Search input with search button - no auto-search on keydown.
 * Search only triggers on button click or Enter key press.
 */

'use client'

import { useState, KeyboardEvent, useEffect, useRef, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
    onSearch: (query: string, propertyType?: string, messageType?: string) => void
    isLoading?: boolean
    initialValue?: string
    initialPropertyType?: string
    initialMessageType?: string
    // Client-side filters
    onLocationFilter?: (location: string) => void
    locationFilter?: string
    onAgentFilter?: (agent: string) => void
    agentFilter?: string
    onBedroomCountFilter?: (bedroomCount: string) => void
    bedroomCountFilter?: string
    initialLocation?: string
    initialAgent?: string
    initialBedrooms?: string
    onResetFilters?: () => void
    onFilterCountChange?: (count: number) => void
}

export default function SearchInput({
    onSearch,
    isLoading,
    initialValue = '',
    initialPropertyType = '',
    initialMessageType = '',
    onLocationFilter,
    locationFilter = '',
    onAgentFilter,
    agentFilter = '',
    onBedroomCountFilter,
    bedroomCountFilter = '',
    initialLocation = '',
    initialAgent = '',
    initialBedrooms = '',
    onResetFilters,
    onFilterCountChange
}: SearchInputProps) {
    const [query, setQuery] = useState(initialValue)
    const [propertyType, setPropertyType] = useState(initialPropertyType || 'all')
    const [messageType, setMessageType] = useState(initialMessageType || 'all')
    const [location, setLocation] = useState(initialLocation)
    const [agent, setAgent] = useState(initialAgent)
    const [bedrooms, setBedrooms] = useState(initialBedrooms || 'all')

    // Update local state when initial values change (e.g., from URL params)
    useEffect(() => {
        setQuery(initialValue)
    }, [initialValue])

    useEffect(() => {
        setPropertyType(initialPropertyType || 'all')
    }, [initialPropertyType])

    useEffect(() => {
        setMessageType(initialMessageType || 'all')
    }, [initialMessageType])

    useEffect(() => {
        setLocation(initialLocation)
    }, [initialLocation])

    useEffect(() => {
        setAgent(initialAgent)
    }, [initialAgent])

    useEffect(() => {
        setBedrooms(initialBedrooms || 'all')
    }, [initialBedrooms])

    // Sync with controlled filter values when they change
    useEffect(() => {
        if (locationFilter !== undefined) {
            setLocation(locationFilter)
        }
    }, [locationFilter])

    useEffect(() => {
        if (agentFilter !== undefined) {
            setAgent(agentFilter)
        }
    }, [agentFilter])

    useEffect(() => {
        if (bedroomCountFilter !== undefined) {
            setBedrooms(bedroomCountFilter || 'all')
        }
    }, [bedroomCountFilter])

    const handleSearch = () => {
        const searchPropertyType = propertyType === 'all' ? undefined : propertyType
        const searchMessageType = messageType === 'all' ? undefined : messageType

        if (query.trim().length > 0 || searchPropertyType || searchMessageType) {
            onSearch(query.trim(), searchPropertyType, searchMessageType)
        } else {
            // Clear search when everything is empty
            onSearch('', undefined, undefined)
        }
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    const handlePropertyTypeChange = (value: string) => {
        setPropertyType(value)
        // Trigger search immediately when dropdown changes
        const searchPropertyType = value === 'all' ? undefined : value
        const searchMessageType = messageType === 'all' ? undefined : messageType
        if (query.trim().length > 0 || searchPropertyType || searchMessageType) {
            onSearch(query.trim(), searchPropertyType, searchMessageType)
        } else {
            onSearch('', undefined, undefined)
        }
    }

    const handleMessageTypeChange = (value: string) => {
        setMessageType(value)
        // Trigger search immediately when dropdown changes
        const searchPropertyType = propertyType === 'all' ? undefined : propertyType
        const searchMessageType = value === 'all' ? undefined : value
        if (query.trim().length > 0 || searchPropertyType || searchMessageType) {
            onSearch(query.trim(), searchPropertyType, searchMessageType)
        } else {
            onSearch('', undefined, undefined)
        }
    }

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setLocation(value)
        onLocationFilter?.(value)
    }

    const handleAgentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setAgent(value)
        onAgentFilter?.(value)
    }

    const handleBedroomsChange = (value: string) => {
        setBedrooms(value)
        const bedroomValue = value === 'all' ? '' : value
        onBedroomCountFilter?.(bedroomValue)
    }

    // Check which filters are active for data attributes
    const isAgentActive = (agentFilter !== undefined ? agentFilter : agent)?.trim() || false
    const isLocationActive = (locationFilter !== undefined ? locationFilter : location)?.trim() || false
    const isPropertyTypeActive = propertyType !== 'all'
    const isMessageTypeActive = messageType !== 'all'
    const isBedroomsActive = (bedroomCountFilter !== undefined ? (bedroomCountFilter || 'all') : bedrooms) !== 'all'

    // Count active filters by querying DOM for filter-active class
    const [activeFilterCount, setActiveFilterCount] = useState(0)
    const filtersContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Small delay to ensure DOM is updated
        const timer = setTimeout(() => {
            if (filtersContainerRef.current) {
                const activeFilters = filtersContainerRef.current.querySelectorAll('.filter-active')
                const count = activeFilters.length
                setActiveFilterCount(count)
                onFilterCountChange?.(count)
            }
        }, 0)
        return () => clearTimeout(timer)
    }, [isAgentActive, isLocationActive, isPropertyTypeActive, isMessageTypeActive, isBedroomsActive, onFilterCountChange])

    return (
        <div className="space-y-3">
            {/* All Filters Group */}
            <div ref={filtersContainerRef} className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Agent Filter */}
                    {onAgentFilter && (
                        <div className={cn("w-full", isAgentActive && "filter-active")}>
                            <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                                Agent
                            </label>
                            <Input
                                type="text"
                                placeholder="Filter by agent..."
                                value={agentFilter !== undefined ? agentFilter : agent}
                                onChange={handleAgentChange}
                                className={cn(
                                    "h-9 text-sm w-full shadow-sm",
                                    isAgentActive && "border-2 border-accent focus-visible:ring-accent"
                                )}
                            />
                        </div>
                    )}

                    {/* Asset Type Filter */}
                    <div className={cn("w-full", isPropertyTypeActive && "filter-active")}>
                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                            Asset Type
                        </label>
                        <Select
                            value={propertyType}
                            onValueChange={handlePropertyTypeChange}
                        >
                            <SelectTrigger className={cn(
                                "h-9 text-sm w-full shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-offset-2",
                                isPropertyTypeActive && "border-2 border-accent focus-visible:ring-accent"
                            )}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Asset Types</SelectItem>
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

                    {/* Bedrooms Filter */}
                    {onBedroomCountFilter && (
                        <div className={cn("w-full", isBedroomsActive && "filter-active")}>
                            <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                                Bedrooms
                            </label>
                            <Select
                                value={bedroomCountFilter !== undefined ? (bedroomCountFilter || 'all') : bedrooms}
                                onValueChange={handleBedroomsChange}
                            >
                                <SelectTrigger className={cn(
                                    "h-9 text-sm w-full shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-offset-2",
                                    isBedroomsActive && "border-2 border-accent focus-visible:ring-accent"
                                )}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All bedrooms</SelectItem>
                                    <SelectItem value="1">1 BHK</SelectItem>
                                    <SelectItem value="2">2 BHK</SelectItem>
                                    <SelectItem value="3">3 BHK</SelectItem>
                                    <SelectItem value="4">4 BHK</SelectItem>
                                    <SelectItem value="5">5 BHK</SelectItem>
                                    <SelectItem value="6">6+ BHK</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Location Filter */}
                    {onLocationFilter && (
                        <div className={cn("w-full", isLocationActive && "filter-active")}>
                            <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                                Location
                            </label>
                            <Input
                                type="text"
                                placeholder="Filter by location..."
                                value={locationFilter !== undefined ? locationFilter : location}
                                onChange={handleLocationChange}
                                className={cn(
                                    "h-9 text-sm w-full shadow-sm",
                                    isLocationActive && "border-2 border-accent focus-visible:ring-accent"
                                )}
                            />
                        </div>
                    )}

                    {/* Message Type Filter */}
                    <div className={cn("w-full", isMessageTypeActive && "filter-active")}>
                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                            Message Type
                        </label>
                        <Select
                            value={messageType}
                            onValueChange={handleMessageTypeChange}
                        >
                            <SelectTrigger className={cn(
                                "h-9 text-sm w-full shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-offset-2",
                                messageType !== 'all' && "border-2 border-accent focus-visible:ring-accent"
                            )}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Message Types</SelectItem>
                                <SelectItem value="supply_sale">Supply - Sale</SelectItem>
                                <SelectItem value="supply_rent">Supply - Rent</SelectItem>
                                <SelectItem value="demand_buy">Demand - Buy</SelectItem>
                                <SelectItem value="demand_rent">Demand - Rent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Separate SearchBar component for top right placement
export function SearchBar({
    onSearch,
    isLoading,
    initialValue = '',
    activeFilterCount = 0,
    onResetFilters
}: {
    onSearch: (query: string) => void
    isLoading?: boolean
    initialValue?: string
    activeFilterCount?: number
    onResetFilters?: () => void
}) {
    const [query, setQuery] = useState(initialValue)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setQuery(initialValue)
    }, [initialValue])

    // Focus input after loading completes
    useEffect(() => {
        if (!isLoading && inputRef.current) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isLoading])

    const handleSearch = () => {
        if (query.trim().length > 0) {
            onSearch(query.trim())
        } else {
            onSearch('')
        }
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    const handleClear = () => {
        setQuery('')
        // Trigger search with empty query to reflect cleared data
        onSearch('')
    }

    return (
        <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Filter count with reset */}
            {/* {activeFilterCount > 0 && (
                // <div className=" flex items-center gap-1.5 px-3 py-1.5 hover:underline cursor-pointer">
                //     <span onClick={onResetFilters} className="text-xs font-medium text-accent whitespace-nowrap">
                //         Clear Filters ({activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} )
                //     </span>

                // </div>
            )} */}
            <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search listings..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-10 h-10 w-full md:w-80 text-sm shadow-md"
                    disabled={isLoading}
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <Button
                onClick={handleSearch}
                disabled={isLoading}
                size="icon"
                className="h-10 w-10 bg-accent hover:bg-accent/90 text-white disabled:opacity-50 shadow-md flex-shrink-0"
            >
                {isLoading ? (
                    <Search className="w-4 h-4 animate-pulse" />
                ) : (
                    <Search className="w-4 h-4" />
                )}
            </Button>
        </div>
    )
}


