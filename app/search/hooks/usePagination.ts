/**
 * usePagination - Custom Hook
 * ==========================
 * 
 * Handles offset-based pagination logic.
 */

import { useState, useCallback, useMemo } from 'react'

interface UsePaginationOptions {
    pageSize: number
    totalCount?: number // Optional - not always known
    initialOffset?: number
}

interface UsePaginationReturn {
    offset: number
    currentPage: number
    totalPages: number | undefined // May be undefined if totalCount is unknown
    hasNext: boolean
    hasPrevious: boolean
    goToNext: () => void
    goToPrevious: () => void
    goToPage: (page: number) => void
    startIndex: number
    endIndex: number
}

export function usePagination(options: UsePaginationOptions): UsePaginationReturn {
    const { pageSize, totalCount, initialOffset = 0 } = options

    const [offset, setOffset] = useState(initialOffset)

    const currentPage = useMemo(() => {
        return Math.floor(offset / pageSize) + 1
    }, [offset, pageSize])

    const totalPages = useMemo(() => {
        // If totalCount is not known, return undefined
        return totalCount ? Math.ceil(totalCount / pageSize) : undefined
    }, [totalCount, pageSize])

    // Always allow "Next" - total count is not known, so we always allow loading next page
    // The API will return empty results if there are no more pages
    const hasNext = true

    const hasPrevious = useMemo(() => {
        return offset > 0
    }, [offset])

    const startIndex = useMemo(() => {
        return offset
    }, [offset])

    const endIndex = useMemo(() => {
        // If totalCount is known, use it; otherwise just use offset + pageSize
        return totalCount !== undefined
            ? Math.min(offset + pageSize, totalCount)
            : offset + pageSize
    }, [offset, pageSize, totalCount])

    // Always allow going to next page - API will handle if there are no more results
    const goToNext = useCallback(() => {
        setOffset(prev => prev + pageSize)
    }, [pageSize])

    const goToPrevious = useCallback(() => {
        if (hasPrevious) {
            setOffset(prev => Math.max(0, prev - pageSize))
        }
    }, [hasPrevious, pageSize])

    const goToPage = useCallback((page: number) => {
        const newOffset = (page - 1) * pageSize
        // Only validate against totalCount if it's known
        if (newOffset >= 0 && (totalCount === undefined || newOffset < totalCount)) {
            setOffset(newOffset)
        }
    }, [pageSize, totalCount])

    return {
        offset,
        currentPage,
        totalPages,
        hasNext,
        hasPrevious,
        goToNext,
        goToPrevious,
        goToPage,
        startIndex,
        endIndex
    }
}

