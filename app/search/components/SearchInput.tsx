/**
 * SearchInput - Client Component
 * ================================
 *
 * Search input with search button - no auto-search on keydown.
 * Search only triggers on button click or Enter key press.
 */

'use client'

import { useState, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SearchInputProps {
    onSearch: (query: string) => void
    isLoading?: boolean
}

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
    const [query, setQuery] = useState('')

    const handleSearch = () => {
        if (query.trim().length > 0) {
            onSearch(query.trim())
        } else {
            // Clear search when query is empty
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
    )
}

