/**
 * ListingDetailContent - Client Component
 * ========================================
 *
 * Client component that fetches and displays listing information in a mobile-friendly card format.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Phone, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import WhatsAppMessageDialog from '@/app/whatsapp-obs/components/WhatsAppMessageDialog'
import { CREAListing } from '@/lib/services/crea-listings.service'
import { Button } from '@/components/ui/button'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ListingData {
    processed: any
    raw: any
    comparison: {
        dates_match: boolean
        exact_text_match: boolean
        has_raw_message: boolean
    }
}

interface ListingDetailContentProps {
    listingId: string
}

export default function ListingDetailContent({ listingId }: ListingDetailContentProps) {
    const router = useRouter()
    const [listingData, setListingData] = useState<ListingData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showRawMessage, setShowRawMessage] = useState(false)

    useEffect(() => {
        const fetchListingData = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`${API_BASE_URL}/api/whatsapp-listings/${listingId}/source`)

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Listing not found')
                    }
                    throw new Error(`Failed to fetch listing data: ${response.statusText}`)
                }

                const result = await response.json()

                if (result.success && result.data) {
                    setListingData(result.data)
                } else {
                    throw new Error(result.message || 'Failed to load listing data')
                }
            } catch (err: any) {
                console.error('Error fetching listing data:', err)
                setError(err.message || 'Failed to load listing data')
            } finally {
                setIsLoading(false)
            }
        }

        if (listingId) {
            fetchListingData()
        }
    }, [listingId])

    const formatPrice = (price: number | null): string => {
        if (!price) return 'Price on request'
        if (price >= 10000000) {
            const crores = price / 10000000
            return `₹${crores.toFixed(2)} Cr`
        } else if (price >= 100000) {
            const lakhs = price / 100000
            return `₹${lakhs.toFixed(2)} L`
        }
        return `₹${price.toLocaleString('en-IN')}`
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getWhatsAppLink = (phone: string): string => {
        // Remove any non-digit characters
        const cleanPhone = phone.replace(/\D/g, '')
        // If it starts with 91, use it as is, otherwise add 91
        const whatsappNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`
        return `https://wa.me/${whatsappNumber}`
    }

    const getCallLink = (phone: string): string => {
        // Remove any non-digit characters
        const cleanPhone = phone.replace(/\D/g, '')
        return `tel:${cleanPhone}`
    }

    const processed = listingData?.processed
    const raw = listingData?.raw

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => router.push('/search')}
                        className="inline-flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Property Details
                    </h1>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <Card className="bg-white shadow-lg border p-4 sm:p-6">
                        <div className="flex items-center justify-center py-12 sm:py-16">
                            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-sm sm:text-base text-gray-600">Loading listing...</span>
                        </div>
                    </Card>
                )}

                {/* Error State */}
                {error && (
                    <Card className="bg-red-50 shadow-lg border border-red-200 p-4 sm:p-6">
                        <div className="text-center py-4">
                            <p className="text-red-700 font-semibold text-sm sm:text-base">{error}</p>
                            <button
                                onClick={() => router.back()}
                                className="mt-4 text-red-600 hover:text-red-800 underline text-sm"
                            >
                                Go back
                            </button>
                        </div>
                    </Card>
                )}

                {/* Listing Card */}
                {listingData && !isLoading && !error && processed && (
                    <Card className="bg-white shadow-lg border overflow-hidden">
                        {/* Property Header */}
                        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                                        {processed.property_type || 'Property'} {processed.bedroom_count ? `${processed.bedroom_count}BHK` : ''}
                                    </h2>
                                    {processed.location && (
                                        <p className="text-sm sm:text-base text-gray-600 flex items-center gap-1">
                                            📍 {processed.location}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {formatPrice(processed.price)}
                                    </div>
                                    {processed.price_text && (
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{processed.price_text}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-4 sm:p-6 space-y-4">
                            {/* Agent Contact - Always Show */}
                            <div className="border-b pb-4">
                                <h3 className="text-sm font-semibold text-gray-500 mb-2">Contact</h3>

                                {/* Agent Name or Sender Name */}
                                {(processed.agent_name || raw?.sender_name) && (
                                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                                        {processed.agent_name || raw?.sender_name}
                                    </p>
                                )}

                                {/* Company Name */}
                                {processed.company_name && (
                                    <p className="text-sm text-gray-600 mb-3">{processed.company_name}</p>
                                )}

                                {/* Phone Number */}
                                <div className="mb-3  flex flex-row flex-col-sm gap-6">
                                    <Button
                                        variant="outline"

                                        onClick={() => window.open(getCallLink(processed.agent_contact), '_blank')}
                                        className="w-full bg-accent text-accent-foreground"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Call {processed.agent_contact}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(getWhatsAppLink(processed.agent_contact), '_blank')}
                                        className="w-full bg-green-300 text-gray-900 hover:bg-green-400"

                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        WhatsApp {processed.agent_contact}
                                    </Button>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Bedrooms</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {processed.bedroom_count} BHK
                                    </p>
                                </div>

                                {processed.furnishing_status && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Furnishing</p>
                                        <p className="text-base font-medium text-gray-900 capitalize">
                                            {processed.furnishing_status.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                                {processed.facing_direction && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Facing</p>
                                        <p className="text-base font-medium text-gray-900 capitalize">
                                            {processed.facing_direction}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Special Features */}
                            {processed.special_features && processed.special_features.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Special Features</p>
                                    <div className="flex flex-wrap gap-2">
                                        {processed.special_features.map((feature: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {feature.replace(/_/g, ' ')}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Project Name */}
                            {processed.project_name && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Project</p>
                                    <p className="text-base font-medium text-gray-900">{processed.project_name}</p>
                                </div>
                            )}

                            {/* Message Date */}
                            {processed.message_date && (
                                <div className="text-xs text-gray-500 pt-2 border-t">
                                    Posted: {formatDate(processed.message_date)}
                                </div>
                            )}

                            {/* Raw Message Accordion (Debug) */}
                            {raw?.message_text && (
                                <div className="border-t pt-4 mt-4 pb-4 bg-gray-200 text-primary-foreground px-2 py-1 rounded-md">
                                    <button
                                        onClick={() => setShowRawMessage(!showRawMessage)}
                                        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <span className="font-medium ">Original Message</span>
                                        {showRawMessage ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </button>
                                    {showRawMessage && (
                                        <div className="mt-3 p-3 bg-white rounded-lg border">
                                            <p className="text-xs text-gray-500 mb-2">Source: {raw.source_file || 'N/A'} (Line {raw.line_number || 'N/A'})</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                                {raw.message_text}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}

