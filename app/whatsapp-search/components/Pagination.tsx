/**
 * Pagination - Client Component
 * =============================
 *
 * Simple pagination component with Previous/Next buttons and item count display.
 */

'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    onPrevious: () => void
    onNext: () => void
    hasPrevious: boolean
    hasNext: boolean
    startIndex: number
    endIndex: number
    totalCount: number
    itemName?: string // e.g., "listings", "items", "results" (default: "items")
    sticky?: boolean // Whether to use sticky positioning (default: true)
}

export default function Pagination({
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    startIndex,
    endIndex,
    totalCount,
    itemName = 'items',
    sticky = true
}: PaginationProps) {
    const containerClassName = sticky
        ? 'sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg rounded-t-lg p-4 z-50'
        : 'bg-white border-t border-gray-200 shadow-sm rounded-t-lg p-4'

    return (
        <div className={containerClassName}>
            <div className="flex items-center justify-between">
                {/* Item count display */}
                <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalCount)} of {totalCount} {itemName}
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                    {/* Previous button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevious}

                        aria-label="Go to previous page"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>

                    {/* Next button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNext}

                        aria-label="Go to next page"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

