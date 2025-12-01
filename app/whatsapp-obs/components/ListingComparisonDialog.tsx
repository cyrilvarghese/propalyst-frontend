/**
 * ListingComparisonDialog - Client Component
 * ===========================================
 *
 * Dialog component that fetches and displays comparison data between processed and raw listings.
 */

'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'
import ListingComparisonTable from './ListingComparisonTable'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ComparisonData {
    processed: any
    raw: any
    comparison: {
        dates_match: boolean
        exact_text_match: boolean
        has_raw_message: boolean
    }
}

interface ListingComparisonDialogProps {
    listing: CREAListing
    children: React.ReactNode
}

export default function ListingComparisonDialog({ listing, children }: ListingComparisonDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchComparisonData = async () => {
        if (comparisonData) return // Already loaded

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE_URL}/api/whatsapp-listings/${listing.id}/source`)
            
            if (!response.ok) {
                throw new Error(`Failed to fetch comparison data: ${response.statusText}`)
            }

            const result = await response.json()
            
            if (result.success && result.data) {
                setComparisonData(result.data)
            } else {
                throw new Error(result.message || 'Failed to load comparison data')
            }
        } catch (err: any) {
            console.error('Error fetching comparison data:', err)
            setError(err.message || 'Failed to load comparison data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open && !comparisonData) {
            fetchComparisonData()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Listing Comparison - {listing.id}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-base text-gray-600">Loading comparison data...</span>
                        </div>
                    ) : error ? (
                        <div className="text-base text-red-600 py-4">
                            {error}
                        </div>
                    ) : comparisonData ? (
                        <ListingComparisonTable data={comparisonData} />
                    ) : (
                        <div className="text-base text-gray-500 py-4">
                            No comparison data available
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}


