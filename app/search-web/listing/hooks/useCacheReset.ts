/**
 * useCacheReset Hook
 * ===================
 * 
 * Custom hook to manage cache reset functionality.
 * Handles API call, loading state, and error handling.
 * 
 * CONCEPT: Async Logic in Hooks
 * - Encapsulates async operations (API calls)
 * - Manages loading, success, and error states
 * - Keeps components clean from async complexity
 */

import { useState, useCallback } from 'react'
import { CacheResetState, UseCacheResetReturn, INITIAL_CACHE_STATE } from '../types/listing.types'
import { 
    DEFAULT_API_BASE_URL, 
    CACHE_RESET_RELOAD_DELAY,
    ERROR_MESSAGE_DURATION,
} from '../constants/listing.constants'

/**
 * Custom hook for cache reset functionality
 * 
 * @param url - The property URL whose cache should be reset
 * @returns Cache state and reset function
 */
export function useCacheReset(url: string): UseCacheResetReturn {
    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================

    /**
     * Manage cache reset state
     * 
     * CONCEPT: State Machine Pattern
     * - State represents where we are in the async operation
     * - isDeleting: operation in progress
     * - success: operation completed successfully
     * - error: operation failed with error message
     * 
     * This prevents impossible states like "loading AND error at the same time"
     */
    const [cacheState, setCacheState] = useState<CacheResetState>(INITIAL_CACHE_STATE)

    // ========================================================================
    // RESET CACHE FUNCTION
    // ========================================================================

    /**
     * Function to reset cache for the given URL
     * 
     * CONCEPT: useCallback Hook
     * - Memoizes the function so it doesn't change on every render
     * - Important when passing functions as props
     * - Prevents unnecessary re-renders of child components
     * 
     * WHY USECALLBACK?
     * Without it: New function created on every render → children re-render
     * With it: Same function reference → children don't re-render unnecessarily
     * 
     * Dependency array: [url] means "create new function only if url changes"
     */
    const resetCache = useCallback(async () => {
        // Guard clause: Don't proceed if no URL
        if (!url) return

        // STEP 1: Set loading state
        setCacheState({
            isDeleting: true,
            success: false,
            error: null,
        })

        try {
            // STEP 2: Call DELETE API
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL
            const encodedUrl = encodeURIComponent(url)
            
            const response = await fetch(
                `${API_BASE_URL}/api/scraped_properties/by_url?url=${encodedUrl}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            // STEP 3: Handle HTTP errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ 
                    detail: 'Unknown error' 
                }))
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
            }

            // STEP 4: Success - update state and reload page
            setCacheState({
                isDeleting: false,
                success: true,
                error: null,
            })

            // Give user time to see success message, then reload
            setTimeout(() => {
                window.location.reload()
            }, CACHE_RESET_RELOAD_DELAY)

        } catch (error) {
            // STEP 5: Error handling
            console.error('Error resetting cache:', error)
            
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Failed to reset cache'

            setCacheState({
                isDeleting: false,
                success: false,
                error: errorMessage,
            })

            // Auto-clear error message after duration
            setTimeout(() => {
                setCacheState(prev => ({
                    ...prev,
                    error: null,
                }))
            }, ERROR_MESSAGE_DURATION)
        }
    }, [url])  // ← Recreate function only when URL changes

    // ========================================================================
    // RETURN PUBLIC API
    // ========================================================================

    return {
        cacheState,
        resetCache,
    }
}

/**
 * LEARNING: Why Extract This Into a Hook?
 * 
 * BEFORE (in component):
 * - 40+ lines of async logic mixed with UI
 * - Hard to test without rendering component
 * - Can't reuse in other components
 * - State management scattered
 * 
 * AFTER (with hook):
 * - Clean separation: logic vs UI
 * - Can test hook independently
 * - Reusable across components
 * - Single responsibility: just cache reset
 * 
 * Component becomes:
 * ```
 * const { cacheState, resetCache } = useCacheReset(url)
 * return <button onClick={resetCache}>Reset</button>
 * ```
 * 
 * Much cleaner! ✨
 */


