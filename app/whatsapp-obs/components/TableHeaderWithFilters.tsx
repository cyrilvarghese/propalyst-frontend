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
        <TableHeader className="sticky top-0 bg-[#0F172A] z-10 shadow-md">
            {/* Header Row */}
            <TableRow className="hover:bg-[#0F172A] border-b border-gray-800">
                <TableHead className="w-[140px] text-gray-300 font-medium py-4">Date</TableHead>
                <TableHead className="w-[200px] text-gray-300 font-medium py-4">Agent</TableHead>
                <TableHead className="w-[150px] text-gray-300 font-medium py-4">Asset Type</TableHead>
                <TableHead className="w-[100px] text-gray-300 font-medium py-4">Bedrooms</TableHead>
                <TableHead className="w-[200px] text-gray-300 font-medium py-4">Location</TableHead>
                <TableHead className="w-[150px] text-gray-300 font-medium py-4">Price</TableHead>
                <TableHead className="w-[100px] text-gray-300 font-medium py-4">Type</TableHead>
                <TableHead className="w-[30px] text-gray-300 font-medium py-4"></TableHead>
            </TableRow>
        </TableHeader>
    )
}
