/**
 * Listing Page Constants
 * ======================
 * 
 * Centralized constants for the property listing page.
 * Extracting these makes the code more maintainable and self-documenting.
 */

// ============================================================================
// PRICE CONSTANTS
// ============================================================================

/**
 * Conversion factor: 1 Crore = 10,000,000 Rupees
 * Used to convert property prices between rupees and crores
 */
export const RUPEES_PER_CRORE = 10000000

/**
 * Default minimum cost range in crores
 * Used as initial value for cost filter slider
 */
export const DEFAULT_MIN_COST_CRORES = 0

/**
 * Default maximum cost range in crores
 * Used as initial value before actual property prices are calculated
 */
export const DEFAULT_MAX_COST_CRORES = 10

/**
 * Slider step for cost range (in crores)
 * Allows filtering by 0.1 crore increments (1 lakh rupees)
 */
export const COST_RANGE_STEP = 0.1

// ============================================================================
// AREA CONSTANTS
// ============================================================================

/**
 * Default minimum area in square feet
 * Used as initial value for area filter slider
 */
export const DEFAULT_MIN_AREA_SQFT = 0

/**
 * Default maximum area in square feet
 * Used as initial value before actual property areas are calculated
 */
export const DEFAULT_MAX_AREA_SQFT = 10000

/**
 * Slider step for area range (in sqft)
 * Allows filtering by 100 sqft increments
 */
export const AREA_RANGE_STEP = 100

/**
 * Rounding factor for area bounds
 * Areas are rounded to nearest 100 sqft for cleaner slider values
 */
export const AREA_ROUNDING_FACTOR = 100

// ============================================================================
// RELEVANCE CONSTANTS
// ============================================================================

/**
 * Default relevance threshold for grouping properties
 * Properties with score >= 5 are shown in "Most Relevant" section
 * Scale: 0-10 where 10 is most relevant
 */
export const DEFAULT_RELEVANCE_THRESHOLD = 5

/**
 * Minimum relevance score
 */
export const MIN_RELEVANCE_SCORE = 0

/**
 * Maximum relevance score
 */
export const MAX_RELEVANCE_SCORE = 10

/**
 * Slider step for relevance threshold
 */
export const RELEVANCE_STEP = 1

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

/**
 * Delay before reloading page after cache reset (in milliseconds)
 * Gives user time to see success message before reload
 */
export const CACHE_RESET_RELOAD_DELAY = 500

/**
 * Duration to show success message (in milliseconds)
 * Message auto-hides after this duration
 */
export const SUCCESS_MESSAGE_DURATION = 3000

/**
 * Duration to show error message (in milliseconds)
 * Error messages stay visible longer for user to read
 */
export const ERROR_MESSAGE_DURATION = 5000

// ============================================================================
// API CONSTANTS
// ============================================================================

/**
 * Default API base URL
 * Falls back to localhost if environment variable not set
 */
export const DEFAULT_API_BASE_URL = 'http://localhost:8000'

/**
 * Property source identifiers
 * Used to determine which card component to render
 */
export const PROPERTY_SOURCES = {
  MAGIC_BRICKS: 'magicbricks',
  SQUARE_YARDS: 'squareyards',
  UNKNOWN: 'unknown',
} as const

// ============================================================================
// GRID LAYOUT CONSTANTS
// ============================================================================

/**
 * Number of columns for property grid on different screen sizes
 * Used for calculating layout and spacing
 */
export const GRID_COLUMNS = {
  MOBILE: 1,
  TABLET: 2,
  DESKTOP: 3,
} as const

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Property source type (derived from PROPERTY_SOURCES)
 * This creates a union type: 'magicbricks' | 'squareyards' | 'unknown'
 */
export type PropertySource = typeof PROPERTY_SOURCES[keyof typeof PROPERTY_SOURCES]


