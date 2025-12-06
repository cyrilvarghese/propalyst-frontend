/**
 * RBPropertiesTable - Client Component
 * =====================================
 *
 * Data table component for displaying RB Properties (Real Broker verified properties).
 * Uses shadcn table component, similar to CREAListingsTable.
 * 
 * FIELD MAPPINGS (RB Property → WhatsApp Listing):
 * -------------------------------------------------
 * - property_type (string: "Sale"/"Rent") → transaction_type (different field name)
 * - sqft (number) → area_sqft/size_sqft (different field name)
 * - bedrooms (number) → bedroom_count (different field name)
 * - bathrooms (number) → NEW FIELD (not in WhatsApp listings)
 * - images (string[]) → NEW FIELD (not in WhatsApp listings)
 * - agent_email → NEW FIELD (not in WhatsApp listings)
 * - agent_avatar → NEW FIELD (not in WhatsApp listings)
 * - static_html_url → NEW FIELD (property detail page URL)
 * - status (string: "Sold") → same field name
 * - created_at → same field name (for date display)
 * - agent_contact → same field name
 * - furnishing_status → same field name
 * - facing_direction → same field name
 * - parking_count → same field name
 * - special_features → same field name
 */

'use client'

import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

import {
    ChevronDown,
    ChevronUp,
    MapPin,
    Calendar,
    User,
    Building2,
    Phone,
    Home,
    CheckCircle2,
    Compass,
    Armchair,
    Car,
    ExternalLink,
    Bath
} from 'lucide-react'
import { RBProperty } from '@/lib/api/whatsapp-listings'

interface RBPropertiesTableProps {
    properties: RBProperty[]
}

export default function RBPropertiesTable({
    properties
}: RBPropertiesTableProps) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    // Format price
    const formatPrice = (price: number | null): string => {
        if (!price) return 'Price on request'

        if (price >= 10000000) {
            const crores = price / 10000000
            return `₹${crores.toFixed(2)} Cr`
        } else if (price >= 100000) {
            const lakhs = price / 100000
            return `₹${lakhs.toFixed(2)} L`
        } else {
            return `₹${price.toLocaleString('en-IN')}`
        }
    }

    // Format date (without year and time)
    const formatDate = (dateString: string): string => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'N/A'
        return date.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
        })
    }

    // Format property type for display (Maps to transaction_type in WhatsApp listings)
    const formatPropertyType = (propertyType: string): string => {
        // RB Property uses "Sale"/"Rent" while WhatsApp uses "supply_sale", "demand_buy", etc.
        return propertyType || 'N/A'
    }

    // Get color for property type
    const getPropertyTypeColor = (propertyType: string): string => {
        return 'text-slate-600 bg-slate-50 border-slate-200 font-medium'
    }

    // Format bedrooms/bathrooms display
    const formatBedBath = (bedrooms: number | null, bathrooms: number | null): string => {
        const parts = []
        if (bedrooms) parts.push(`${bedrooms}BD`)
        if (bathrooms) parts.push(`${bathrooms}BA`) // Bathrooms: NEW FIELD not in WhatsApp listings
        return parts.length > 0 ? parts.join(' / ') : 'N/A'
    }

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    return (
        <div className="h-full flex flex-col">
            {/* Desktop Table View */}
            <div className="hidden md:flex rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm flex-1 flex-col min-h-0">
                <div className="flex-1 relative overflow-auto min-h-0">
                    <Table>
                        <TableHeader className="sticky top-0 bg-gray-500 z-10 shadow-md">
                            <TableRow className="hover:bg-gray-500">
                                <TableHead className="w-[80px] text-white font-medium py-4">Date</TableHead>
                                <TableHead className="w-[220px] text-white font-medium py-4">Agent</TableHead>
                                <TableHead className="w-[130px] text-white font-medium py-4">Property Type</TableHead>
                                <TableHead className="w-[100px] text-white font-medium py-4">Bed/Bath</TableHead>
                                <TableHead className="w-[250px] text-white font-medium py-4">Location</TableHead>
                                <TableHead className="w-[120px] text-white font-medium py-4">Price</TableHead>
                                <TableHead className="w-[80px] text-white font-medium py-4">Status</TableHead>
                                <TableHead className="w-[40px] text-white font-medium py-4"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {properties.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center py-8">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-slate-300 mb-3">
                                                <Home className="w-12 h-12" />
                                            </div>
                                            <p className="text-base font-semibold text-slate-700 mb-1">
                                                No properties found
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Try adjusting your search or check again later
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                properties.map((property) => (
                                    <React.Fragment key={property.id}>
                                        <TableRow className="group hover:bg-slate-50 transition-colors border-b border-gray-100">
                                            {/* Date - created_at field (same as WhatsApp) */}
                                            <TableCell className="align-top py-3">
                                                <p className="text-sm text-slate-900 font-medium">
                                                    {formatDate(property.created_at)}
                                                </p>
                                            </TableCell>

                                            {/* Agent Info - agent_name, agent_contact (same as WhatsApp), agent_email (NEW) */}
                                            <TableCell className="align-top py-2">
                                                <div className="space-y-0.5">
                                                    <div className="text-sm text-slate-900 font-medium">
                                                        {property.agent_name || 'N/A'}
                                                    </div>
                                                    {property.agent_contact && (
                                                        <div className="text-xs text-slate-600">
                                                            <Phone className="w-3 h-3 inline mr-1" />
                                                            {property.agent_contact}
                                                        </div>
                                                    )}
                                                    {property.company_name && (
                                                        <div className="text-xs text-slate-500">
                                                            {property.company_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Property Type - property_type field (maps to transaction_type in WhatsApp) */}
                                            <TableCell className="align-top py-3">
                                                <div className={`text-xs font-medium px-2 py-1 rounded-md border w-fit flex items-center ${getPropertyTypeColor(property.property_type)}`}>
                                                    {formatPropertyType(property.property_type)}
                                                </div>
                                                {/* Sqft - sqft field (maps to area_sqft/size_sqft in WhatsApp) */}
                                                {(property.sqft || 0) > 0 && (
                                                    <div className="text-xs font-medium px-2 py-1 rounded-md border bg-slate-50 text-slate-600 border-slate-200 w-fit mt-1.5 flex items-center">
                                                        {property.sqft?.toLocaleString('en-IN')} sq.ft
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Bedrooms/Bathrooms - bedrooms (maps to bedroom_count), bathrooms (NEW FIELD) */}
                                            <TableCell className="align-top py-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs border bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                                                >
                                                    {formatBedBath(property.bedrooms, property.bathrooms)}
                                                </Badge>
                                            </TableCell>

                                            {/* Location - location field (same as WhatsApp) */}
                                            <TableCell className="align-top py-2">
                                                <div className="text-sm text-slate-900 font-medium">
                                                    {property.location || 'No location'}
                                                </div>
                                            </TableCell>

                                            {/* Price - price field (same as WhatsApp) */}
                                            <TableCell className="align-top py-1.5">
                                                <div className="text-sm text-slate-900 font-medium">
                                                    {formatPrice(property.price)}
                                                </div>
                                                {property.price_text && (
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {property.price_text}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Status - status field (same as WhatsApp, e.g., "Sold") */}
                                            <TableCell className="align-top py-3">
                                                {property.status && (
                                                    <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                                                        {property.status}
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Expand Button */}
                                            <TableCell className="align-top py-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleRow(property.id)}
                                                    className="h-8 w-8 p-0 bg-transparent hover:bg-transparent text-black hover:text-black rounded-md transition-none"
                                                >
                                                    {expandedRow === property.id ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Row - shows images (NEW), description, additional details */}
                                        {expandedRow === property.id && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="bg-slate-50/50 py-4 px-6 shadow-inner">
                                                    <div className="space-y-3">
                                                        {/* Property Title */}
                                                        {property.title && (
                                                            <h4 className="text-base font-semibold text-slate-900">{property.title}</h4>
                                                        )}

                                                        {/* Images - NEW FIELD (not in WhatsApp listings) */}
                                                        {property.images && property.images.length > 0 && (
                                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                                {property.images.slice(0, 4).map((imageUrl, index) => (
                                                                    <div key={index} className="relative w-32 h-24 flex-shrink-0 rounded-md overflow-hidden">
                                                                        <Image
                                                                            src={imageUrl}
                                                                            alt={`Property image ${index + 1}`}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    </div>
                                                                ))}
                                                                {property.images.length > 4 && (
                                                                    <div className="flex items-center justify-center w-32 h-24 bg-slate-100 rounded-md text-xs text-slate-600">
                                                                        +{property.images.length - 4} more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Description */}
                                                        {property.description && (
                                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                                {property.description}
                                                            </p>
                                                        )}

                                                        {/* Additional Details - same fields as WhatsApp */}
                                                        {(property.status || property.facing_direction || property.parking_count || property.furnishing_status) && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {property.status && (
                                                                    <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 gap-1">
                                                                        <CheckCircle2 className="w-3 h-3" /> {property.status}
                                                                    </Badge>
                                                                )}
                                                                {property.facing_direction && (
                                                                    <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 gap-1">
                                                                        <Compass className="w-3 h-3" /> {property.facing_direction}
                                                                    </Badge>
                                                                )}
                                                                {property.parking_count && (
                                                                    <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 gap-1">
                                                                        <Car className="w-3 h-3" /> {property.parking_count} parking
                                                                    </Badge>
                                                                )}
                                                                {property.furnishing_status && (
                                                                    <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 gap-1">
                                                                        <Armchair className="w-3 h-3" /> {property.furnishing_status}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Project Name and Special Features - same as WhatsApp */}
                                                        {(property.project_name || property.special_features) && (
                                                            <div className="text-xs text-slate-500 space-y-1">
                                                                {property.project_name && (
                                                                    <p><span className="font-medium text-slate-700">Project:</span> {property.project_name}</p>
                                                                )}
                                                                {property.special_features && property.special_features.length > 0 && (
                                                                    <p><span className="font-medium text-slate-700">Features:</span> {property.special_features.join(', ')}</p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Action Buttons - static_html_url (NEW FIELD) */}
                                                        <div className="flex gap-2 flex-wrap pt-2">
                                                            {property.static_html_url && (
                                                                <a
                                                                    href={property.static_html_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline border border-blue-300 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                    View Property Page
                                                                </a>
                                                            )}
                                                            {property.agent_email && (
                                                                <a
                                                                    href={`mailto:${property.agent_email}`}
                                                                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 hover:underline border border-slate-300 rounded px-2 py-1 bg-slate-50 hover:bg-slate-100 transition-colors"
                                                                >
                                                                    Email Agent
                                                                </a>
                                                            )}
                                                        </div>

                                                        {/* Verified By - NEW FIELD */}
                                                        {property.verified_by && (
                                                            <div className="text-xs text-slate-500 border-t border-slate-200 pt-2">
                                                                <span className="font-medium text-slate-700">Verified by:</span> {property.verified_by}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-auto bg-slate-50/50 rounded-lg border border-slate-200 p-2 space-y-3">
                {properties.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-slate-300 mb-4 flex justify-center">
                            <Home className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            No properties found
                        </h3>
                        <p className="text-sm text-slate-500">
                            Try adjusting your search
                        </p>
                    </div>
                ) : (
                    properties.map((property) => (
                        <div key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
                            {/* Header: Date and Price */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{formatDate(property.created_at)}</span>
                                </div>
                                <span className="font-bold text-lg text-slate-900 tracking-tight">{formatPrice(property.price)}</span>
                            </div>

                            {/* Image Thumbnail - NEW FIELD */}
                            {property.images && property.images.length > 0 && (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                    <Image
                                        src={property.images[0]}
                                        alt={property.title || 'Property'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Title */}
                            {property.title && (
                                <h4 className="font-semibold text-slate-900">{property.title}</h4>
                            )}

                            {/* Main Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className={`text-xs font-medium px-2.5 py-1 rounded-md border flex items-center ${getPropertyTypeColor(property.property_type)}`}>
                                        {formatPropertyType(property.property_type)}
                                    </div>
                                    {(property.sqft || 0) > 0 && (
                                        <div className="text-xs font-medium px-2.5 py-1 rounded-md border bg-slate-50 text-slate-600 border-slate-200 flex items-center">
                                            {property.sqft?.toLocaleString('en-IN')} sq.ft
                                        </div>
                                    )}
                                    <Badge
                                        variant="secondary"
                                        className="text-xs border bg-slate-50 text-slate-600 border-slate-200"
                                    >
                                        {formatBedBath(property.bedrooms, property.bathrooms)}
                                    </Badge>
                                    {property.status && (
                                        <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                                            {property.status}
                                        </Badge>
                                    )}
                                </div>
                                <div className="font-medium text-slate-900 text-sm flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span className="leading-tight">{property.location || 'No location specified'}</span>
                                </div>
                            </div>

                            {/* Agent Info */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium text-slate-900 text-xs">{property.agent_name || 'N/A'}</div>
                                        {property.company_name && (
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                {property.company_name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {property.agent_contact && (
                                    <Button size="sm" variant="outline" className="h-9 px-4 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-white hover:text-slate-700 gap-2 transition-none">
                                        <Phone className="w-3.5 h-3.5" />
                                        Call
                                    </Button>
                                )}
                            </div>

                            {/* View Property Link - NEW FIELD */}
                            {property.static_html_url && (
                                <a
                                    href={property.static_html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800 py-2 border border-blue-300 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                    View Full Property Details
                                </a>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

