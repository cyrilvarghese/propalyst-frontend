/**
 * usePagination - Custom Hook
 * ==========================
 * 
 * Handles offset-based pagination logic.
 */

import { useState, useCallback, useMemo } from 'react'

interface UsePaginationOptions {
    pageSize: number
    totalCount: number
    initialOffset?: number
}

interface UsePaginationReturn {
    offset: number
    currentPage: number
    totalPages: number
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
        return Math.ceil(totalCount / pageSize)
    }, [totalCount, pageSize])

    const hasNext = useMemo(() => {
        return offset + pageSize < totalCount
    }, [offset, pageSize, totalCount])

    const hasPrevious = useMemo(() => {
        return offset > 0
    }, [offset])

    const startIndex = useMemo(() => {
        return offset
    }, [offset])

    const endIndex = useMemo(() => {
        return Math.min(offset + pageSize, totalCount)
    }, [offset, pageSize, totalCount])

    const goToNext = useCallback(() => {
        if (hasNext) {
            setOffset(prev => prev + pageSize)
        }
    }, [hasNext, pageSize])

    const goToPrevious = useCallback(() => {
        if (hasPrevious) {
            setOffset(prev => Math.max(0, prev - pageSize))
        }
    }, [hasPrevious, pageSize])

    const goToPage = useCallback((page: number) => {
        const newOffset = (page - 1) * pageSize
        if (newOffset >= 0 && newOffset < totalCount) {
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

