/**
 * RetryListingDialog - Client Component
 * ======================================
 *
 * Dialog component that shows preview of LLM reprocessing results
 * with old vs new values and allows applying the update.
 */

'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RetryListingDialogProps {
    listing: CREAListing
    children: React.ReactNode
}

interface RetryPreviewResponse {
    success: boolean
    listing_id: string
    status: string
    old_result: any
    new_result: any
    changes: {
        [key: string]: {
            old: any
            new: any
            changed: boolean
        }
    }
    message: string
}

interface UpdateListingResponse {
    success: boolean
    listing_id: string
    status: string
    updated_record?: any
    message: string
}

export default function RetryListingDialog({ listing, children }: RetryListingDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [previewData, setPreviewData] = useState<RetryPreviewResponse | null>(null)
    const [isLoadingPreview, setIsLoadingPreview] = useState(false)
    const [isApplying, setIsApplying] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const fetchPreview = async () => {
        if (previewData) return // Already loaded

        setIsLoadingPreview(true)
        setError(null)
        setSuccess(false)

        try {
            const response = await fetch(`${API_BASE_URL}/api/whatsapp-raw/retry-listing/${listing.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
                throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`)
            }

            const result: RetryPreviewResponse = await response.json()

            if (result.success) {
                setPreviewData(result)
            } else {
                throw new Error(result.message || 'Failed to generate preview')
            }
        } catch (err: any) {
            console.error('Error fetching retry preview:', err)
            setError(err.message || 'Failed to load preview')
        } finally {
            setIsLoadingPreview(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open && !previewData) {
            fetchPreview()
        }
        // Reset state when closing
        if (!open) {
            setError(null)
            setSuccess(false)
        }
    }

    const handleApply = async () => {
        if (!previewData?.new_result) return

        setIsApplying(true)
        setError(null)

        try {
            // Apply the update using PATCH endpoint
            const response = await fetch(`${API_BASE_URL}/api/whatsapp-raw/listings/${listing.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(previewData.new_result),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
                throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`)
            }

            const result: UpdateListingResponse = await response.json()

            if (result.success && result.status === 'updated') {
                setSuccess(true)
                // Close dialog after a short delay
                setTimeout(() => {
                    setIsOpen(false)
                    // Reload the page to show updated data
                    if (typeof window !== 'undefined') {
                        window.location.reload()
                    }
                }, 1500)
            } else {
                throw new Error(result.message || 'Failed to update listing')
            }
        } catch (err: any) {
            console.error('Error applying update:', err)
            setError(err.message || 'Failed to apply update')
        } finally {
            setIsApplying(false)
        }
    }

    const handleRetry = () => {
        // Reset and fetch new preview
        setPreviewData(null)
        setError(null)
        setSuccess(false)
        fetchPreview()
    }

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return 'null'
        if (typeof value === 'boolean') return value ? 'true' : 'false'
        if (Array.isArray(value)) return value.join(', ')
        return String(value)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Retry Listing - {listing.id}</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {isLoadingPreview ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-base text-gray-600">Generating preview...</span>
                        </div>
                    ) : error ? (
                        <div className="text-base text-red-600 py-4">
                            {error}
                        </div>
                    ) : success ? (
                        <div className="flex items-center justify-center py-8">
                            <CheckCircle2 className="h-12 w-12 text-green-600 mr-3" />
                            <div>
                                <p className="text-lg font-semibold text-green-600">Listing updated successfully!</p>
                                <p className="text-sm text-gray-500">Reloading page...</p>
                            </div>
                        </div>
                    ) : previewData ? (
                        <>
                            {/* Changes Only */}
                            {previewData.changes && Object.keys(previewData.changes).length > 0 ? (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-700">Changes Detected:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {Object.entries(previewData.changes).map(([key, change]) => {
                                            if (!change.changed) return null
                                            return (
                                                <div key={key} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                                    <div className="text-xs font-medium text-gray-600">{key}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-red-600 line-through">
                                                            {formatValue(change.old)}
                                                        </span>
                                                        <ArrowRight className="h-3 w-3 text-gray-400" />
                                                        <span className="text-xs text-green-600 font-medium">
                                                            {formatValue(change.new)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-base text-gray-500 py-4 text-center">
                                    No changes detected
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-base text-gray-500 py-4">
                            No preview data available
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {previewData && !success && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleRetry}
                                disabled={isApplying || isLoadingPreview}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                            <Button
                                onClick={handleApply}
                                disabled={isApplying || isLoadingPreview}
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Apply Changes
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

