/**
 * RetryListingButton - Client Component
 * ======================================
 *
 * Button component that retries/updates a listing using the PATCH API.
 */

'use client'

import { useState } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { CREAListing, CREAListingsService } from '@/lib/services/crea-listings.service'

interface RetryListingButtonProps {
    listing: CREAListing
}

export default function RetryListingButton({ listing }: RetryListingButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const retryListing = async () => {
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            // Update the listing - this will trigger a retry/reprocess
            const response = await CREAListingsService.updateListing(listing.id, {
                // You can pass any fields that need to be updated here
                // For a retry, we might just update the listing to trigger reprocessing
            })

            if (response.success && response.status === 'updated') {
                setSuccess(true)
                setTimeout(() => {
                    setSuccess(false)
                    // Optionally reload the page or refresh the listing
                    if (typeof window !== 'undefined') {
                        window.location.reload()
                    }
                }, 1500)
            } else {
                throw new Error(response.message || 'Failed to update listing')
            }
        } catch (err: any) {
            console.error('Error retrying listing:', err)
            setError(err.message || 'Failed to retry listing')
            setTimeout(() => setError(null), 3000)
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <button
                disabled
                className="inline-flex items-center gap-1.5 text-xs text-green-600 border border-green-300 rounded px-2 py-1 bg-green-50 transition-colors cursor-not-allowed"
            >
                <RefreshCw className="h-3 w-3" />
                ✓ Updated!
            </button>
        )
    }

    if (error) {
        return (
            <button
                onClick={retryListing}
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 hover:underline border border-red-300 rounded px-2 py-1 bg-red-50 hover:bg-red-100 transition-colors"
                title={error}
            >
                <RefreshCw className="h-3 w-3" />
                Retry (Error)
            </button>
        )
    }

    return (
        <button
            onClick={retryListing}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-800 hover:underline border border-orange-300 rounded px-2 py-1 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Retrying...
                </>
            ) : (
                <>
                    <RefreshCw className="h-3 w-3" />
                    Retry Listing
                </>
            )}
        </button>
    )
}

