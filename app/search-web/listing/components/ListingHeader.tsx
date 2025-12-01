/**
 * ListingHeader Component
 * =======================
 * 
 * Displays title, property count, URL, and cache reset button.
 * 
 * CONCEPT: Container Component with Props
 * - Receives all data via props
 * - Doesn't manage its own state
 * - Easy to test (just pass different props)
 * - Easy to reuse (works with any data shape matching props interface)
 */

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ListingHeaderProps } from '../types/listing.types'
import { safeDecodeURIComponent } from '../utils/property-utils'

/**
 * ListingHeader Component
 * 
 * @param props - See ListingHeaderProps interface for details
 */
export function ListingHeader({
    url,
    origQuery,
    propertyCount,
    isLoading,
    cacheState,
    onResetCache,
}: ListingHeaderProps) {
    // Decode URL and query for display
    const displayUrl = url ? safeDecodeURIComponent(url) : ''
    const displayQuery = origQuery ? safeDecodeURIComponent(origQuery) : ''

    return (
        <div className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6 mb-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left Side: Title and Info */}
                <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                        {/* Title Section */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900">
                                Property Listings
                            </h2>

                            {/* Result Count and Query - Line 1 (max 2 lines) */}
                            {propertyCount > 0 && origQuery ? (
                                <p className="text-sm text-gray-500 mt-1 break-words line-clamp-2">
                                    Found {propertyCount}{' '}
                                    {propertyCount === 1 ? 'property' : 'properties'} matching "{displayQuery}"
                                </p>
                            ) : (
                                <p className="text-sm text-gray-600 mt-1 break-words line-clamp-2">
                                    No properties found for the query "{displayQuery}"
                                </p>
                            )}

                            {/* URL Display - Line 2 (single line) */}
                            {displayUrl && (
                                <p className="text-xs text-gray-500 mt-1 break-all line-clamp-1">
                                    <a
                                        href={displayUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                                    >
                                        {displayUrl}
                                    </a>
                                </p>
                            )}

                            {/* Loading Badge */}
                            {isLoading && (
                                <div className="text-xs text-gray-600 bg-indigo-100 px-3 py-1.5 rounded-full font-medium mt-2">
                                    Loading...
                                </div>
                            )}

                            {/* Success Message */}
                            {cacheState.success && (
                                <div className="text-xs text-green-600 bg-green-100 px-3 py-1.5 rounded-full font-medium mt-2">
                                    Cache reset successfully, reloading...
                                </div>
                            )}

                            {/* Error Message */}
                            {cacheState.error && (
                                <div className="text-xs text-red-600 bg-red-100 px-3 py-1.5 rounded-full font-medium mt-2">
                                    {cacheState.error}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Reset Cache Button */}
                        {displayUrl && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onResetCache}
                                disabled={cacheState.isDeleting}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                                <Trash2 className="w-4 h-4" />
                                {cacheState.isDeleting ? 'Resetting...' : 'Reset Cache'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * LEARNING: Component Structure
 * 
 * 1. TYPE INTERFACE
 *    - Define what props component receives
 *    - TypeScript validates them
 * 
 * 2. DESTRUCTURE PROPS
 *    - Extract individual props from interface
 *    - Makes it clear what component uses
 * 
 * 3. PREPARE DATA
 *    - Decode URLs, format strings, etc.
 *    - But keep component logic minimal
 * 
 * 4. RENDER JSX
 *    - Focus on UI, not business logic
 *    - Use props to control display
 * 
 * 5. EXPORT
 *    - Make component available to other files
 */


