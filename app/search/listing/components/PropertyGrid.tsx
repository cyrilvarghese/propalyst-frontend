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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CompactPropertyCard from './CompactPropertyCard'
import CompactMagicBricksCard from './CompactMagicBricksCard'
import { PropertyGridProps } from '../types/listing.types'
import { EmptyResultsState } from './EmptyStates'

/**
 * PropertyGrid Component
 * 
 * Shows properties in sections:
 * 1. Most Relevant (score >= threshold) - with date sub-groups
 * 2. Others (score < threshold) - with date sub-groups
 * 
 * Date sub-groups: Today → This Week → This Month → Previous Months
 * 
 * @param props - See PropertyGridProps interface
 */
export function PropertyGrid({
    groupedProperties,
    isMagicBricks,
    relevanceThreshold,
    isComplete,
}: PropertyGridProps) {
    const hasMostRelevant =
        groupedProperties.mostRelevant.today.length > 0 ||
        groupedProperties.mostRelevant.thisWeek.length > 0 ||
        groupedProperties.mostRelevant.thisMonth.length > 0 ||
        groupedProperties.mostRelevant.previousMonths.length > 0

    const hasOthers =
        groupedProperties.others.today.length > 0 ||
        groupedProperties.others.thisWeek.length > 0 ||
        groupedProperties.others.thisMonth.length > 0 ||
        groupedProperties.others.previousMonths.length > 0

    const hasProperties = hasMostRelevant || hasOthers

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
        const totalMostRelevant =
            groupedProperties.mostRelevant.today.length +
            groupedProperties.mostRelevant.thisWeek.length +
            groupedProperties.mostRelevant.thisMonth.length +
            groupedProperties.mostRelevant.previousMonths.length

        const totalOthers =
            groupedProperties.others.today.length +
            groupedProperties.others.thisWeek.length +
            groupedProperties.others.thisMonth.length +
            groupedProperties.others.previousMonths.length

        return (
            <div className="space-y-8">
                {/* ============================================================ */}
                {/* SECTION 1: MOST RELEVANT PROPERTIES */}
                {/* ============================================================ */}
                {hasMostRelevant && (
                    <div>
                        {/* Main Section Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Matching Properties (Score ≥ {relevanceThreshold})
                            </h3>
                            <Badge className="bg-green-500 text-white text-xs">
                                {totalMostRelevant}
                            </Badge>
                        </div>

                        {/* Date Tabs */}
                        <Tabs defaultValue="today" className="w-full">
                            <TabsList>
                                <TabsTrigger value="today">
                                    Today ({groupedProperties.mostRelevant.today.length})
                                </TabsTrigger>
                                <TabsTrigger value="thisWeek">
                                    This Week ({groupedProperties.mostRelevant.thisWeek.length})
                                </TabsTrigger>
                                <TabsTrigger value="thisMonth">
                                    This Month ({groupedProperties.mostRelevant.thisMonth.length})
                                </TabsTrigger>
                                <TabsTrigger value="previousMonths">
                                    Previous ({groupedProperties.mostRelevant.previousMonths.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="today">
                                {groupedProperties.mostRelevant.today.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedProperties.mostRelevant.today.map((property, index) => {
                                            const key =
                                                typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `most-relevant-today-${index}`
                                            return (
                                                <Fragment key={key}>
                                                    {isMagicBricks ? (
                                                        <CompactMagicBricksCard property={property as any} />
                                                    ) : (
                                                        <CompactPropertyCard property={property as any} />
                                                    )}
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No properties posted today
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="thisWeek">
                                {groupedProperties.mostRelevant.thisWeek.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedProperties.mostRelevant.thisWeek.map((property, index) => {
                                            const key =
                                                typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `most-relevant-thisweek-${index}`
                                            return (
                                                <Fragment key={key}>
                                                    {isMagicBricks ? (
                                                        <CompactMagicBricksCard property={property as any} />
                                                    ) : (
                                                        <CompactPropertyCard property={property as any} />
                                                    )}
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No properties posted this week
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="thisMonth">
                                {groupedProperties.mostRelevant.thisMonth.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedProperties.mostRelevant.thisMonth.map((property, index) => {
                                            const key =
                                                typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `most-relevant-thismonth-${index}`
                                            return (
                                                <Fragment key={key}>
                                                    {isMagicBricks ? (
                                                        <CompactMagicBricksCard property={property as any} />
                                                    ) : (
                                                        <CompactPropertyCard property={property as any} />
                                                    )}
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No properties posted this month
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="previousMonths">
                                {groupedProperties.mostRelevant.previousMonths.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedProperties.mostRelevant.previousMonths.map((property, index) => {
                                            const key =
                                                typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `most-relevant-previous-${index}`
                                            return (
                                                <Fragment key={key}>
                                                    {isMagicBricks ? (
                                                        <CompactMagicBricksCard property={property as any} />
                                                    ) : (
                                                        <CompactPropertyCard property={property as any} />
                                                    )}
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No properties from previous months
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* ============================================================ */}
                {/* SECTION 2: OTHER PROPERTIES */}
                {/* ============================================================ */}
                {hasOthers && (
                    <div>
                        {/* Main Section Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">
                                Others (Score &lt; {relevanceThreshold})
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                                {totalOthers}
                            </Badge>
                        </div>

                        {/* Date Tabs */}
                        <Tabs defaultValue="today" className="w-full">
                            <TabsList>
                                <TabsTrigger value="today">
                                    Today ({groupedProperties.others.today.length})
                                </TabsTrigger>
                                <TabsTrigger value="thisWeek">
                                    This Week ({groupedProperties.others.thisWeek.length})
                                </TabsTrigger>
                                <TabsTrigger value="thisMonth">
                                    This Month ({groupedProperties.others.thisMonth.length})
                                </TabsTrigger>
                                <TabsTrigger value="previousMonths">
                                    Previous ({groupedProperties.others.previousMonths.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="today">
                                {groupedProperties.others.today.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedProperties.others.today.map((property, index) => {
                                            const key =
                                                typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `others-today-${index}`
                                            return (
                                                <Fragment key={key}>
                                                    {isMagicBricks ? (
                                                        <CompactMagicBricksCard property={property as any} />
                                                    ) : (
                                                        <CompactPropertyCard property={property as any} />
                                                    )}
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No properties posted today
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="thisWeek">
                                {groupedProperties.others.thisWeek.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedProperties.others.thisWeek.map((property, index) => {
                                            const key =
                                                typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `others-thisweek-${index}`
                                            return (
                                                <Fragment key={key}>
                                                    {isMagicBricks ? (
                                                        <CompactMagicBricksCard property={property as any} />
                                                    ) : (
                                                        <CompactPropertyCard property={property as any} />
                                                    )}
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No properties posted this week
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="thisMonth">
                                {groupedProperties.others.thisMonth.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedProperties.others.thisMonth.map((property, index) => {
                                            const key =
                                                typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `others-thismonth-${index}`
                                            return (
                                                <Fragment key={key}>
                                                    {isMagicBricks ? (
                                                        <CompactMagicBricksCard property={property as any} />
                                                    ) : (
                                                        <CompactPropertyCard property={property as any} />
                                                    )}
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No properties posted this month
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="previousMonths">
                                {groupedProperties.others.previousMonths.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupedProperties.others.previousMonths.map((property, index) => {
                                            const key =
                                                typeof property.property_url === 'string'
                                                    ? property.property_url
                                                    : `others-previous-${index}`
                                            return (
                                                <Fragment key={key}>
                                                    {isMagicBricks ? (
                                                        <CompactMagicBricksCard property={property as any} />
                                                    ) : (
                                                        <CompactPropertyCard property={property as any} />
                                                    )}
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No properties from previous months
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
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


