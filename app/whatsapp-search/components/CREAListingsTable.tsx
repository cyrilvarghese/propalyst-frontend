/**
 * CREAListingsTable - Client Component
 * =====================================
 *
 * Data table component for displaying CREA listings with pagination.
 * Uses shadcn table component.
 */

'use client'

import { useState, useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'
import TableHeaderWithFilters from './TableHeaderWithFilters'
import WhatsAppMessagePopover from './WhatsAppMessagePopover'
import WhatsAppMessageDialog from './WhatsAppMessageDialog'

interface CREAListingsTableProps {
    listings: CREAListing[]
    onLocationFilter?: (location: string) => void
    locationFilter?: string
    onAgentFilter?: (agent: string) => void
    agentFilter?: string
    onPropertyFilter?: (property: string) => void
    propertyFilter?: string
    onTransactionTypeFilter?: (type: string) => void
    transactionTypeFilter?: string
    exactMatch?: boolean
    onExactMatchToggle?: (exactMatch: boolean) => void
    onResetFilters?: () => void
    // Server-side pagination props (optional)
    currentPage?: number
    totalPages?: number
    totalCount?: number
    onPageChange?: (page: number) => void
    itemsPerPage?: number
}

const ITEMS_PER_PAGE = 50

export default function CREAListingsTable({
    listings,
    onLocationFilter,
    locationFilter,
    onAgentFilter,
    agentFilter,
    onPropertyFilter,
    propertyFilter,
    onTransactionTypeFilter,
    transactionTypeFilter,
    exactMatch,
    onExactMatchToggle,
    onResetFilters,
    // Server-side pagination props
    currentPage: serverCurrentPage,
    totalPages: serverTotalPages,
    totalCount: serverTotalCount,
    onPageChange,
    itemsPerPage: serverItemsPerPage
}: CREAListingsTableProps) {
    // Client-side pagination state (only used if server-side pagination props are not provided)
    const [clientCurrentPage, setClientCurrentPage] = useState(1)
    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    // Determine if we're using server-side or client-side pagination
    const isServerSidePagination = serverCurrentPage !== undefined && serverTotalPages !== undefined && onPageChange !== undefined
    const currentPage = isServerSidePagination ? serverCurrentPage! : clientCurrentPage
    const itemsPerPage = serverItemsPerPage || ITEMS_PER_PAGE

    // Calculate pagination
    const totalPages = isServerSidePagination 
        ? serverTotalPages! 
        : Math.ceil(listings.length / itemsPerPage)
    
    const startIndex = isServerSidePagination
        ? (currentPage - 1) * itemsPerPage
        : (currentPage - 1) * itemsPerPage
    
    const endIndex = isServerSidePagination
        ? startIndex + listings.length
        : startIndex + itemsPerPage
    
    const totalCount = isServerSidePagination 
        ? serverTotalCount! 
        : listings.length

    // For server-side pagination, use all listings as-is; for client-side, slice them
    const paginatedListings = isServerSidePagination 
        ? listings 
        : listings.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        if (isServerSidePagination) {
            onPageChange!(page)
        } else {
            setClientCurrentPage(page)
        }
    }

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
                            onPropertyFilter={onPropertyFilter}
                            propertyFilter={propertyFilter}
                            onTransactionTypeFilter={onTransactionTypeFilter}
                            transactionTypeFilter={transactionTypeFilter}
                            exactMatch={exactMatch}
                            onExactMatchToggle={onExactMatchToggle}
                            onResetFilters={onResetFilters}
                            hasActiveFilters={
                                (locationFilter && locationFilter.trim().length > 0) ||
                                (agentFilter && agentFilter.trim().length > 0) ||
                                (propertyFilter && propertyFilter.trim().length > 0) ||
                                (transactionTypeFilter && transactionTypeFilter.trim().length > 0) ||
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
                                                    📅 {formatDate(listing.created_at)}
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
                                                {listing.configuration && (
                                                    <div className="text-xs text-gray-500">
                                                        {listing.configuration}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    📍 {listing.location || 'No location'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {listing.size_sqft ? (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {listing.size_sqft.toLocaleString('en-IN')} sq.ft
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-400">N/A</span>
                                                )}
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

            {/* Sticky Pagination */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg rounded-t-lg p-4 z-50">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalCount)} of {totalCount} listings
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {(() => {
                                const pages: (number | string)[] = []
                                const maxVisible = 10
                                
                                if (totalPages <= maxVisible) {
                                    // Show all pages if total is less than max
                                    for (let i = 1; i <= totalPages; i++) {
                                        pages.push(i)
                                    }
                                } else {
                                    // Show first page
                                    pages.push(1)
                                    
                                    let start = Math.max(2, currentPage - 2)
                                    let end = Math.min(totalPages - 1, currentPage + 2)
                                    
                                    if (start > 2) pages.push('...')
                                    
                                    for (let i = start; i <= end; i++) {
                                        pages.push(i)
                                    }
                                    
                                    if (end < totalPages - 1) pages.push('...')
                                    
                                    // Show last page
                                    pages.push(totalPages)
                                }
                                
                                return pages.map((page, idx) => {
                                    if (typeof page === 'string') {
                                        return <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
                                    }
                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className="w-10"
                                        >
                                            {page}
                                        </Button>
                                    )
                                })
                            })()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

