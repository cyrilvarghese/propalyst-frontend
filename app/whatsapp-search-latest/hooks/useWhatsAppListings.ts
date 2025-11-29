/**
 * useWhatsAppListings - Custom Hook
 * ==================================
 * 
 * Handles API calls for WhatsApp listings with offset-based pagination.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { searchWhatsAppListingsByMessage, WhatsAppListing, WhatsAppListingsResponse } from '@/lib/api/whatsapp-listings'

interface UseWhatsAppListingsOptions {
    pageSize?: number
    initialQuery?: string
}

interface UseWhatsAppListingsReturn {
    listings: WhatsAppListing[]
    totalCount: number
    isLoading: boolean
    error: string | null
    offset: number
    search: (query: string) => Promise<void>
    loadPage: (newOffset: number) => Promise<void>
    reset: () => void
}

export function useWhatsAppListings(
    options: UseWhatsAppListingsOptions = {}
): UseWhatsAppListingsReturn {
    const { pageSize = 200, initialQuery = '' } = options
    const [listings, setListings] = useState<WhatsAppListing[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [offset, setOffset] = useState(0)
    const [currentQuery, setCurrentQuery] = useState(initialQuery)

    const abortControllerRef = useRef<AbortController | null>(null)

    // Abort any pending requests on unmount to avoid memory leaks and stale updates
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    /**
     * Core fetcher for WhatsApp listings.
     * - Cancels any in-flight request
     * - Calls the `/search/message` API with query, pageSize and offset
     * - Updates listings, totalCount, offset and currentQuery
     */
    const fetchListings = useCallback(async (query: string, newOffset: number) => {
        // Abort previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        setIsLoading(true)
        setError(null)

        try {
            const response = await searchWhatsAppListingsByMessage(
                query,
                pageSize,
                newOffset
            )

            if (!abortController.signal.aborted) {
                setListings(response.data)
                setTotalCount(response.count)
                setOffset(newOffset)
                setCurrentQuery(query)
            }
        } catch (err: any) {
            if (!abortController.signal.aborted && err.name !== 'AbortError') {
                console.error('Error fetching listings:', err)
                setError('Failed to load listings. Please try again.')
                setListings([])
                setTotalCount(0)
            }
        } finally {
            if (!abortController.signal.aborted) {
                setIsLoading(false)
                abortControllerRef.current = null
            }
        }
    }, [pageSize])

    /**
     * Run a new search starting from the first page (offset = 0).
     */
    const search = useCallback(async (query: string) => {
        await fetchListings(query, 0)
    }, [fetchListings])

    /**
     * Load a specific page by offset while keeping the current search query.
     */
    const loadPage = useCallback(async (newOffset: number) => {
        await fetchListings(currentQuery, newOffset)
    }, [fetchListings, currentQuery])

    /**
     * Reset all listing state:
     * - Clears results and errors
     * - Resets offset and query
     * - Aborts any in-flight request
     */
    const reset = useCallback(() => {
        setListings([])
        setTotalCount(0)
        setOffset(0)
        setCurrentQuery('')
        setError(null)
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
    }, [])

    return {
        listings,
        totalCount,
        isLoading,
        error,
        offset,
        search,
        loadPage,
        reset
    }
}

