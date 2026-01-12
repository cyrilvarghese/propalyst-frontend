/**
 * ResultCard - Google-style Search Result Card
 * =============================================
 *
 * Clean, readable card with clear labels for each field.
 * Expandable to show full message/description.
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Phone, MapPin, Home, User, Calendar, Tag, Copy, Bug, Code, Compass, Armchair, Car, CheckCircle2, ExternalLink } from 'lucide-react'
import { WhatsAppListing, RBProperty } from '@/lib/api/whatsapp-listings'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import RetryListingButton from '@/app/whatsapp-obs/components/RetryListingButton'
import CopyDebugSQLButton from '@/app/whatsapp-obs/components/CopyDebugSQLButton'
import CompareListingButton from '@/app/whatsapp-obs/components/CompareListingButton'
import { CREAListing } from '@/lib/services/crea-listings.service'

interface ResultCardProps {
    listing?: WhatsAppListing
    property?: RBProperty
}

function formatPrice(price: number | null, priceText?: string | null): string {
    if (priceText) return priceText
    if (!price) return 'Price on request'

    if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L`
    }
    return `₹${price.toLocaleString('en-IN')}`
}

function formatPropertyType(type: string | null): string {
    if (!type) return 'Property'
    return type.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return ''
    try {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    } catch {
        return ''
    }
}

function getMessageTypeBadge(messageType: string | null): { label: string; color: string; bgColor: string } {
    switch (messageType) {
        case 'supply_sale':
            return { label: 'For Sale', color: 'text-green-700', bgColor: 'bg-green-100' }
        case 'supply_rent':
            return { label: 'For Rent', color: 'text-blue-700', bgColor: 'bg-blue-100' }
        case 'demand_buy':
            return { label: 'Looking to Buy', color: 'text-orange-700', bgColor: 'bg-orange-100' }
        case 'demand_rent':
            return { label: 'Looking to Rent', color: 'text-purple-700', bgColor: 'bg-purple-100' }
        default:
            return { label: '', color: '', bgColor: '' }
    }
}

export default function ResultCard({ listing, property }: ResultCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const searchParams = useSearchParams()
    const isDebug = searchParams.get('debug') === 'true'

    const handleCopyLink = () => {
        // Construct a link that highlights this specific result
        // For now, we'll use the ID parameter which we can support in the parent later
        const link = `${window.location.origin}${window.location.pathname}?highlight=${data?.id}`
        navigator.clipboard.writeText(link)
        // You might want to add a toast here, but for now we'll just rely on the action
    }

    const data = property || listing
    if (!data) return null

    // Extract data with fallbacks
    const location = property?.location || listing?.location || 'Location not specified'
    const assetType = formatPropertyType(property?.property_type || listing?.property_type || null)
    const price = formatPrice(data.price, data.price_text)
    const bedrooms = data.bedrooms
    const sqft = property?.sqft || listing?.area_sqft
    const agentName = data.agent_name || listing?.sender_name || 'Agent'
    const agentContact = data.agent_contact
    const projectName = data.project_name
    const date = formatDate(data.created_at)
    const messageType = listing?.message_type || property?.message_type || null
    const { label: typeBadge, color: typeColor, bgColor: typeBg } = getMessageTypeBadge(messageType ?? null)

    // Full description
    const rawMessage = listing?.raw_message || property?.description
    const furnishing = data.furnishing_status
    const facing = data.facing_direction

    // Build a nice title
    const title = projectName
        ? `${assetType} in ${projectName}`
        : `${assetType} in ${location}`
    return (
        <div className="py-5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
            <div className="flex flex-col">
                {/* Header Row: Responsive Layout (Moved up for mobile to be above image) */}
                <div className="flex flex-col md:flex-row md:items-center md:gap-2 mb-2 text-sm">

                    {/* Mobile: Top Row (Location + Date) | Desktop: Start (Location) */}
                    <div className="flex items-start justify-between w-full md:w-auto md:justify-start gap-2">
                        <span className="text-gray-500 flex items-start gap-1 flex-1 md:flex-initial text-left">
                            <MapPin className="w-3 h-3 mt-1 shrink-0" />
                            <span className="leading-snug">{location}</span>
                        </span>

                        {/* Date - Visible on Mobile here */}
                        {date && (
                            <span className="text-gray-400 text-xs whitespace-nowrap shrink-0 mt-0.5 md:hidden">{date}</span>
                        )}
                    </div>

                    {/* Desktop: Separator & Date */}
                    {date && (
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400 whitespace-nowrap">{date}</span>
                        </div>
                    )}

                    {/* Badge - Mobile: New Line | Desktop: Auto-left (pushed to end) */}
                    {typeBadge && (
                        <div className="mt-1 md:mt-0 md:ml-auto">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium inline-block ${typeBg} ${typeColor}`}>
                                {typeBadge}
                            </span>
                        </div>
                    )}
                </div>

                {/* Mobile Single Photo - Only visible on mobile */}
                {property?.images && property.images.length > 0 && (
                    <div className="md:hidden mb-3 relative w-full h-48 rounded-lg overflow-hidden border bg-gray-100">
                        <Image
                            src={property.images[0]}
                            alt={title}
                            fill
                            unoptimized={true}
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Desktop Gallery - Always visible on desktop */}
                {property?.images && property.images.length > 0 && (
                    <div className="hidden md:flex gap-2 overflow-x-auto pb-2 mb-4 thin-scrollbar">
                        {property.images.map((imageUrl, index) => (
                            <div key={index} className="relative w-64 h-48 flex-shrink-0 rounded-lg overflow-hidden border shadow-sm">
                                <Image
                                    src={imageUrl}
                                    alt={`Property image ${index + 1}`}
                                    fill
                                    unoptimized={true}
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Title */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-left w-full group"
                        >
                            <h3 className="text-base md:text-lg font-medium text-blue-700 group-hover:underline mb-2 leading-snug">
                                {title}
                            </h3>
                        </button>

                        {/* Key Details Row */}
                        <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 text-sm text-gray-700 mb-2">
                            {/* Price */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-400 text-xs uppercase font-medium">Price</span>
                                <span className="font-semibold text-gray-900">{price}</span>
                            </div>

                            {/* Bedrooms */}
                            {bedrooms && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400 text-xs uppercase font-medium">BHK</span>
                                    <span className="font-medium">{bedrooms}</span>
                                </div>
                            )}

                            {/* Area */}
                            {sqft && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400 text-xs uppercase font-medium">Area</span>
                                    <span className="font-medium">{sqft.toLocaleString()} sqft</span>
                                </div>
                            )}

                            {/* Asset Type */}
                            <div className="flex items-center gap-1.5">
                                <Home className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium">{assetType}</span>
                            </div>
                        </div>

                        {/* Agent Info */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>{agentName}</span>
                            {agentContact && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <a href={`tel:${agentContact}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                                        <Phone className="w-3 h-3" />
                                        {agentContact}
                                    </a>
                                </>
                            )}
                        </div>

                        {/* Expand/Collapse Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    Less details
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    More details
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                        {/* Mobile Gallery (Only visible in expanded on mobile since desktop already shows it) */}
                        {property?.images && property.images.length > 0 && (
                            <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 thin-scrollbar">
                                {property.images.map((imageUrl, index) => (
                                    <div key={index} className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden border shadow-sm">
                                        <Image
                                            src={imageUrl}
                                            alt={`Property image ${index + 1}`}
                                            fill
                                            unoptimized={true}
                                            className="object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Additional Properties */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            {projectName && (
                                <div>
                                    <span className="text-gray-400">Project: </span>
                                    <span className="text-gray-900">{projectName}</span>
                                </div>
                            )}
                            {furnishing && (
                                <div>
                                    <span className="text-gray-400">Furnishing: </span>
                                    <span className="text-gray-900">{furnishing}</span>
                                </div>
                            )}
                            {facing && (
                                <div>
                                    <span className="text-gray-400">Facing: </span>
                                    <span className="text-gray-900">{facing}</span>
                                </div>
                            )}
                        </div>

                        {/* Original Message */}
                        {rawMessage && (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-400 mb-1 uppercase font-medium">Original Listing</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{rawMessage}</p>
                            </div>
                        )}

                        {/* Debug Info */}
                        {isDebug && listing && (
                            <div className="mt-4 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <RetryListingButton listing={listing as unknown as CREAListing} />
                                    <CopyDebugSQLButton listing={listing as unknown as CREAListing} />
                                    <CompareListingButton listing={listing as unknown as CREAListing} />
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-2 items-start">
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-start md:items-center">
                                {property ? (
                                    <>
                                        {property.static_html_url && (
                                            <a
                                                href={property.static_html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50/10 hover:bg-blue-100/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-colors w-fit"
                                            >
                                                <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                View Property Page
                                            </a>
                                        )}
                                        {property.agent_email && (
                                            <a
                                                href={`mailto:${property.agent_email}`}
                                                className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-600 hover:text-gray-700 bg-gray-50/10 hover:bg-gray-100/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-colors w-fit"
                                            >
                                                Email Agent
                                            </a>
                                        )}
                                    </>
                                ) : null}
                            </div>

                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-600 hover:text-gray-700 bg-gray-50/10 hover:bg-gray-100/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-colors w-fit"
                            >
                                <Copy className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                Copy Link
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
