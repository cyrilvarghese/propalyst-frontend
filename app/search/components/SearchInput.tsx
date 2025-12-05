/**
 * SearchInput - Client Component
 * ================================
 *
 * Search input with search button - no auto-search on keydown.
 * Search only triggers on button click or Enter key press.
 */

'use client'

import { useState, KeyboardEvent, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

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
    initialBedrooms = ''
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

    return (
        <div className="space-y-3">
            {/* All Filters Group */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Agent Filter */}
                    {onAgentFilter && (
                        <div className="w-full">
                            <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                                Agent
                            </label>
                            <Input
                                type="text"
                                placeholder="Filter by agent..."
                                value={agentFilter !== undefined ? agentFilter : agent}
                                onChange={handleAgentChange}
                                className="h-9 text-sm w-full shadow-sm"
                            />
                        </div>
                    )}

                    {/* Asset Type Filter */}
                    <div className="w-full">
                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                            Asset Type
                        </label>
                        <Select
                            value={propertyType}
                            onValueChange={handlePropertyTypeChange}
                        >
                            <SelectTrigger className="h-9 text-sm w-full shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
                        <div className="w-full">
                            <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                                Bedrooms
                            </label>
                            <Select
                                value={bedroomCountFilter !== undefined ? (bedroomCountFilter || 'all') : bedrooms}
                                onValueChange={handleBedroomsChange}
                            >
                                <SelectTrigger className="h-9 text-sm w-full shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
                        <div className="w-full">
                            <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                                Location
                            </label>
                            <Input
                                type="text"
                                placeholder="Filter by location..."
                                value={locationFilter !== undefined ? locationFilter : location}
                                onChange={handleLocationChange}
                                className="h-9 text-sm w-full shadow-sm"
                            />
                        </div>
                    )}

                    {/* Message Type Filter */}
                    <div className="w-full">
                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                            Message Type
                        </label>
                        <Select
                            value={messageType}
                            onValueChange={handleMessageTypeChange}
                        >
                            <SelectTrigger className="h-9 text-sm w-full shadow-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
    initialValue = ''
}: {
    onSearch: (query: string) => void
    isLoading?: boolean
    initialValue?: string
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

    return (
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                    ref={inputRef}

                    type="text"
                    placeholder="Search listings..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-10 w-full md:w-80 text-sm shadow-md"
                    disabled={isLoading}
                />
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


