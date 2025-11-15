/**
 * PropertyGrid Component
 * ======================
 * 
 * Displays properties in a grid, grouped by relevance.
 * 
 * CONCEPT: Compound Components
 * - Component is made of smaller pieces
 * - Each section has clear responsibility
 * - Easy to modify layout without changing logic
 */

import { Fragment } from 'react'
import { Badge } from '@/components/ui/badge'
import CompactPropertyCard from './CompactPropertyCard'
import CompactMagicBricksCard from './CompactMagicBricksCard'
import { PropertyGridProps } from '../types/listing.types'
import { EmptyResultsState } from './EmptyStates'

/**
 * PropertyGrid Component
 * 
 * Shows properties in two sections:
 * 1. Most Relevant (score >= threshold)
 * 2. Others (score < threshold)
 * 
 * @param props - See PropertyGridProps interface
 */
export function PropertyGrid({
    groupedProperties,
    isMagicBricks,
    relevanceThreshold,
    isComplete,
}: PropertyGridProps) {
    const hasProperties =
        groupedProperties.mostRelevant.length > 0 || groupedProperties.others.length > 0

    // ========================================================================
    // RENDER: No properties found
    // ========================================================================
    if (!hasProperties && isComplete) {
        return <EmptyResultsState />
    }

    // ========================================================================
    // RENDER: Properties found
    // ========================================================================
    if (hasProperties) {
        return (
            <div className="space-y-6">
                {/* ============================================================ */}
                {/* SECTION 1: MOST RELEVANT PROPERTIES */}
                {/* ============================================================ */}
                {groupedProperties.mostRelevant.length > 0 && (
                    <div>
                        {/* Section Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Matching Properties (Score ≥ {relevanceThreshold})
                            </h3>
                            <Badge className="bg-green-500 text-white text-xs">
                                {groupedProperties.mostRelevant.length}
                            </Badge>
                        </div>

                        {/* Grid of Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {groupedProperties.mostRelevant.map((property, index) => {
                                // Use property URL as key if available
                                const key =
                                    typeof property.property_url === 'string'
                                        ? property.property_url
                                        : `most-relevant-${index}`

                                return (
                                    <Fragment key={key}>
                                        {isMagicBricks ? (
                                            <CompactMagicBricksCard
                                                property={property as any}
                                            />
                                        ) : (
                                            <CompactPropertyCard property={property as any} />
                                        )}
                                    </Fragment>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ============================================================ */}
                {/* SECTION 2: OTHER PROPERTIES */}
                {/* ============================================================ */}
                {groupedProperties.others.length > 0 && (
                    <div>
                        {/* Section Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-gray-700">
                                Others (Score &lt; {relevanceThreshold})
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                                {groupedProperties.others.length}
                            </Badge>
                        </div>

                        {/* Grid of Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {groupedProperties.others.map((property, index) => {
                                const key =
                                    typeof property.property_url === 'string'
                                        ? property.property_url
                                        : `others-${index}`

                                return (
                                    <Fragment key={key}>
                                        {isMagicBricks ? (
                                            <CompactMagicBricksCard
                                                property={property as any}
                                            />
                                        ) : (
                                            <CompactPropertyCard property={property as any} />
                                        )}
                                    </Fragment>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // No properties and still loading
    return null
}

/**
 * LEARNING: Grid Layout Pattern
 * 
 * Structure:
 * 1. Check if data exists
 * 2. Return appropriate view:
 *    - Empty state
 *    - Grid with sections
 *    - Loading state (null)
 * 
 * Grid Classes:
 * - grid-cols-1: 1 column on mobile
 * - md:grid-cols-2: 2 columns on tablet
 * - lg:grid-cols-3: 3 columns on desktop
 * 
 * Benefits:
 * - Responsive without media queries
 * - Easy to adjust columns
 * - Tailwind handles all screen sizes
 * 
 * Card Rendering:
 * - Choose component based on source (isMagicBricks)
 * - Use Fragment to avoid extra wrapper divs
 * - Key ensures React tracks components correctly
 */


