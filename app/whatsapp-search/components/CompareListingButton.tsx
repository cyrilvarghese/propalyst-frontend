/**
 * CompareListingButton - Client Component
 * ========================================
 *
 * Button component that opens a dialog to compare processed and raw listing data.
 */

'use client'

import { GitCompare } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'
import ListingComparisonDialog from './ListingComparisonDialog'

interface CompareListingButtonProps {
    listing: CREAListing
}

export default function CompareListingButton({ listing }: CompareListingButtonProps) {
    return (
        <ListingComparisonDialog listing={listing}>
            <button
                className="inline-flex items-center gap-1.5 text-xs text-green-700 hover:text-green-900 hover:underline border border-green-400 rounded px-2 py-1 bg-green-50 hover:bg-green-100 transition-colors"
            >
                <GitCompare className="h-3 w-3" />
                Compare Data
            </button>
        </ListingComparisonDialog>
    )
}

