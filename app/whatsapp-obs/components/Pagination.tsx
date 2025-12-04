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
        ? 'sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg rounded-t-lg px-4 py-1.5 z-50'
        : 'bg-white border-t border-gray-200 shadow-sm rounded-t-lg px-4 py-1.5'

    return (
        <div className={containerClassName}>
            <div className="flex items-center justify-between">
                {/* Item count display */}
                <div className="text-xs text-gray-600">
                    Showing {startIndex + 1} to {endIndex} {itemName}
                    {totalCount > 0 && endIndex <= totalCount && endIndex < totalCount && (
                        <> of {totalCount}</>
                    )}
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-1.5">
                    {/* Previous button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevious}
                        disabled={!hasPrevious}
                        className="h-7 px-2 text-xs"
                        aria-label="Go to previous page"
                    >
                        <ChevronLeft className="h-3 w-3 mr-0.5" />
                        Previous
                    </Button>

                    {/* Next button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNext}
                        disabled={!hasNext}
                        className="h-7 px-2 text-xs"
                        aria-label="Go to next page"
                    >
                        Next
                        <ChevronRight className="h-3 w-3 ml-0.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

