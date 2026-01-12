/**
 * useWhatsAppListings - Custom Hook
 * ==================================
 * 
 * Handles API calls for WhatsApp listings with offset-based pagination.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { searchWhatsAppListingsByMessage, WhatsAppListing, ListingResponse } from '@/lib/api/whatsapp-listings'

interface UseWhatsAppListingsOptions {
    pageSize?: number
    initialQuery?: string
    initialPropertyType?: string
    initialMessageType?: string
}

interface UseWhatsAppListingsReturn {
    listings: WhatsAppListing[]
    totalCount: number
    isLoading: boolean
    error: string | null
    offset: number
    search: (query: string, propertyType?: string, messageType?: string) => Promise<void>
    loadPage: (newOffset: number) => Promise<void>
    reset: () => void
}

export function useWhatsAppListings(
    options: UseWhatsAppListingsOptions = {}
): UseWhatsAppListingsReturn {
    const { pageSize = 200, initialQuery = '', initialPropertyType = '', initialMessageType = '' } = options
    const [listings, setListings] = useState<WhatsAppListing[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [offset, setOffset] = useState(0)
    const [currentQuery, setCurrentQuery] = useState(initialQuery)
    const [currentPropertyType, setCurrentPropertyType] = useState(initialPropertyType)
    const [currentMessageType, setCurrentMessageType] = useState(initialMessageType)

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
     * - Calls the `/search/message` API with query, pageSize, offset, property_type and message_type
     * - Updates listings, totalCount, offset, currentQuery, currentPropertyType and currentMessageType
     */
    const fetchListings = useCallback(async (query: string, newOffset: number, propertyType?: string, messageType?: string) => {
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
                newOffset,
                propertyType,
                messageType
            )

            if (!abortController.signal.aborted) {
                // Extract whatsapp_listings from the new response structure
                setListings(response.whatsapp_listings)
                setTotalCount(response.counts?.whatsapp || 0)
                setOffset(newOffset)
                setCurrentQuery(query)
                if (propertyType !== undefined) setCurrentPropertyType(propertyType || '')
                if (messageType !== undefined) setCurrentMessageType(messageType || '')
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
    const search = useCallback(async (query: string, propertyType?: string, messageType?: string) => {
        await fetchListings(query, 0, propertyType, messageType)
    }, [fetchListings])

    /**
     * Load a specific page by offset while keeping the current search query and filters.
     */
    const loadPage = useCallback(async (newOffset: number) => {
        await fetchListings(currentQuery, newOffset, currentPropertyType || undefined, currentMessageType || undefined)
    }, [fetchListings, currentQuery, currentPropertyType, currentMessageType])

    /**
     * Reset all listing state:
     * - Clears results and errors
     * - Resets offset, query, property_type and message_type
     * - Aborts any in-flight request
     */
    const reset = useCallback(() => {
        setListings([])
        setTotalCount(0)
        setOffset(0)
        setCurrentQuery('')
        setCurrentPropertyType('')
        setCurrentMessageType('')
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

