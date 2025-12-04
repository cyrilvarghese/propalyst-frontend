/**
 * TableHeaderWithFilters - Component
 * ===================================
 *
 * Simple table header component (filters moved to SearchInput).
 */

import {
    TableHeader,
    TableHead,
    TableRow,
} from '@/components/ui/table'

interface TableHeaderWithFiltersProps {
    onLocationFilter?: (location: string) => void
    locationFilter?: string
    onAgentFilter?: (agent: string) => void
    agentFilter?: string
    onBedroomCountFilter?: (bedroomCount: string) => void
    bedroomCountFilter?: string
    exactMatch?: boolean
    onExactMatchToggle?: (exactMatch: boolean) => void
    onResetFilters?: () => void
    hasActiveFilters?: boolean
}

export default function TableHeaderWithFilters(props: TableHeaderWithFiltersProps) {
    return (
        <TableHeader className="sticky top-0 bg-gray-500 z-10 border-b border-gray-600">

            {/* Header Row */}
            <TableRow  >
                <TableHead className="w-[140px] text-gray-100 font-semibold">Date</TableHead>
                <TableHead className="w-[250px] text-gray-100 font-semibold">Agent</TableHead>
                <TableHead className="w-[150px] text-gray-100 font-semibold">Asset Type</TableHead>
                <TableHead className="w-[100px] text-gray-100 font-semibold">Bedrooms</TableHead>
                <TableHead className="w-[150px] text-gray-100 font-semibold">Location</TableHead>
                <TableHead className="w-[150px] text-gray-100 font-semibold">Price</TableHead>
                <TableHead className="w-[100px] text-gray-100 font-semibold">Type</TableHead>
                <TableHead className="w-[80px] text-gray-100 font-semibold"></TableHead>
            </TableRow>
        </TableHeader>
    )
}
