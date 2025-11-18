/**
 * usePropertyBatch - Custom Hook for Fetching Properties
 * =======================================================
 *
 * Handles fetching property data from batch API.
 * Returns all properties at once after scraping completes.
 */

import { useState, useEffect } from 'react'
import { PropertyScrapeService, SquareYardsProperty, MagicBricksProperty } from '@/lib/services/property-scrape.service'

interface UsePropertyBatchReturn {
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
 * Custom hook for fetching properties in batch
 * 
 * @param url - The property listing URL to scrape
 * @param origQuery - Optional original search query for relevance scoring
 * @returns Object with properties array, loading state, error, and completion status
 */
export function usePropertyBatch(url: string, origQuery?: string): UsePropertyBatchReturn {
  const [properties, setProperties] = useState<SquareYardsProperty[] | MagicBricksProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [apiCallsMade, setApiCallsMade] = useState<number | null>(null)
  const [source, setSource] = useState<string>('unknown')
  const [relevanceScore, setRelevanceScore] = useState<number | undefined>(undefined)
  const [relevanceReason, setRelevanceReason] = useState<string | undefined>(undefined)

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

    if (!url) {
      setIsLoading(false)
      setIsComplete(true)
      return
    }

    // Fetch properties in batch
    const fetchProperties = async () => {
      try {
        const result = await PropertyScrapeService.fetchPropertiesBatch(url, origQuery, 10)
        setProperties(result.properties)
        setApiCallsMade(result.api_calls_made || null)
        setSource(result.source || 'unknown')

        // Check if this is a MagicBricks response with top-level relevance
        if ('relevance_score' in result && result.relevance_score !== undefined) {
          setRelevanceScore(result.relevance_score)
          setRelevanceReason(result.relevance_reason)
        }

        setIsComplete(true)
      } catch (err) {
        console.error('❌ Fetch error:', err)
        setError(err as Error)
        setIsComplete(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [url, origQuery])

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




