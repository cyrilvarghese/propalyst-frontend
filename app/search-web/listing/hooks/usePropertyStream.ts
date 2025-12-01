/**
 * usePropertyStream - Custom Hook for Streaming Properties via SSE
 * ================================================================
 *
 * Handles streaming property data from backend using Server-Sent Events (SSE).
 * Properties arrive incrementally as backend processes batches of 5.
 * 
 * Next.js Best Practices:
 * - Uses useRef to track EventSource for proper cleanup
 * - Functional state updates to avoid stale closures
 * - Proper cleanup on unmount or URL change
 * - Error handling for connection and data errors
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { PropertyScrapeService, SquareYardsProperty, MagicBricksProperty, detectSourceFromUrl } from '@/lib/services/property-scrape.service'

interface UsePropertyStreamReturn {
    properties: SquareYardsProperty[] | MagicBricksProperty[]
    isLoading: boolean
    error: Error | null
    isComplete: boolean
    apiCallsMade: number | null
    source: string
    relevanceScore?: number
    relevanceReason?: string
}

/**
 * Custom hook for streaming properties via SSE
 * 
 * @param url - The property listing URL to scrape
 * @param origQuery - Optional original search query for relevance scoring
 * @returns Object with properties array (accumulating), loading state, error, and completion status
 */
export function usePropertyStream(url: string, origQuery?: string): UsePropertyStreamReturn {
    const [properties, setProperties] = useState<SquareYardsProperty[] | MagicBricksProperty[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [isComplete, setIsComplete] = useState(false)
    const [apiCallsMade, setApiCallsMade] = useState<number | null>(null)
    const [source, setSource] = useState<string>('unknown')
    const [relevanceScore, setRelevanceScore] = useState<number | undefined>(undefined)
    const [relevanceReason, setRelevanceReason] = useState<string | undefined>(undefined)

    // Use useRef to track EventSource instance for proper cleanup
    const eventSourceRef = useRef<EventSource | null>(null)
    // Track if stream completed successfully to avoid false error on close
    const completedRef = useRef<boolean>(false)

    useEffect(() => {
        // Reset state when URL changes
        setProperties([])
        setIsLoading(true)
        setError(null)
        setIsComplete(false)
        setApiCallsMade(null)
        setSource('unknown')
        setRelevanceScore(undefined)
        setRelevanceReason(undefined)
        completedRef.current = false

        // Close existing EventSource if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }

        if (!url) {
            setIsLoading(false)
            setIsComplete(true)
            return
        }

        // Detect source for initial state
        const detectedSource = detectSourceFromUrl(url)
        setSource(detectedSource)

        // Create EventSource for streaming
        const eventSource = PropertyScrapeService.createPropertyStream(url, origQuery)
        eventSourceRef.current = eventSource

        // Listen for 'property' events - each event contains a single property
        eventSource.addEventListener('property', (event: MessageEvent) => {
            try {
                const property = JSON.parse(event.data) as SquareYardsProperty | MagicBricksProperty

                // Use functional state update to avoid stale closures
                setProperties(prev => [...prev, property])

                console.log('📥 Received property:', property.title || 'No title')
            } catch (err) {
                console.error('❌ Error parsing property event:', err)
                // Don't set error state for individual property parse errors, just log
            }
        })

        // Listen for 'complete' event - signals end of stream
        eventSource.addEventListener('complete', (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data)
                const count = data.count || 0
                const apiCalls = data.api_calls_made || null

                completedRef.current = true // Mark as completed successfully
                setApiCallsMade(apiCalls)
                setIsComplete(true)
                setIsLoading(false)

                // Check for top-level relevance (MagicBricks format)
                if (data.relevance_score !== undefined) {
                    setRelevanceScore(data.relevance_score)
                    setRelevanceReason(data.relevance_reason)
                }

                console.log('✅ Stream complete:', count, 'properties received with', apiCalls, 'API calls')

                // Close EventSource when complete
                eventSource.close()
                eventSourceRef.current = null
            } catch (err) {
                console.error('❌ Error parsing complete event:', err)
                setError(new Error('Failed to parse completion data'))
                setIsComplete(true)
                setIsLoading(false)
                eventSource.close()
                eventSourceRef.current = null
            }
        })

        // Listen for 'error' events from server
        eventSource.addEventListener('error', (event: MessageEvent) => {
            try {
                const errorData = JSON.parse(event.data)
                const errorMessage = errorData.error || 'Unknown error from server'
                console.error('❌ Server error event:', errorMessage)
                setError(new Error(errorMessage))
                setIsComplete(true)
                setIsLoading(false)
                eventSource.close()
                eventSourceRef.current = null
            } catch (err) {
                // If error event data is not JSON, use generic error
                console.error('❌ Error event (non-JSON):', event.data)
                setError(new Error(event.data || 'Stream error occurred'))
                setIsComplete(true)
                setIsLoading(false)
                eventSource.close()
                eventSourceRef.current = null
            }
        })

        // Handle EventSource connection errors
        eventSource.onerror = (err) => {
            // Don't handle error if we've already completed successfully
            if (completedRef.current) {
                return
            }

            // Check if EventSource is closed (might be normal completion)
            if (eventSource.readyState === EventSource.CLOSED) {
                // If closed but not marked as completed, it's likely a connection error
                // Set error state - the 'complete' event handler should have been called if successful
                console.error('❌ EventSource closed without completion event')
                setError(new Error('Connection error: Stream closed unexpectedly'))
                setIsLoading(false)
                setIsComplete(true)
                eventSourceRef.current = null
                return
            }

            // For other error states (CONNECTING), log but don't set error
            // EventSource will try to reconnect automatically
            console.warn('⚠️ EventSource error (may reconnect):', err, 'readyState:', eventSource.readyState)
        }

        // Cleanup function: close EventSource when component unmounts or URL changes
        return () => {
            if (eventSourceRef.current) {
                console.log('🧹 Cleaning up EventSource')
                eventSourceRef.current.close()
                eventSourceRef.current = null
            }
        }
    }, [url, origQuery]) // Only depend on URL and origQuery

    return {
        properties,
        isLoading,
        error,
        isComplete,
        apiCallsMade,
        source,
        relevanceScore,
        relevanceReason,
    }
}

