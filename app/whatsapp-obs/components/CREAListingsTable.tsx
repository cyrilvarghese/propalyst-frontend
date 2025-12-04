/**
 * CREAListingsTable - Client Component
 * =====================================
 *
 * Data table component for displaying CREA listings with pagination.
 * Uses shadcn table component.
 */

'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import {
    ChevronDown,
    ChevronUp,
    MapPin,
    Calendar,
    User,
    Building2,
    Phone,
    Home,
    BedDouble,
    Maximize2,
    CheckCircle2,
    Compass,
    Armchair,
    Car,
    Briefcase,
    Store,
    Box,
    Users,
    Trees,
    Map,
    LandPlot
} from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'
import TableHeaderWithFilters from './TableHeaderWithFilters'
import WhatsAppMessagePopover from './WhatsAppMessagePopover'
import WhatsAppMessageDialog from './WhatsAppMessageDialog'
import Pagination from './Pagination'
import CopyDebugSQLButton from './CopyDebugSQLButton'
import CompareListingButton from './CompareListingButton'
import RetryListingButton from './RetryListingButton'
import CopyLinkButton from './CopyLinkButton'
import AddMatchingSupplyButton from './AddMatchingSupplyButton'

interface CREAListingsTableProps {
    listings: CREAListing[]
    onLocationFilter?: (location: string) => void
    locationFilter?: string
    onAgentFilter?: (agent: string) => void
    agentFilter?: string
    onBedroomCountFilter?: (bedroomCount: string) => void
    bedroomCountFilter?: string
    exactMatch?: boolean
    onExactMatchToggle?: (exactMatch: boolean) => void
    onResetFilters?: () => void
    // Simplified pagination props
    onPrevious?: () => void
    onNext?: () => void
    hasPrevious?: boolean
    hasNext?: boolean
    startIndex?: number
    endIndex?: number
    totalCount?: number
}

const ITEMS_PER_PAGE = 50

export default function CREAListingsTable({
    listings,
    onLocationFilter,
    locationFilter,
    onAgentFilter,
    agentFilter,
    onBedroomCountFilter,
    bedroomCountFilter,
    exactMatch,
    onExactMatchToggle,
    onResetFilters,
    // Pagination props
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    startIndex = 0,
    endIndex = listings.length,
    totalCount = listings.length
}: CREAListingsTableProps) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    // Use all listings as-is (already paginated by parent)
    const paginatedListings = listings

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

    // Format date and time (without year)
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        const dateStr = date.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
        })
        const timeStr = date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
        return `${dateStr} ${timeStr}`
    }

    // Format message type for display
    const formatMessageType = (messageType: string): string => {
        const typeMap: { [key: string]: string } = {
            'supply_sale': 'Supply - Sale',
            'supply_rent': 'Supply - Rent',
            'demand_buy': 'Demand - Buy',
            'demand_rent': 'Demand - Rent',
        }
        return typeMap[messageType] || messageType
    }

    // Get color for asset type - SaaS style: Clean, uniform, high contrast text
    // Get color for asset type - SaaS style: Clean, uniform, high contrast text
    const getAssetTypeColor = (assetType: string): string => {
        // Uniform elegant style for all asset types to reduce visual noise
        return 'text-slate-700 bg-white border-slate-200 font-medium'
    }

    // Get icon for asset type
    const getAssetTypeIcon = (assetType: string) => {
        if (!assetType) return <Home className="w-3.5 h-3.5" />

        const type = assetType.toLowerCase()
        if (type.includes('apartment') || type.includes('flat')) return <Building2 className="w-3.5 h-3.5" />
        if (type.includes('villa') || type.includes('house')) return <Home className="w-3.5 h-3.5" />
        if (type.includes('plot') || type.includes('land')) return <LandPlot className="w-3.5 h-3.5" />
        if (type.includes('office')) return <Briefcase className="w-3.5 h-3.5" />
        if (type.includes('retail') || type.includes('shop')) return <Store className="w-3.5 h-3.5" />
        if (type.includes('warehouse') || type.includes('godown')) return <Box className="w-3.5 h-3.5" />
        if (type.includes('pg') || type.includes('hostel')) return <Users className="w-3.5 h-3.5" />
        if (type.includes('farm')) return <Trees className="w-3.5 h-3.5" />

        return <Home className="w-3.5 h-3.5" />
    }

    // Format asset type to title case and replace underscores with spaces
    const formatAssetType = (assetType: string): string => {
        if (!assetType) return 'Property'
        return assetType
            .replace(/_/g, ' ') // Replace underscores with spaces
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
    }

    // Get badge variant based on message type - Elegant pastel tones
    const getMessageTypeVariant = (messageType: string): string => {
        if (messageType === 'supply_sale') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        if (messageType === 'supply_rent') return 'bg-blue-50 text-blue-700 border border-blue-200'
        if (messageType === 'demand_buy') return 'bg-rose-50 text-rose-700 border border-rose-200'
        if (messageType === 'demand_rent') return 'bg-amber-50 text-amber-700 border border-amber-200'
        return 'bg-gray-50 text-gray-700 border border-gray-200'
    }

    // Get bedroom badge color based on BHK count (1 = lightest, 4+ = darkest)
    // Skips levels for better contrast and uses appropriate text colors for readability
    const getBedroomBadgeColor = (configuration: string): { bg: string, text: string } => {
        if (!configuration) return { bg: 'bg-gray-200', text: 'text-gray-800' }

        // Extract number from configuration (e.g., "3BHK" -> 3, "4BHK" -> 4)
        const match = configuration.match(/(\d+)/)
        if (!match) return { bg: 'bg-gray-200', text: 'text-gray-800' }

        const bedroomCount = parseInt(match[1])

        // Map bedroom count to elegant dark shades
        const shadeMap: { [key: number]: { bg: string, text: string } } = {
            1: { bg: 'bg-slate-100 hover:bg-slate-100', text: 'text-slate-700 border-slate-200' },
            2: { bg: 'bg-slate-200 hover:bg-slate-200', text: 'text-slate-800 border-slate-300' },
            3: { bg: 'bg-slate-300 hover:bg-slate-300', text: 'text-slate-900 border-slate-400' },
            4: { bg: 'bg-slate-400 hover:bg-slate-400', text: 'text-white border-slate-500' },
        }

        // Default for 5+ or others
        return shadeMap[bedroomCount] || { bg: 'bg-slate-800 hover:bg-slate-800', text: 'text-white border-slate-700' }
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
                        <TableHeaderWithFilters
                            onLocationFilter={onLocationFilter}
                            locationFilter={locationFilter}
                            onAgentFilter={onAgentFilter}
                            agentFilter={agentFilter}
                            onBedroomCountFilter={onBedroomCountFilter}
                            bedroomCountFilter={bedroomCountFilter}
                            exactMatch={exactMatch}
                            onExactMatchToggle={onExactMatchToggle}
                            onResetFilters={onResetFilters}
                            hasActiveFilters={
                                (locationFilter && locationFilter.trim().length > 0) ||
                                (agentFilter && agentFilter.trim().length > 0) ||
                                (bedroomCountFilter && bedroomCountFilter.trim().length > 0) ||
                                exactMatch
                            }
                        />
                        <TableBody>
                            {paginatedListings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center py-8">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-slate-300 mb-3">
                                                <Home className="w-12 h-12" />
                                            </div>
                                            <p className="text-base font-semibold text-slate-700 mb-1">
                                                No listings found
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Try adjusting your filters or check again later
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedListings.map((listing) => (
                                    <>
                                        <TableRow key={listing.id} className="group hover:bg-slate-50 transition-colors border-b border-gray-100">
                                            <TableCell className="align-top py-3">
                                                <p className="text-sm text-slate-900 font-medium">
                                                    {formatDate(listing.message_date)}
                                                </p>
                                            </TableCell>
                                            <TableCell className="align-top py-2">
                                                <div className="space-y-0.5">
                                                    <div className="text-sm text-slate-900 font-medium">
                                                        {listing.agent_name || 'N/A'}
                                                    </div>
                                                    {listing.agent_contact && (
                                                        <>
                                                            {/* Dialog version - full screen modal */}
                                                            <WhatsAppMessageDialog listing={listing}>
                                                                <button
                                                                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    <Phone className="w-3 h-3" /> ({listing.agent_contact})
                                                                </button>
                                                            </WhatsAppMessageDialog>
                                                        </>
                                                    )}
                                                    {listing.company_name && (
                                                        <div className="text-xs text-slate-500">
                                                            {listing.company_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top py-3">
                                                <div className={`text-xs font-medium px-2 py-1 rounded-md border w-fit flex items-center gap-1.5 ${getAssetTypeColor(listing.property_type)}`}>
                                                    {getAssetTypeIcon(listing.property_type)}
                                                    {formatAssetType(listing.property_type || 'Property')}
                                                </div>
                                                {(listing.size_sqft || 0) > 0 && (
                                                    <div className="text-xs font-medium px-2 py-1 rounded-md border bg-slate-50 text-slate-600 border-slate-200 w-fit mt-1.5 flex items-center gap-1.5">
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                        {listing.size_sqft?.toLocaleString('en-IN')} sq.ft
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top py-2">
                                                {listing.configuration ? (
                                                    (() => {
                                                        const badgeColors = getBedroomBadgeColor(listing.configuration)
                                                        return (
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-xs border gap-1.5 ${badgeColors.bg} ${badgeColors.text}`}
                                                            >
                                                                <BedDouble className="w-3.5 h-3.5" />
                                                                {listing.configuration}
                                                            </Badge>
                                                        )
                                                    })()
                                                ) : (
                                                    <span className="text-xs text-slate-400">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top py-2">
                                                <div className="text-sm text-slate-900 font-medium">
                                                    {listing.location || 'No location'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top py-1.5">
                                                <div className="text-sm text-slate-900 font-medium">
                                                    {formatPrice(listing.price)}
                                                </div>
                                                {listing.price_text && (
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {listing.price_text}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top py-3">
                                                <p className={`w-fit text-xs font-medium rounded-md px-2 py-1 ${getMessageTypeVariant(listing.transaction_type)}`}>
                                                    {formatMessageType(listing.transaction_type)}
                                                </p>
                                            </TableCell>
                                            <TableCell className="align-top py-3">
                                                {listing.raw_message && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRow(listing.id)}
                                                        className="h-8 w-8 p-0 bg-[#e47d72] hover:bg-[#e47d72] text-white rounded-md transition-colors"
                                                    >
                                                        {expandedRow === listing.id ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        {expandedRow === listing.id && listing.raw_message && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="bg-slate-50/50 py-4 px-6 shadow-inner">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-start mb-2 gap-2">
                                                            <AddMatchingSupplyButton listing={listing} />
                                                            <CopyLinkButton listing={listing} />
                                                        </div>
                                                        {(listing.status || listing.facing || listing.floor || listing.parking || listing.furnishing) && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {listing.status && (
                                                                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                                                                        <CheckCircle2 className="w-3 h-3" /> {listing.status}
                                                                    </Badge>
                                                                )}
                                                                {listing.facing && (
                                                                    <Badge variant="outline" className="text-xs bg-white text-slate-600 border-slate-200 gap-1">
                                                                        <Compass className="w-3 h-3" /> {listing.facing}
                                                                    </Badge>
                                                                )}
                                                                {listing.floor && (
                                                                    <Badge variant="outline" className="text-xs bg-white text-slate-600 border-slate-200 gap-1">
                                                                        <Building2 className="w-3 h-3" /> {listing.floor}
                                                                    </Badge>
                                                                )}
                                                                {listing.parking && (
                                                                    <Badge variant="outline" className="text-xs bg-white text-slate-600 border-slate-200 gap-1">
                                                                        <Car className="w-3 h-3" /> {listing.parking}
                                                                    </Badge>
                                                                )}
                                                                {listing.furnishing && (
                                                                    <Badge variant="outline" className="text-xs bg-white text-slate-600 border-slate-200 gap-1">
                                                                        <Armchair className="w-3 h-3" /> {listing.furnishing}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                        {(listing.project_name || listing.amenities) && (
                                                            <div className="text-xs text-slate-500 space-y-1">
                                                                {listing.project_name && (
                                                                    <p><span className="font-medium text-slate-700">Project:</span> {listing.project_name}</p>
                                                                )}
                                                                {listing.amenities && (
                                                                    <p><span className="font-medium text-slate-700">Amenities:</span> {listing.amenities}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-slate-700 whitespace-pre-wrap break-words border-t border-slate-200 pt-3 leading-relaxed">
                                                            {listing.raw_message}
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap">

                                                            <RetryListingButton listing={listing} />
                                                            <CopyDebugSQLButton listing={listing} />
                                                            <CompareListingButton listing={listing} />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-auto bg-slate-50/50 rounded-lg border border-slate-200 p-2 space-y-3">
                {paginatedListings.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-slate-300 mb-4 flex justify-center">
                            <Home className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            No listings found
                        </h3>
                        <p className="text-sm text-slate-500">
                            Try adjusting your filters
                        </p>
                    </div>
                ) : (
                    paginatedListings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
                            {/* Header: Date and Price */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{formatDate(listing.message_date)}</span>
                                </div>
                                <span className="font-bold text-lg text-emerald-600 tracking-tight">{formatPrice(listing.price)}</span>
                            </div>

                            {/* Main Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className={`text-xs font-medium px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${getAssetTypeColor(listing.property_type)}`}>
                                        {getAssetTypeIcon(listing.property_type)}
                                        {formatAssetType(listing.property_type)}
                                    </div>
                                    {(listing.size_sqft || 0) > 0 && (
                                        <div className="text-xs font-medium px-2.5 py-1 rounded-md border bg-slate-50 text-slate-600 border-slate-200 flex items-center gap-1.5">
                                            <Maximize2 className="w-3.5 h-3.5" />
                                            {listing.size_sqft?.toLocaleString('en-IN')} sq.ft
                                        </div>
                                    )}
                                    {listing.configuration && (
                                        (() => {
                                            const badgeColors = getBedroomBadgeColor(listing.configuration)
                                            return (
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs border gap-1.5 ${badgeColors.bg} ${badgeColors.text}`}
                                                >
                                                    <BedDouble className="w-3.5 h-3.5" />
                                                    {listing.configuration}
                                                </Badge>
                                            )
                                        })()
                                    )}
                                    <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${getMessageTypeVariant(listing.transaction_type)}`}>
                                        {formatMessageType(listing.transaction_type)}
                                    </span>
                                </div>
                                <div className="font-medium text-slate-900 text-sm flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span className="leading-tight">{listing.location || 'No location specified'}</span>
                                </div>
                            </div>

                            {/* Agent Info */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium text-slate-900 text-xs">{listing.agent_name || 'N/A'}</div>
                                        {listing.company_name && (
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                {listing.company_name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {listing.agent_contact && (
                                    <WhatsAppMessageDialog listing={listing}>
                                        <Button size="sm" variant="outline" className="h-9 px-4 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-white hover:text-slate-700 gap-2 transition-none">
                                            <Phone className="w-3.5 h-3.5" />
                                            Call
                                        </Button>
                                    </WhatsAppMessageDialog>
                                )}
                            </div>

                            {/* Expandable Details */}
                            {listing.raw_message && (
                                <div className="pt-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs font-medium h-9 bg-[#e47d72] hover:bg-[#e47d72] text-white border border-[#e47d72] shadow-sm"
                                        onClick={() => toggleRow(listing.id)}
                                    >
                                        {expandedRow === listing.id ? 'Hide Details' : 'View Details'}
                                    </Button>
                                    {expandedRow === listing.id && (
                                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-md whitespace-pre-wrap break-words border border-slate-100">
                                            {listing.raw_message}
                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                <CopyLinkButton listing={listing} />
                                                <AddMatchingSupplyButton listing={listing} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {onPrevious && onNext && (
                <Pagination
                    onPrevious={onPrevious}
                    onNext={onNext}
                    hasPrevious={hasPrevious ?? false}
                    hasNext={hasNext ?? false}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalCount={totalCount}
                    itemName="listings"
                    sticky={true}
                />
            )}
        </div>
    )
}

