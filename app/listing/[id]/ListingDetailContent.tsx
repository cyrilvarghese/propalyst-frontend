/**
 * ListingDetailContent - Client Component
 * ========================================
 *
 * Client component that fetches and displays listing information in a mobile-friendly card format.
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Phone, MessageSquare, ChevronDown, ChevronUp, User, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import WhatsAppMessageDialog from '@/app/whatsapp-obs/components/WhatsAppMessageDialog'
import { CREAListing } from '@/lib/services/crea-listings.service'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const API_BASE_URL = ''

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
            month: 'short',
            day: 'numeric'
        })
    }

    const getWhatsAppLink = (phone: string): string => {
        const cleanPhone = phone.replace(/\D/g, '')
        const whatsappNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`
        return `https://wa.me/${whatsappNumber}`
    }

    const getCallLink = (phone: string): string => {
        const cleanPhone = phone.replace(/\D/g, '')
        return `tel:${cleanPhone}`
    }

    const processed = listingData?.processed
    const raw = listingData?.raw

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/search')}
                    >
                        <div className="relative h-10 w-32 md:h-10 md:w-40">
                            <Image
                                src="/propalyst-mls-logo.png"
                                alt="Propalyst MLS"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </button>
                    <Link href="/search" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                        Back to Search
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                        <span className="text-gray-500 text-sm">Loading listing details...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="py-20 text-center max-w-md mx-auto">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Property</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button
                            onClick={() => router.push('/search')}
                            variant="outline"
                            className="rounded-full px-6"
                        >
                            Return to Search
                        </Button>
                    </div>
                )}

                {/* Listing Content */}
                {listingData && !isLoading && !error && processed && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        {/* Title & Price Section */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                    {processed.property_type?.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'Property'}
                                    {processed.bedroom_count ? ` ${processed.bedroom_count} BHK` : ''}
                                    {processed.project_name ? ` in ${processed.project_name}` : processed.location ? ` in ${processed.location}` : ''}
                                </h1>
                                {processed.location && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium">{processed.location}</span>
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 font-medium">
                                    Listed on {formatDate(processed.message_date || processed.created_at)}
                                </div>
                            </div>
                            <div className="flex flex-col md:items-end">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {formatPrice(processed.price)}
                                </div>
                                {processed.price_text && formatPrice(processed.price).replace(/[₹,]/g, '') !== processed.price_text.replace(/[Rs,]/gi, '').trim() && (
                                    <p className="text-sm text-gray-500 mt-1">{processed.price_text}</p>
                                )}
                            </div>
                        </div>

                        {/* Image Gallery */}
                        {processed.images && processed.images.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400">Property Photos</h3>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 thin-scrollbar">
                                    {processed.images.map((imageUrl: string, index: number) => (
                                        <div key={index} className="relative w-64 md:w-96 h-48 md:h-64 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                            <Image
                                                src={imageUrl}
                                                alt={`Property image ${index + 1}`}
                                                fill
                                                unoptimized={true}
                                                className="object-cover transition-opacity hover:opacity-95"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                            {/* Main Details */}
                            <div className="md:col-span-8 space-y-10">
                                {/* Key Details Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Type</p>
                                        <p className="text-sm font-bold text-gray-900 capitalize">{processed.property_type || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bedrooms</p>
                                        <p className="text-sm font-bold text-gray-900">{processed.bedroom_count ? `${processed.bedroom_count} BHK` : 'N/A'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Furnishing</p>
                                        <p className="text-sm font-bold text-gray-900 capitalize">{processed.furnishing_status?.replace(/_/g, ' ') || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Project</p>
                                        <p className="text-sm font-bold text-gray-900">{processed.project_name || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-100" />

                                {/* Highlights */}
                                {processed.special_features && processed.special_features.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Highlights</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {processed.special_features.map((feature: string, index: number) => (
                                                <span key={index} className="px-3 py-1 bg-white text-gray-700 text-xs font-medium border border-gray-200 rounded-full shadow-sm">
                                                    {feature.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Listing Description */}
                                {raw?.message_text && (
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h3>
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {raw.message_text}
                                            </div>
                                        </div>
                                    </div>
                                )}


                            </div>

                            {/* Sidebar Contact */}
                            <div className="md:col-span-4 space-y-8">
                                <div className="bg-white border border-gray-100 rounded-2xl shadow-lg shadow-gray-200/50 p-6 space-y-6 sticky top-24">
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Person</p>
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <User className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                    {processed.agent_name || raw?.sender_name || 'Verified Agent'}
                                                </h3>
                                                {processed.company_name && (
                                                    <p className="text-xs text-gray-500 font-medium">{processed.company_name}</p>
                                                )}
                                                {processed.agent_contact && (
                                                    <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">
                                                        {processed.agent_contact}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {processed.agent_contact && (
                                        <div className="flex flex-col gap-3 pt-2">
                                            <Button
                                                onClick={() => window.open(getWhatsAppLink(processed.agent_contact || ''), '_blank')}
                                                className="w-full bg-gray-900 text-white rounded-xl font-bold h-12 shadow-sm hover:bg-gray-900 transition-none"
                                            >
                                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                                Chat on WhatsApp
                                            </Button>

                                            <Button
                                                onClick={() => window.open(getCallLink(processed.agent_contact || ''), '_blank')}
                                                variant="outline"
                                                className="w-full border-gray-200 text-gray-700 rounded-xl font-bold h-12 hover:bg-transparent hover:text-gray-700 transition-none"
                                            >
                                                <Phone className="w-4 h-4 mr-2" />
                                                Call Agent
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-6 px-6 bg-gray-100 border-t border-gray-200 mt-20">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 text-xs md:text-sm text-gray-600">
                    <span className="text-center md:text-left">
                        © 2026 <a href="https://propalyst.com" target="_blank" rel="noopener noreferrer" className="text-[#e74c3c]">Propalyst</a>. All rights reserved.
                    </span>
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <span>Want to add your listing?</span>
                        <a
                            href="https://chat.whatsapp.com/J827YjNq8RU5Zwf0NWhXHY"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs md:text-sm font-medium rounded-full transition-colors"
                        >
                            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Join
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
