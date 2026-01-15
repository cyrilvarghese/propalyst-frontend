/**
 * ResultCard - Google-style Search Result Card
 * =============================================
 *
 * Clean, readable card with clear labels for each field.
 * Expandable to show full message/description.
 */

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Phone, MapPin, Home, User, Calendar, Tag, Copy, Bug, Code, Compass, Armchair, Car, CheckCircle2, ExternalLink, MessageSquare } from 'lucide-react'
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

    const handleOpenLink = () => {
        // For RB properties, use external static_html_url; otherwise use internal listing page
        if (property?.static_html_url) {
            window.open(property.static_html_url, '_blank')
        } else if (data?.id) {
            window.open(`/listing/${data.id}`, '_blank')
        }
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
                        <div
                            onClick={handleOpenLink}
                            className="text-left w-full group cursor-pointer"
                        >
                            <h3 className="text-base md:text-lg font-medium text-blue-700 group-hover:underline mb-2 leading-snug">
                                {title}
                            </h3>
                        </div>

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
                                                className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-blue-600 bg-blue-50/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full w-fit"
                                            >
                                                <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                View Property Page
                                            </a>
                                        )}
                                        {property.agent_email && (
                                            <a
                                                href={`mailto:${property.agent_email}`}
                                                className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-600 bg-gray-50/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full w-fit"
                                            >
                                                Email Agent
                                            </a>
                                        )}
                                    </>
                                ) : null}
                            </div>

                            {agentContact && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const cleanPhone = agentContact.replace(/\D/g, '');
                                        const whatsappNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                                        window.open(`https://wa.me/${whatsappNumber}`, '_blank');
                                    }}
                                    className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full w-fit hover:bg-gray-100 transition-none"
                                >
                                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
