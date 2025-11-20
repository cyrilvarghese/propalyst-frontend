/**
 * TableHeaderWithFilters - Component
 * ===================================
 *
 * Combined table header and filter row component.
 */

import {
    TableHeader,
    TableHead,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'

interface TableHeaderWithFiltersProps {
    onLocationFilter?: (location: string) => void
    locationFilter?: string
}

export default function TableHeaderWithFilters({ 
    onLocationFilter, 
    locationFilter 
}: TableHeaderWithFiltersProps) {
    return (
        <TableHeader className="sticky top-0 bg-white z-10 border-b">
            {/* Header Row */}
            <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[200px]">Agent</TableHead>
                <TableHead className="w-[150px]">Property</TableHead>
                <TableHead className="w-[150px]">Location</TableHead>
                <TableHead className="w-[120px]">Size</TableHead>
                <TableHead className="w-[150px]">Price</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[80px]"></TableHead>
            </TableRow>
            {/* Filter Row - Sticky below header */}
            <TableRow className="bg-gray-50 border-b sticky top-[48px] z-10">
                <TableHead className="h-12 p-0"></TableHead>
                <TableHead className="h-12 p-0"></TableHead>
                <TableHead className="h-12 p-0"></TableHead>
                <TableHead className="h-12 p-2">
                    {onLocationFilter && (
                        <Input
                            type="text"
                            placeholder="Filter by location..."
                            value={locationFilter || ''}
                            onChange={(e) => onLocationFilter(e.target.value)}
                            className="h-8 text-xs"
                        />
                    )}
                </TableHead>
                <TableHead className="h-12 p-0"></TableHead>
                <TableHead className="h-12 p-0"></TableHead>
                <TableHead className="h-12 p-0"></TableHead>
                <TableHead className="h-12 p-0"></TableHead>
            </TableRow>
        </TableHeader>
    )
}

