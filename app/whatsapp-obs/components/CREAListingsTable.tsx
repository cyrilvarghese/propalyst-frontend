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
import { ChevronDown, ChevronUp } from 'lucide-react'
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

    // Format asset type to title case and replace underscores with spaces
    const formatAssetType = (assetType: string): string => {
        if (!assetType) return 'Property'
        return assetType
            .replace(/_/g, ' ') // Replace underscores with spaces
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
    }

    // Get badge variant based on message type
    const getMessageTypeVariant = (messageType: string): string => {
        if (messageType === 'supply_sale' || messageType === 'supply_rent') {
            return 'bg-secondary text-secondary-foreground p-2          '
        }
        return ''
    }

    // Get bedroom badge color based on BHK count (1 = lightest, 4+ = darkest)
    // Skips levels for better contrast and uses appropriate text colors for readability
    const getBedroomBadgeColor = (configuration: string): { bg: string, text: string } => {
        if (!configuration) return { bg: 'bg-gray-200', text: 'text-gray-800' }

        // Extract number from configuration (e.g., "3BHK" -> 3, "4BHK" -> 4)
        const match = configuration.match(/(\d+)/)
        if (!match) return { bg: 'bg-gray-200', text: 'text-gray-800' }

        const bedroomCount = parseInt(match[1])

        // Map bedroom count to gray shades with skipped levels for better contrast
        // Lighter backgrounds use dark text, darker backgrounds use white text
        const shadeMap: { [key: number]: { bg: string, text: string } } = {
            1: { bg: 'bg-gray-200', text: 'text-gray-800' }, // Lightest - dark text
            2: { bg: 'bg-gray-400', text: 'text-gray-900' }, // Medium-light - dark text
            3: { bg: 'bg-gray-600', text: 'text-white' },    // Medium-dark - white text
            4: { bg: 'bg-gray-800', text: 'text-white' },    // Dark - white text
        }

        // For 5+ bedrooms, use darkest shade with white text
        return shadeMap[bedroomCount] || { bg: 'bg-gray-900', text: 'text-white' }
    }

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    return (
        <div className="h-full flex flex-col">
            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
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
                                            <div className="text-gray-400 text-4xl mb-3">🏠</div>
                                            <p className="text-base font-semibold text-gray-700 mb-1">
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
                                        <TableRow key={listing.id} className="hover:bg-gray-200">
                                            <TableCell className="align-top py-2">
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {formatDate(listing.message_date)}
                                                </p>
                                            </TableCell>
                                            <TableCell className="align-top py-2">
                                                <div className="space-y-0.5">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {listing.agent_name || 'N/A'}
                                                    </div>
                                                    {listing.agent_contact && (
                                                        <>
                                                            {/* Dialog version - full screen modal */}
                                                            <WhatsAppMessageDialog listing={listing}>
                                                                <button
                                                                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    📞 ({listing.agent_contact})
                                                                </button>
                                                            </WhatsAppMessageDialog>
                                                        </>
                                                    )}
                                                    {listing.company_name && (
                                                        <div className="text-xs text-gray-600">
                                                            {listing.company_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top py-2">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {formatAssetType(listing.property_type || 'Property')}
                                                </div>
                                                {listing.size_sqft && (
                                                    <div className="text-xs text-gray-600 mt-0.5">
                                                        {listing.size_sqft.toLocaleString('en-IN')} sq.ft
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
                                                                className={`text-xs ${badgeColors.bg} ${badgeColors.text}`}
                                                            >
                                                                {listing.configuration}
                                                            </Badge>
                                                        )
                                                    })()
                                                ) : (
                                                    <span className="text-xs text-gray-400">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top py-2">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {listing.location || 'No location'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top py-1.5">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {formatPrice(listing.price)}
                                                </div>
                                                {listing.price_text && (
                                                    <div className="text-xs text-gray-600 mt-0.5">
                                                        {listing.price_text}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top py-2">
                                                <p className={`w-[100px] text-xs rounded-md p-1 ${getMessageTypeVariant(listing.transaction_type)}`}>
                                                    {formatMessageType(listing.transaction_type)}
                                                </p>
                                            </TableCell>
                                            <TableCell className="align-top py-2">
                                                {listing.raw_message && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRow(listing.id)}
                                                        className="h-8 w-8 p-0"
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
                                                <TableCell colSpan={8} className="bg-gray-50 py-2">
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-start mb-2 gap-2">
                                                            <AddMatchingSupplyButton listing={listing} />
                                                            <CopyLinkButton listing={listing} />
                                                        </div>
                                                        {(listing.status || listing.facing || listing.floor || listing.parking || listing.furnishing) && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {listing.status && (
                                                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                                        ✓ {listing.status}
                                                                    </Badge>
                                                                )}
                                                                {listing.facing && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        🧭 {listing.facing}
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
                                                        )}
                                                        {(listing.project_name || listing.amenities) && (
                                                            <div className="text-xs text-gray-600 space-y-1">
                                                                {listing.project_name && (
                                                                    <p><span className="font-medium">Project:</span> {listing.project_name}</p>
                                                                )}
                                                                {listing.amenities && (
                                                                    <p><span className="font-medium">Amenities:</span> {listing.amenities}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words border-t border-gray-200 pt-2">
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

