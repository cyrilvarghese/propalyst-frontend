/**
 * RetryListingButton - Client Component
 * ======================================
 *
 * Button component that opens a dialog to retry/reprocess a listing.
 * The dialog shows preview of old vs new values before applying changes.
 */

'use client'

import { RefreshCw } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'
import RetryListingDialog from './RetryListingDialog'

interface RetryListingButtonProps {
    listing: CREAListing
}

export default function RetryListingButton({ listing }: RetryListingButtonProps) {
    return (
        <RetryListingDialog listing={listing}>
            <button
                className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-800 hover:underline border border-orange-300 rounded px-2 py-1 bg-orange-50 hover:bg-orange-100 transition-colors"
            >
                <RefreshCw className="h-3 w-3" />
                Retry Listing
            </button>
        </RetryListingDialog>
    )
}

