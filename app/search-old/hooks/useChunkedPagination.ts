/**
 * useChunkedPagination - Custom Hook
 * ===================================
 * 
 * Handles chunked pagination with the following strategy:
 * - Fetches 1000 records at a time from the API
 * - Divides them into local pages of 200 records (5 pages per batch)
 * - When user reaches the 4th page (second-to-last), triggers next batch fetch
 * - Accumulates all fetched records for seamless local navigation
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { WhatsAppListing } from '@/lib/api/whatsapp-listings'
import { BATCH_SIZE, LOCAL_PAGE_SIZE, TRIGGER_PAGE, PAGES_PER_BATCH } from '../constants/pagination.constants'

interface UseChunkedPaginationOptions {
    fetchBatch: (offset: number, limit: number, query?: string, propertyType?: string, messageType?: string) => Promise<{
        data: WhatsAppListing[]
        count: number
    }>
    initialQuery?: string
    initialPropertyType?: string
    initialMessageType?: string
}

interface UseChunkedPaginationReturn {
    currentPageListings: WhatsAppListing[] // Currently displayed listings (200 records)
    allListings: WhatsAppListing[] // All accumulated listings
    currentLocalPage: number // Current local page (1-based)
    totalLocalPages: number // Total local pages available
    isLoading: boolean
    error: string | null
    isLoadingNextBatch: boolean // Loading indicator for background batch fetch
    hasNext: boolean
    hasPrevious: boolean
    startIndex: number // Global start index (1-based)
    endIndex: number // Global end index (1-based)
    goToNext: () => void
    goToPrevious: () => void
    goToPage: (page: number) => void
    reset: (query?: string, propertyType?: string, messageType?: string) => Promise<void>
    refresh: () => Promise<void>
}

export function useChunkedPagination(
    options: UseChunkedPaginationOptions
): UseChunkedPaginationReturn {
    const { fetchBatch, initialQuery = '', initialPropertyType = '', initialMessageType = '' } = options

    // All accumulated listings from all batches
    const [allListings, setAllListings] = useState<WhatsAppListing[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoadingNextBatch, setIsLoadingNextBatch] = useState(false)
    const [currentLocalPage, setCurrentLocalPage] = useState(1)

    // Track which batches have been fetched to avoid duplicates
    const fetchedOffsets = useRef<Set<number>>(new Set())

    // Current search parameters
    const [currentQuery, setCurrentQuery] = useState(initialQuery)
    const [currentPropertyType, setCurrentPropertyType] = useState(initialPropertyType)
    const [currentMessageType, setCurrentMessageType] = useState(initialMessageType)

    // Track if we're currently fetching to prevent race conditions
    const isFetchingRef = useRef(false)
    const abortControllerRef = useRef<AbortController | null>(null)

    // Calculate total local pages from accumulated listings
    const totalLocalPages = useMemo(() => {
        return Math.ceil(allListings.length / LOCAL_PAGE_SIZE)
    }, [allListings.length])

    // Get current page listings (slice of allListings)
    const currentPageListings = useMemo(() => {
        const start = (currentLocalPage - 1) * LOCAL_PAGE_SIZE
        const end = start + LOCAL_PAGE_SIZE
        return allListings.slice(start, end)
    }, [allListings, currentLocalPage])

    // Calculate which batch we're currently viewing
    const currentBatchIndex = useMemo(() => {
        return Math.floor((currentLocalPage - 1) / PAGES_PER_BATCH)
    }, [currentLocalPage])

    // Calculate which local page within the current batch (1-5)
    const localPageInBatch = useMemo(() => {
        return ((currentLocalPage - 1) % PAGES_PER_BATCH) + 1
    }, [currentLocalPage])

    // Track if we've received less than BATCH_SIZE records (indicating end of data)
    const [hasMoreData, setHasMoreData] = useState(true)

    // Check if we need to fetch the next batch
    const needsNextBatch = useMemo(() => {
        // If we're on the trigger page (4th page) of a batch, we need to fetch next batch
        if (localPageInBatch === TRIGGER_PAGE && hasMoreData) {
            const nextBatchOffset = (currentBatchIndex + 1) * BATCH_SIZE
            return !fetchedOffsets.current.has(nextBatchOffset)
        }
        return false
    }, [localPageInBatch, currentBatchIndex, hasMoreData])

    // Fetch a batch of records
    const fetchBatchRecords = useCallback(async (
        offset: number,
        isBackground: boolean = false
    ) => {
        // Prevent duplicate fetches
        if (fetchedOffsets.current.has(offset) || isFetchingRef.current) {
            return
        }

        isFetchingRef.current = true
        fetchedOffsets.current.add(offset)

        if (isBackground) {
            setIsLoadingNextBatch(true)
        } else {
            setIsLoading(true)
        }
        setError(null)

        // Abort previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        try {
            const result = await fetchBatch(
                offset,
                BATCH_SIZE,
                currentQuery,
                currentPropertyType || undefined,
                currentMessageType || undefined
            )

            if (!abortController.signal.aborted) {
                // Check if we've reached the end (received fewer records than requested)
                if (result.data.length < BATCH_SIZE) {
                    setHasMoreData(false)
                }

                setAllListings(prev => {
                    // For offset 0, replace all. For other offsets, append
                    if (offset === 0) {
                        return result.data
                    } else {
                        // Append new records, avoiding duplicates by ID
                        const existingIds = new Set(prev.map(item => item.id))
                        const newRecords = result.data.filter(item => !existingIds.has(item.id))
                        return [...prev, ...newRecords]
                    }
                })
            }
        } catch (err: any) {
            if (!abortController.signal.aborted && err.name !== 'AbortError') {
                console.error('Error fetching batch:', err)
                setError('Failed to load listings. Please try again.')
                if (offset === 0) {
                    setAllListings([])
                }
                // Remove from fetched set on error so we can retry
                fetchedOffsets.current.delete(offset)
            }
        } finally {
            if (!abortController.signal.aborted) {
                setIsLoading(false)
                setIsLoadingNextBatch(false)
                isFetchingRef.current = false
                abortControllerRef.current = null
            }
        }
    }, [fetchBatch, currentQuery, currentPropertyType, currentMessageType])

    // Initial fetch on mount or when query changes
    useEffect(() => {
        // Reset everything when query/filters change
        setAllListings  
        setCurrentLocalPage(1)
        fetchedOffsets.current.clear()
        isFetchingRef.current = false
        setHasMoreData(true) // Reset hasMoreData flag

        // Fetch first batch
        fetchBatchRecords(0, false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuery, currentPropertyType, currentMessageType]) // fetchBatchRecords is stable

    // Check if we need to fetch next batch when page changes
    useEffect(() => {
        if (needsNextBatch && !isFetchingRef.current) {
            const nextBatchOffset = (currentBatchIndex + 1) * BATCH_SIZE
            fetchBatchRecords(nextBatchOffset, true) // Fetch in background
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsNextBatch, currentBatchIndex]) // fetchBatchRecords is stable due to useCallback

    // Navigation functions
    const goToNext = useCallback(() => {
        setCurrentLocalPage(prev => {
            const maxPage = Math.ceil(allListings.length / LOCAL_PAGE_SIZE)
            // If we're at the last page but might have more data, still allow increment
            // This will trigger next batch fetch if needed
            if (prev < maxPage) {
                return prev + 1
            }
            // Even if we're at max, allow going forward (will trigger fetch)
            return prev + 1
        })
    }, [allListings.length])

    const goToPrevious = useCallback(() => {
        setCurrentLocalPage(prev => Math.max(1, prev - 1))
    }, [])

    const goToPage = useCallback((page: number) => {
        setCurrentLocalPage(Math.max(1, page))
    }, [])

    // Reset and start fresh search
    const reset = useCallback(async (query?: string, propertyType?: string, messageType?: string) => {
        // Abort any pending requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }

        // Update query/filters first
        if (query !== undefined) setCurrentQuery(query)
        if (propertyType !== undefined) setCurrentPropertyType(propertyType)
        if (messageType !== undefined) setCurrentMessageType(messageType)

        // Reset state
        setAllListings([])
        setCurrentLocalPage(1)
        fetchedOffsets.current.clear()
        isFetchingRef.current = false
        setError(null)
        setHasMoreData(true) // Reset hasMoreData flag

        // Fetch first batch with new parameters
        await fetchBatchRecords(0, false)
    }, [fetchBatchRecords])

    // Refresh current search (re-fetch from beginning)
    const refresh = useCallback(async () => {
        setAllListings([])
        setCurrentLocalPage(1)
        fetchedOffsets.current.clear()
        isFetchingRef.current = false
        await fetchBatchRecords(0, false)
    }, [fetchBatchRecords])

    // Calculate display indices
    // startIndex: 0-based (Pagination component will add 1 for display)
    // endIndex: 1-based (final item number to display)
    const startIndex = useMemo(() => {
        return allListings.length > 0 ? (currentLocalPage - 1) * LOCAL_PAGE_SIZE : 0
    }, [currentLocalPage, allListings.length])

    const endIndex = useMemo(() => {
        if (currentPageListings.length === 0) return startIndex
        // Return 1-based end index for display
        return startIndex + currentPageListings.length
    }, [startIndex, currentPageListings.length])

    // Has next/previous
    const hasNext = useMemo(() => {
        // Allow next if:
        // 1. We're not on the last available page, OR
        // 2. We're loading the next batch in background, OR
        // 3. We might have more data (hasMoreData is true)
        return currentLocalPage < totalLocalPages || isLoadingNextBatch || hasMoreData
    }, [currentLocalPage, totalLocalPages, isLoadingNextBatch, hasMoreData])

    const hasPrevious = useMemo(() => {
        return currentLocalPage > 1
    }, [currentLocalPage])

    return {
        currentPageListings,
        allListings,
        currentLocalPage,
        totalLocalPages,
        isLoading,
        error,
        isLoadingNextBatch,
        hasNext,
        hasPrevious,
        startIndex,
        endIndex,
        goToNext,
        goToPrevious,
        goToPage,
        reset,
        refresh
    }
}

