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

    // Get badge variant based on message type
    const getMessageTypeVariant = (messageType: string): 'default' | 'outline' | 'secondary' => {
        if (messageType === 'supply_sale' || messageType === 'demand_buy') {
            return 'default'
        }
        return 'outline'
    }

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
                <div className="h-[calc(100vh-200px)] relative overflow-auto">
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
                                        <TableRow key={listing.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">
                                                <Badge variant="outline" className="text-xs">
                                                    📅 {formatDate(listing.message_date)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm">
                                                        {listing.agent_name || 'N/A'}
                                                    </div>
                                                    {listing.agent_contact && (
                                                        <>
                                                            {/* Popover version - for testing */}
                                                            {/* <WhatsAppMessagePopover listing={listing}>
                                                                <button
                                                                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    📞 {listing.agent_contact}
                                                                </button>
                                                            </WhatsAppMessagePopover> */}
                                                            {/* Dialog version - full screen modal */}
                                                            <WhatsAppMessageDialog listing={listing}>
                                                                <button
                                                                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    📞 {listing.agent_contact}
                                                                </button>
                                                            </WhatsAppMessageDialog>
                                                        </>
                                                    )}
                                                    {listing.company_name && (
                                                        <div className="text-xs text-gray-500">
                                                            {listing.company_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {listing.property_type || 'Property'}
                                                </div>
                                                {listing.size_sqft && (
                                                    <div className="text-xs text-gray-500">
                                                        {listing.size_sqft.toLocaleString('en-IN')} sq.ft
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {listing.configuration ? (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {listing.configuration}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-400">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    📍 {listing.location || 'No location'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold">
                                                    {formatPrice(listing.price)}
                                                </div>
                                                {listing.price_text && (
                                                    <div className="text-xs text-gray-500">
                                                        {listing.price_text}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getMessageTypeVariant(listing.transaction_type)}
                                                    className="text-xs"
                                                >
                                                    {formatMessageType(listing.transaction_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
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
                                                <TableCell colSpan={8} className="bg-gray-50">
                                                    <div className="space-y-2 py-2">
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

