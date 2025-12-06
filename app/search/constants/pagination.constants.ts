/**
 * Pagination Constants
 * ====================
 * 
 * Centralized constants for pagination configuration.
 * These constants control how data is fetched and displayed in chunks.
 */

// ============================================================================
// BATCH FETCHING CONSTANTS
// ============================================================================

/**
 * Number of records to fetch per API call
 * This is the batch size that gets fetched from the backend
 */
export const BATCH_SIZE = 900

/**
 * Number of records to display per local page
 * This is how many records are shown to the user on each page
 */
export const LOCAL_PAGE_SIZE = 200

/**
 * Page number (within a batch) that triggers the next batch fetch
 * When user reaches this page, the next batch is prefetched in background
 * This is the second-to-last page in a batch (4th page out of 5)
 */
export const TRIGGER_PAGE = 4

// ============================================================================
// API DEFAULT VALUES
// ============================================================================

/**
 * Default limit for API calls when not specified
 * Used as fallback in API functions
 */
export const DEFAULT_API_LIMIT = 100

/**
 * Default offset for API calls when not specified
 * Used as fallback in API functions
 */
export const DEFAULT_API_OFFSET = 0

// ============================================================================
// CALCULATED CONSTANTS
// ============================================================================

/**
 * Number of local pages per batch
 * Calculated from BATCH_SIZE / LOCAL_PAGE_SIZE (should be 5)
 */
export const PAGES_PER_BATCH = Math.ceil(BATCH_SIZE / LOCAL_PAGE_SIZE)

