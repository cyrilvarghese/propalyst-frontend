/**
 * SearchInput - Client Component
 * ================================
 *
 * Search input with debounce for server-side search on raw messages.
 */

'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchInputProps {
    onSearch: (query: string) => void
    isLoading?: boolean
}

const DEBOUNCE_DELAY = 800 // 500ms debounce delay

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
    const [query, setQuery] = useState('')

    useEffect(() => {
        // Debounce the search
        const timer = setTimeout(() => {
            if (query.trim().length > 0) {
                onSearch(query.trim())
            } else if (query.length === 0) {
                // Clear search when input is empty
                onSearch('')
            }
        }, DEBOUNCE_DELAY)

        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
                type="text"
                placeholder="Search raw messages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-10 text-sm"
                disabled={isLoading}
            />
        </div>
    )
}

