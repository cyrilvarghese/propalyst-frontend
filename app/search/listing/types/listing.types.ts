/**
 * Listing Page Type Definitions
 * ==============================
 * 
 * Centralized type definitions for the property listing page.
 * This improves type safety and makes the code self-documenting.
 */

import { ScrapedProperty, MagicBricksProperty } from '@/lib/services/property-scrape.service'

// ============================================================================
// PROPERTY TYPES
// ============================================================================

/**
 * Union type for all supported property types
 * 
 * CONCEPT: Union Types (A | B)
 * - Means "either type A OR type B"
 * - TypeScript will ensure you handle both cases
 * - Use when data can be one of multiple shapes
 */
export type PropertyType = ScrapedProperty | MagicBricksProperty

/**
 * Helper to check if a property is MagicBricks type
 * 
 * CONCEPT: Type Guards
 * - Functions that help TypeScript narrow types
 * - After calling this, TypeScript knows the specific type
 */
export function isMagicBricksProperty(property: PropertyType): property is MagicBricksProperty {
    // MagicBricks has carpet_area, SquareYards doesn't
    return 'carpet_area' in property
}

// ============================================================================
// FILTER STATE TYPES
// ============================================================================

/**
 * Range filter type - used for cost and area sliders
 * 
 * CONCEPT: Tuple Types
 * - [number, number] means exactly 2 numbers
 * - Different from number[] which can have any length
 * - Use when you need fixed-length arrays
 */
export type RangeFilter = [number, number]

/**
 * Bounds for slider ranges (min/max values)
 * 
 * CONCEPT: Interface vs Type Alias
 * - interface: Better for object shapes, can be extended
 * - type: Better for unions, tuples, primitives
 * - Use interface for objects you might extend later
 */
export interface RangeBounds {
    min: number
    max: number
}

/**
 * Filter state for property filtering
 * 
 * This interface defines all the filter values a user can set.
 * Grouping related state makes it easier to pass around and manage.
 */
export interface PropertyFilters {
    /** Text search in property descriptions */
    searchQuery: string

    /** Price range filter in crores */
    costRange: RangeFilter

    /** Area range filter in square feet */
    areaRange: RangeFilter

    /** Minimum relevance score for "Most Relevant" grouping */
    relevanceThreshold: number
}

/**
 * Initial/default filter values
 * 
 * CONCEPT: Type + Value Pairing
 * - Define both the type AND default values
 * - Ensures defaults always match the interface shape
 * - Single source of truth for initial state
 */
export const DEFAULT_FILTERS: PropertyFilters = {
    searchQuery: '',
    costRange: [0, 10],
    areaRange: [0, 10000],
    relevanceThreshold: 5,
}

// ============================================================================
// CACHE MANAGEMENT TYPES
// ============================================================================

/**
 * Cache reset state
 * 
 * CONCEPT: State Machine Pattern
 * - Represents the different states of an async operation
 * - Makes it clear what state you're in
 * - Prevents impossible states (can't be loading AND error at same time)
 */
export interface CacheResetState {
    /** Is cache deletion in progress? */
    isDeleting: boolean

    /** Did cache deletion succeed? */
    success: boolean

    /** Error message if deletion failed */
    error: string | null
}

/**
 * Initial cache reset state
 */
export const INITIAL_CACHE_STATE: CacheResetState = {
    isDeleting: false,
    success: false,
    error: null,
}

// ============================================================================
// GROUPED PROPERTIES TYPES
// ============================================================================

/**
 * Properties grouped by relevance score
 * 
 * This structure separates high-scoring properties from others,
 * making it easy to render them in different sections.
 */
export interface GroupedProperties {
    /** Properties meeting the relevance threshold */
    mostRelevant: PropertyType[]

    /** Properties below the relevance threshold */
    others: PropertyType[]
}

/**
 * Empty grouped properties (no properties loaded yet)
 */
export const EMPTY_GROUPED_PROPERTIES: GroupedProperties = {
    mostRelevant: [],
    others: [],
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Props for ListingHeader component
 * 
 * CONCEPT: Component Props Interface
 * - Defines the "contract" for component props
 * - Makes it clear what data component needs
 * - IDE will autocomplete and validate props
 */
export interface ListingHeaderProps {
    /** Current URL being scraped */
    url: string

    /** Original search query (optional) */
    origQuery?: string

    /** Number of properties found */
    propertyCount: number

    /** Is data currently loading? */
    isLoading: boolean

    /** Cache reset state */
    cacheState: CacheResetState

    /** Callback when reset cache button is clicked */
    onResetCache: () => void
}

/**
 * Props for PropertyFilters component
 */
export interface PropertyFiltersProps {
    /** Current filter values */
    filters: PropertyFilters

    /** Bounds for cost slider (calculated from actual property prices) */
    costBounds: RangeBounds

    /** Bounds for area slider (calculated from actual property areas) */
    areaBounds: RangeBounds

    /** Grouped properties (for showing counts in relevance filter) */
    groupedProperties: GroupedProperties

    /** Callback when search query changes */
    onSearchChange: (query: string) => void

    /** Callback when cost range changes */
    onCostChange: (range: RangeFilter) => void

    /** Callback when area range changes */
    onAreaChange: (range: RangeFilter) => void

    /** Callback when relevance threshold changes */
    onRelevanceChange: (threshold: number) => void
}

/**
 * Props for PropertyGrid component
 */
export interface PropertyGridProps {
    /** Grouped properties to display */
    groupedProperties: GroupedProperties

    /** Is this MagicBricks source? (determines which card to render) */
    isMagicBricks: boolean

    /** Current relevance threshold (for section headers) */
    relevanceThreshold: number

    /** Is loading complete with no results? */
    isComplete: boolean
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for usePropertyFilters hook
 * 
 * CONCEPT: Custom Hook Types
 * - Defines what the hook returns
 * - Makes hook usage clear and type-safe
 * - Documents hook's public API
 */
export interface UsePropertyFiltersReturn {
    /** Current filter values */
    filters: PropertyFilters

    /** Calculated bounds for cost slider */
    costBounds: RangeBounds

    /** Calculated bounds for area slider */
    areaBounds: RangeBounds

    /** Properties after filtering and grouping */
    groupedProperties: GroupedProperties

    /** Filter update functions */
    updateSearchQuery: (query: string) => void
    updateCostRange: (range: RangeFilter) => void
    updateAreaRange: (range: RangeFilter) => void
    updateRelevanceThreshold: (threshold: number) => void
}

/**
 * Return type for useCacheReset hook
 */
export interface UseCacheResetReturn {
    /** Current cache reset state */
    cacheState: CacheResetState

    /** Function to trigger cache reset */
    resetCache: () => Promise<void>
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract area value from property (works for both property types)
 * 
 * CONCEPT: Function Type Signatures
 * - Defines input and output types for functions
 * - Makes function contracts explicit
 * - Helps with documentation
 */
export type ExtractAreaFn = (property: PropertyType) => string

/**
 * Sort comparator function type
 */
export type PropertyComparator = (a: PropertyType, b: PropertyType) => number

/**
 * Filter predicate function type
 * 
 * CONCEPT: Predicate Functions
 * - Functions that return boolean (true/false)
 * - Used for filtering arrays
 * - Type makes it clear what the function does
 */
export type PropertyPredicate = (property: PropertyType) => boolean

