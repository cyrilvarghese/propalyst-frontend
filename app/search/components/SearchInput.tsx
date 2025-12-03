/**
 * SearchInput - Client Component
 * ================================
 *
 * Search input with search button - no auto-search on keydown.
 * Search only triggers on button click or Enter key press.
 */

'use client'

import { useState, KeyboardEvent, useEffect } from 'react'
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
}

export default function SearchInput({
    onSearch,
    isLoading,
    initialValue = '',
    initialPropertyType = '',
    initialMessageType = ''
}: SearchInputProps) {
    const [query, setQuery] = useState(initialValue)
    const [propertyType, setPropertyType] = useState(initialPropertyType || 'all')
    const [messageType, setMessageType] = useState(initialMessageType || 'all')

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

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search raw messages..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10 h-10 text-sm"
                        disabled={isLoading}
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="h-10 bg-accent px-6 hover:bg-accent/90 text-white disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Search className="w-4 h-4 mr-2 animate-pulse" />
                            Searching...
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </>
                    )}
                </Button>
            </div>

            {/* Filter Row */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <Select
                        value={propertyType}
                        onValueChange={handlePropertyTypeChange}
                    >
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="All property types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Property Types</SelectItem>
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
                <div className="flex-1">
                    <Select
                        value={messageType}
                        onValueChange={handleMessageTypeChange}
                    >
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="All message types" />
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
    )
}


