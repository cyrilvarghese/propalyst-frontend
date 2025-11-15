/**
 * PropertyFilters Component
 * =========================
 * 
 * Displays search and filter controls (search, cost, area, relevance sliders).
 * 
 * CONCEPT: Controlled Components
 * - Component doesn't manage own state
 * - Values come from props
 * - Changes trigger callbacks
 * - Parent decides what to do with changes
 * 
 * Benefits:
 * - Easy to test (just pass different props)
 * - Easy to reset (parent can reset state)
 * - Logic is in hook, UI is just rendering
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { PropertyFiltersProps } from '../types/listing.types'
import {
    COST_RANGE_STEP,
    AREA_RANGE_STEP,
} from '../constants/listing.constants'

/**
 * PropertyFilters Component
 * 
 * Shows four filters:
 * 1. Text search in titles and descriptions
 * 2. Cost range slider
 * 3. Area range slider
 * 4. Relevance threshold (for grouping)
 * 
 * @param props - See PropertyFiltersProps interface
 */
export function PropertyFilters({
    filters,
    costBounds,
    areaBounds,
    groupedProperties,
    onSearchChange,
    onCostChange,
    onAreaChange,
    onRelevanceChange,
}: PropertyFiltersProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* ================================================================ */}
            {/* FILTER 1: TEXT SEARCH */}
            {/* ================================================================ */}
            <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Search</label>
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search titles & descriptions..."
                            value={filters.searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-8 h-9 text-sm"
                        />
                    </div>
                </div>
            </Card>

            {/* ================================================================ */}
            {/* FILTER 2: COST RANGE */}
            {/* ================================================================ */}
            <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Price</label>
                    <div className="flex items-center">
                        <Slider
                            value={filters.costRange}
                            onValueChange={(value) => onCostChange(value as [number, number])}
                            min={costBounds.min}
                            max={costBounds.max}
                            step={COST_RANGE_STEP}
                            className="w-full"
                        />
                    </div>
                    <div className="text-center">
                        <span className="text-lg font-semibold text-gray-900">
                            ₹{filters.costRange[0]}Cr - ₹{filters.costRange[1]}Cr
                        </span>
                    </div>
                </div>
            </Card>

            {/* ================================================================ */}
            {/* FILTER 3: AREA RANGE */}
            {/* ================================================================ */}
            <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Area</label>
                    <div className="flex items-center">
                        <Slider
                            value={filters.areaRange}
                            onValueChange={(value) => onAreaChange(value as [number, number])}
                            min={areaBounds.min}
                            max={areaBounds.max}
                            step={AREA_RANGE_STEP}
                            className="w-full"
                        />
                    </div>
                    <div className="text-center">
                        <span className="text-lg font-semibold text-gray-900">
                            {filters.areaRange[0]} - {filters.areaRange[1]} sqft
                        </span>
                    </div>
                </div>
            </Card>

            {/* ================================================================ */}
            {/* FILTER 4: RELEVANCE THRESHOLD */}
            {/* ================================================================ */}
            <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700">
                            Relevance ≥ {filters.relevanceThreshold}
                        </label>
                        <Badge variant="outline" className="text-xs h-5">
                            {groupedProperties.mostRelevant.length}/
                            {groupedProperties.others.length}
                        </Badge>
                    </div>
                    <div className="flex items-center">
                        <Slider
                            value={[filters.relevanceThreshold]}
                            onValueChange={(value) => onRelevanceChange(value[0])}
                            min={0}
                            max={10}
                            step={1}
                            className="w-full"
                        />
                    </div>
                </div>
            </Card>
        </div>
    )
}

/**
 * LEARNING: Controlled Components
 * 
 * This component is "controlled" because:
 * 1. Values come from props (filters)
 * 2. Component doesn't change its own state
 * 3. Changes trigger callbacks (onSearchChange, onCostChange, etc.)
 * 4. Parent decides what to do with the changes
 * 
 * Benefits:
 * - Single source of truth (parent component)
 * - Easy to sync with URL params
 * - Easy to reset (parent sets state back to defaults)
 * - Easy to test (just pass different props)
 * - Easy to add logging/analytics (parent can log in callbacks)
 * 
 * Alternative: Uncontrolled Components
 * - Component manages own state
 * - Parent gets values via form submission
 * - Harder to test and sync
 * - Avoid in complex applications
 */

