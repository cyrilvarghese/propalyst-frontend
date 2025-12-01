/**
 * CREAListingCard - Client Component
 * ===================================
 *
 * Compact, scannable card for CREA listings.
 * No images, with collapsible accordion for raw message.
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'

interface CREAListingCardProps {
    listing: CREAListing
}

export default function CREAListingCard({ listing }: CREAListingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Format price
    const formatPrice = (price: number): string => {
        if (price >= 10000000) {
            const crores = price / 10000000
            return `₹${crores.toFixed(2)} Cr`
        } else if (price >= 100000) {
            const lakhs = price / 100000
            return `₹${lakhs.toFixed(2)} L`
        } else if (price) {
            return `₹${price.toLocaleString('en-IN')}`
        }
        return 'Price on request'
    }

    // Format date
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    // Format phone number for WhatsApp (remove non-digits, ensure country code)
    const formatPhoneForWhatsApp = (phone: string): string => {
        // Remove all non-digit characters
        const digitsOnly = phone.replace(/\D/g, '')

        // If it doesn't start with country code (91 for India), add it
        if (digitsOnly.length === 10) {
            return `91${digitsOnly}`
        }

        // If it starts with +91 or 91, remove the +
        if (digitsOnly.startsWith('91')) {
            return digitsOnly
        }

        return digitsOnly
    }

    // Create WhatsApp link with welcome message
    const createWhatsAppLink = (phone: string, agentName: string, propertyType: string, location: string): string => {
        const formattedPhone = formatPhoneForWhatsApp(phone)
        const welcomeMessage = `Hello ${agentName}, I'm interested in the ${propertyType} property in ${location}. Could you please provide more details?`
        const encodedMessage = encodeURIComponent(welcomeMessage)
        return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
    }

    return (
        <Card className="p-4 hover:shadow-md transition-shadow duration-200 border border-gray-200">
            {/* 1. Date and Agent Name - Number - Type (Same Line) */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                    {listing.agent_name && (
                        <span className="text-sm font-medium text-gray-900">
                            {listing.agent_name}
                        </span>
                    )}
                    {listing.agent_contact && (
                        <a
                            href={createWhatsAppLink(
                                listing.agent_contact,
                                listing.agent_name || 'Agent',
                                listing.property_type || 'property',
                                listing.location || 'location'
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                        >
                            📞 {listing.agent_contact}
                        </a>
                    )}
                    {listing.transaction_type && (
                        <Badge
                            variant={listing.transaction_type === 'Sale' ? 'default' : 'outline'}
                            className="text-xs shrink-0"
                        >
                            {listing.transaction_type}
                        </Badge>
                    )}
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                    📅 {formatDate(listing.created_at)}
                </Badge>
            </div>
            {listing.company_name && (
                <p className="text-xs text-gray-500 mb-3">
                    {listing.company_name}
                </p>
            )}

            {/* 3. Other Details */}
            <div className="space-y-2">
                {/* Property Type and Location */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {listing.property_type || 'Property'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                            📍 {listing.location || 'No location data'}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-xl font-bold text-gray-900">
                            {formatPrice(listing.price)}
                        </div>
                        {listing.price_text && (
                            <div className="text-xs text-gray-500 mt-0.5">
                                {listing.price_text}
                            </div>
                        )}
                    </div>
                </div>

                {/* Key Details - Compact Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {listing.size_sqft && (
                        <Badge variant="secondary" className="text-xs">
                            📐 {listing.size_sqft.toLocaleString('en-IN')} sq.ft
                        </Badge>
                    )}
                    {listing.configuration && (
                        <Badge variant="outline" className="text-xs">
                            🏘️ {listing.configuration}
                        </Badge>
                    )}
                    {listing.facing && (
                        <Badge variant="outline" className="text-xs">
                            🧭 {listing.facing}
                        </Badge>
                    )}
                    {listing.status && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            ✓ {listing.status}
                        </Badge>
                    )}
                    {listing.floor && (
                        <Badge variant="outline" className="text-xs">
                            🏢 {listing.floor}
                        </Badge>
                    )}
                    {listing.parking && (
                        <Badge variant="outline" className="text-xs">
                            🚗 {listing.parking}
                        </Badge>
                    )}
                    {listing.furnishing && (
                        <Badge variant="outline" className="text-xs">
                            🛋️ {listing.furnishing}
                        </Badge>
                    )}
                </div>

                {/* Raw Message Preview - Show as highlighted badge if available */}
                {listing.raw_message && !isExpanded && (
                    <div className="mb-3">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-800 border-green-300 max-w-full text-left font-normal p-2 h-auto whitespace-normal">
                            ✓ {listing.raw_message.length > 100
                                ? `${listing.raw_message.substring(0, 100)}...`
                                : listing.raw_message}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Collapsible Raw Message Accordion */}
            {listing.raw_message && (
                <div className="border-t border-gray-200 pt-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                        aria-expanded={isExpanded}
                    >
                        <span>View Details</span>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                    {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
                            {/* Additional Details */}
                            {(listing.project_name || listing.amenities) && (
                                <div className="space-y-1 text-xs text-gray-600">
                                    {listing.project_name && (
                                        <p><span className="font-medium">Project:</span> {listing.project_name}</p>
                                    )}
                                    {listing.amenities && (
                                        <p><span className="font-medium">Amenities:</span> {listing.amenities}</p>
                                    )}
                                </div>
                            )}
                            {/* Raw Message */}
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                {listing.raw_message}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}

