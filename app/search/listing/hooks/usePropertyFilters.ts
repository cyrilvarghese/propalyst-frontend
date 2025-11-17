/**
 * usePropertyFilters Hook
 * =======================
 * 
 * Custom hook to manage property filtering and grouping logic.
 * Extracts complex state management from the component.
 * 
 * CONCEPT: Custom Hooks
 * - Extract reusable stateful logic
 * - Make components cleaner and more focused
 * - Easier to test and maintain
 */

import { useState, useMemo, useEffect } from 'react'
import { extractPrice, extractArea } from '../utils/property-utils'
import { MagicBricksProperty } from '@/lib/services/property-scrape.service'
import {
    PropertyType,
    PropertyFilters,
    RangeBounds,
    GroupedProperties,
    UsePropertyFiltersReturn,
    DEFAULT_FILTERS,
    EMPTY_GROUPED_PROPERTIES,
} from '../types/listing.types'
import {
    DEFAULT_MIN_COST_CRORES,
    DEFAULT_MAX_COST_CRORES,
    DEFAULT_MIN_AREA_SQFT,
    DEFAULT_MAX_AREA_SQFT,
    RUPEES_PER_CRORE,
    AREA_ROUNDING_FACTOR,
} from '../constants/listing.constants'

/**
 * Custom hook for managing property filters
 * 
 * @param properties - Array of properties to filter
 * @returns Filter state, bounds, grouped properties, and update functions
 * 
 * LEARNING: Hook Parameters
 * - Hooks can accept parameters just like regular functions
 * - This makes them flexible and reusable
 */
export function usePropertyFilters(properties: PropertyType[]): UsePropertyFiltersReturn {
    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================

    /**
     * CONCEPT: useState Hook
     * - Creates a piece of state
     * - Returns [currentValue, setterFunction]
     * - When state changes, component re-renders
     * - Initial value is set only once (on mount)
     */
    const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS)

    // ========================================================================
    // CALCULATE BOUNDS (for slider min/max)
    // ========================================================================

    /**
     * Calculate min/max cost from properties
     * 
     * CONCEPT: useMemo Hook
     * - Memoizes (caches) expensive calculations
     * - Only recalculates when dependencies change
     * - Dependency array: [properties] means "recalculate when properties change"
     * 
     * WHY USEMEMO?
     * Without it, this calculation runs on EVERY render (even when properties didn't change)
     * With it, calculation only runs when properties actually change
     */
    const costBounds = useMemo<RangeBounds>(() => {
        // Return default bounds if no properties
        if (properties.length === 0) {
            return {
                min: DEFAULT_MIN_COST_CRORES,
                max: DEFAULT_MAX_COST_CRORES
            }
        }

        // Extract all prices and filter out invalid ones
        const prices = properties
            .map(p => extractPrice(p.price || '0'))
            .filter(p => p > 0)

        // If no valid prices, return defaults
        if (prices.length === 0) {
            return {
                min: DEFAULT_MIN_COST_CRORES,
                max: DEFAULT_MAX_COST_CRORES
            }
        }

        // Find min/max and convert to crores
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        const min = Math.floor(minPrice / RUPEES_PER_CRORE)
        const max = Math.ceil(maxPrice / RUPEES_PER_CRORE)

        return {
            min: Math.max(0, min),
            max: Math.max(DEFAULT_MAX_COST_CRORES, max)
        }
    }, [properties])  // ← Dependency array: only recalculate when properties change

    /**
     * Calculate min/max area from properties
     * 
     * Same pattern as costBounds, but for area in square feet
     */
    const areaBounds = useMemo<RangeBounds>(() => {
        if (properties.length === 0) {
            return {
                min: DEFAULT_MIN_AREA_SQFT,
                max: DEFAULT_MAX_AREA_SQFT
            }
        }

        const areas = properties
            .map(p => {
                // Handle both property types (MagicBricks has different area fields)
                const area = p.area ||
                    ((p as MagicBricksProperty).carpet_area) ||
                    ((p as MagicBricksProperty).super_area) ||
                    '0'
                return extractArea(area)
            })
            .filter(a => a > 0)

        if (areas.length === 0) {
            return {
                min: DEFAULT_MIN_AREA_SQFT,
                max: DEFAULT_MAX_AREA_SQFT
            }
        }

        const minArea = Math.min(...areas)
        const maxArea = Math.max(...areas)

        // Round to nearest 100 for cleaner slider values
        const min = Math.floor(minArea / AREA_ROUNDING_FACTOR) * AREA_ROUNDING_FACTOR
        const max = Math.ceil(maxArea / AREA_ROUNDING_FACTOR) * AREA_ROUNDING_FACTOR

        return {
            min: Math.max(0, min),
            max: Math.max(DEFAULT_MAX_AREA_SQFT, max)
        }
    }, [properties])

    // ========================================================================
    // AUTO-INITIALIZE RANGES
    // ========================================================================

    /**
     * Initialize cost range when bounds are first calculated
     * 
     * CONCEPT: useEffect Hook
     * - Runs side effects after render
     * - Dependency array controls when it runs
     * - Can synchronize state with external changes
     * 
     * WHY USEEFFECT?
     * We need to update costRange state when bounds change,
     * but only if it's still at the default value
     */
    useEffect(() => {
        // Only update if still at default max value
        if (filters.costRange[1] === DEFAULT_MAX_COST_CRORES && costBounds.max > DEFAULT_MAX_COST_CRORES) {
            setFilters(prev => ({
                ...prev,  // Keep other filter values
                costRange: [costBounds.min, costBounds.max]  // Update only costRange
            }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [costBounds])  // Run when costBounds changes

    /**
     * Initialize area range when bounds are first calculated
     */
    useEffect(() => {
        if (filters.areaRange[1] === DEFAULT_MAX_AREA_SQFT && areaBounds.max > DEFAULT_MAX_AREA_SQFT) {
            setFilters(prev => ({
                ...prev,
                areaRange: [areaBounds.min, areaBounds.max]
            }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [areaBounds])

    // ========================================================================
    // FILTER AND GROUP PROPERTIES
    // ========================================================================

    /**
     * Helper function to categorize property by date string
     * Returns 'today', 'thisWeek', 'thisMonth', or 'previousMonths'
     */
    const getDateCategory = (property: PropertyType): 'today' | 'thisWeek' | 'thisMonth' | 'previousMonths' => {
        const mbProperty = property as MagicBricksProperty
        const postedDate = mbProperty.posted_date || ''
        const dateStr = postedDate.toLowerCase()

        // Check if posted today (contains "hour" or "hours" or "today")
        if (dateStr.includes('hour') || dateStr.includes('today')) {
            return 'today'
        }

        // Check if posted this week (yesterday or within last 7 days)
        if (dateStr.includes('yesterday')) {
            return 'thisWeek'
        }

        // Check for "X days ago" - if 7 or less, it's this week
        const daysMatch = dateStr.match(/(\d+)\s+days?\s+ago/)
        if (daysMatch) {
            const daysAgo = parseInt(daysMatch[1])
            if (daysAgo <= 7) {
                return 'thisWeek'
            }
        }

        // Check if posted this month (contains current month name)
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase()
        if (dateStr.includes(currentMonth)) {
            return 'thisMonth'
        }

        // Check for weeks - if less than 4 weeks and in current month, it's this month
        const weeksMatch = dateStr.match(/(\d+)\s+weeks?\s+ago/)
        if (weeksMatch) {
            const weeksAgo = parseInt(weeksMatch[1])
            const now = new Date()
            const estimatedDate = new Date(now)
            estimatedDate.setDate(estimatedDate.getDate() - (weeksAgo * 7))

            // If still in current month
            if (estimatedDate.getMonth() === now.getMonth() &&
                estimatedDate.getFullYear() === now.getFullYear()) {
                return 'thisMonth'
            }
        }

        // Everything else is previous months
        return 'previousMonths'
    }

    /**
     * Filter properties and group by relevance, then by date
     * 
     * This is the "business logic" - separated from UI rendering
     */
    const groupedProperties = useMemo<GroupedProperties>(() => {
        // Start with all properties
        let filtered = properties

        // STEP 1: Filter by search query (searches both title and description)
        if (filters.searchQuery.trim()) {
            const searchLower = filters.searchQuery.toLowerCase().trim()
            filtered = filtered.filter(p => {
                const title = (p.title || '').toLowerCase()
                const desc = (p.description || '').toLowerCase()
                return title.includes(searchLower) || desc.includes(searchLower)
            })
        }

        // STEP 2: Filter by cost range
        const [minCost, maxCost] = filters.costRange
        filtered = filtered.filter(p => {
            const price = extractPrice(p.price || '0')
            const priceInCrores = price / RUPEES_PER_CRORE
            return priceInCrores >= minCost && priceInCrores <= maxCost
        })

        // STEP 3: Filter by area range
        const [minArea, maxArea] = filters.areaRange
        filtered = filtered.filter(p => {
            const area = p.area ||
                ((p as MagicBricksProperty).carpet_area) ||
                ((p as MagicBricksProperty).super_area) ||
                '0'
            const areaValue = extractArea(area)
            return areaValue >= minArea && areaValue <= maxArea
        })

        // STEP 4: Group by relevance threshold
        const mostRelevant = filtered.filter(
            p => (p.relevance_score ?? 0) >= filters.relevanceThreshold
        )
        const others = filtered.filter(
            p => (p.relevance_score ?? 0) < filters.relevanceThreshold
        )

        // STEP 5: Sort by relevance score (descending)
        const sortByRelevance = (a: PropertyType, b: PropertyType) => {
            const scoreA = a.relevance_score ?? -1
            const scoreB = b.relevance_score ?? -1
            return scoreB - scoreA
        }

        const sortedMostRelevant = [...mostRelevant].sort(sortByRelevance)
        const sortedOthers = [...others].sort(sortByRelevance)

        // STEP 6: Sub-group each relevance group by date category
        const groupByDate = (properties: PropertyType[]) => {
            const today: PropertyType[] = []
            const thisWeek: PropertyType[] = []
            const thisMonth: PropertyType[] = []
            const previousMonths: PropertyType[] = []

            properties.forEach(p => {
                const category = getDateCategory(p)
                if (category === 'today') {
                    today.push(p)
                } else if (category === 'thisWeek') {
                    thisWeek.push(p)
                } else if (category === 'thisMonth') {
                    thisMonth.push(p)
                } else {
                    previousMonths.push(p)
                }
            })

            return { today, thisWeek, thisMonth, previousMonths }
        }

        return {
            mostRelevant: groupByDate(sortedMostRelevant),
            others: groupByDate(sortedOthers),
        }
    }, [properties, filters])  // Recalculate when properties OR filters change

    // ========================================================================
    // UPDATE FUNCTIONS
    // ========================================================================

    /**
     * CONCEPT: State Update Functions
     * - Instead of exposing setFilters directly, we provide specific update functions
     * - This gives us control over HOW state is updated
     * - Makes the API clearer for components using this hook
     * 
     * PATTERN: Partial State Updates
     * - Use spread operator (...prev) to keep other properties
     * - Only update the specific field that changed
     */

    const updateSearchQuery = (query: string) => {
        setFilters(prev => ({ ...prev, searchQuery: query }))
    }

    const updateCostRange = (range: [number, number]) => {
        setFilters(prev => ({ ...prev, costRange: range }))
    }

    const updateAreaRange = (range: [number, number]) => {
        setFilters(prev => ({ ...prev, areaRange: range }))
    }

    const updateRelevanceThreshold = (threshold: number) => {
        setFilters(prev => ({ ...prev, relevanceThreshold: threshold }))
    }

    // ========================================================================
    // RETURN PUBLIC API
    // ========================================================================

    /**
     * CONCEPT: Hook Return Value
     * - Return everything the component needs
     * - Hide internal implementation details
     * - Create a clean, documented API
     */
    return {
        filters,
        costBounds,
        areaBounds,
        groupedProperties,
        updateSearchQuery,
        updateCostRange,
        updateAreaRange,
        updateRelevanceThreshold,
    }
}

