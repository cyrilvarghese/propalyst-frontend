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
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Circle, X } from 'lucide-react'

interface TableHeaderWithFiltersProps {
    onLocationFilter?: (location: string) => void
    locationFilter?: string
    onAgentFilter?: (agent: string) => void
    agentFilter?: string
    onPropertyFilter?: (property: string) => void
    propertyFilter?: string
    onBedroomCountFilter?: (bedroomCount: string) => void
    bedroomCountFilter?: string
    onTransactionTypeFilter?: (type: string) => void
    transactionTypeFilter?: string
    exactMatch?: boolean
    onExactMatchToggle?: (exactMatch: boolean) => void
    onResetFilters?: () => void
    hasActiveFilters?: boolean
}

export default function TableHeaderWithFilters({
    onLocationFilter,
    locationFilter,
    onAgentFilter,
    agentFilter,
    onPropertyFilter,
    propertyFilter,
    onBedroomCountFilter,
    bedroomCountFilter,
    onTransactionTypeFilter,
    transactionTypeFilter,
    exactMatch = false,
    onExactMatchToggle,
    onResetFilters,
    hasActiveFilters = false
}: TableHeaderWithFiltersProps) {
    return (
        <TableHeader className="sticky top-0 bg-white z-10 border-b">
            {/* Header Row */}
            <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[200px]">Agent</TableHead>
                <TableHead className="w-[150px]">Asset Type</TableHead>
                <TableHead className="w-[120px]">Bedrooms</TableHead>
                <TableHead className="w-[150px]">Location</TableHead>
                <TableHead className="w-[150px]">Price</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[80px]"></TableHead>
            </TableRow>
            {/* Filter Row - Sticky below header */}
            <TableRow className="bg-gray-50 border-b sticky top-[48px] z-10">
                <TableHead className="h-12 p-2">

                </TableHead>
                <TableHead className="h-12 p-2">
                    {onAgentFilter && (
                        <Input
                            type="text"
                            placeholder="Filter by agent..."
                            value={agentFilter || ''}
                            onChange={(e) => onAgentFilter(e.target.value)}
                            className={`h-8 text-xs ${agentFilter && agentFilter.trim().length > 0
                                ? 'border-accent focus:ring-accent focus:ring-2 bg-accent/5'
                                : ''
                                }`}
                        />
                    )}
                </TableHead>
                <TableHead className="h-12 p-2">
                    {onPropertyFilter && (
                        <Select
                            value={propertyFilter || 'all'}
                            onValueChange={(value) => onPropertyFilter(value === 'all' ? '' : value)}
                        >
                            <SelectTrigger
                                className={`h-8 text-xs ${propertyFilter && propertyFilter.trim().length > 0
                                    ? 'border-accent focus:ring-accent focus:ring-2 bg-accent/5'
                                    : ''
                                    }`}
                            >
                                <SelectValue placeholder="All asset types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All asset types</SelectItem>
                                <SelectItem value="apartment">Apartment</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                                <SelectItem value="independent_house">Independent House</SelectItem>
                                <SelectItem value="plot">Plot</SelectItem>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="warehouse">Warehouse</SelectItem>
                                <SelectItem value="pg_hostel">PG/Hostel</SelectItem>
                                <SelectItem value="farmhouse">Farmhouse</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </TableHead>
                <TableHead className="h-12 p-2">
                    {onBedroomCountFilter && (
                        <Select
                            value={bedroomCountFilter || 'all'}
                            onValueChange={(value) => onBedroomCountFilter(value === 'all' ? '' : value)}
                        >
                            <SelectTrigger
                                className={`h-8 text-xs ${bedroomCountFilter && bedroomCountFilter.trim().length > 0
                                    ? 'border-accent focus:ring-accent focus:ring-2 bg-accent/5'
                                    : ''
                                    }`}
                            >
                                <SelectValue placeholder="All bedrooms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All bedrooms</SelectItem>
                                <SelectItem value="1">1 BHK</SelectItem>
                                <SelectItem value="2">2 BHK</SelectItem>
                                <SelectItem value="3">3 BHK</SelectItem>
                                <SelectItem value="4">4 BHK</SelectItem>
                                <SelectItem value="5">5 BHK</SelectItem>
                                <SelectItem value="6">6+ BHK</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </TableHead>
                <TableHead className="h-12 p-2">
                    {onLocationFilter && (
                        <Input
                            type="text"
                            placeholder="Filter by location..."
                            value={locationFilter || ''}
                            onChange={(e) => onLocationFilter(e.target.value)}
                            className={`h-8 text-xs ${locationFilter && locationFilter.trim().length > 0
                                ? 'border-accent focus:ring-accent focus:ring-2 bg-accent/5'
                                : ''
                                }`}
                        />
                    )}
                </TableHead>
                <TableHead className="h-12 p-0"></TableHead>
                <TableHead className="h-12 p-2">
                    {onTransactionTypeFilter && (
                        <Select
                            value={transactionTypeFilter || 'all'}
                            onValueChange={(value) => onTransactionTypeFilter(value === 'all' ? '' : value)}
                        >
                            <SelectTrigger
                                className={`h-8 text-xs ${transactionTypeFilter && transactionTypeFilter.trim().length > 0
                                    ? 'border-accent focus:ring-accent focus:ring-2 bg-accent/5'
                                    : ''
                                    }`}
                            >
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="supply_sale">Supply - Sale</SelectItem>
                                <SelectItem value="supply_rent">Supply - Rent</SelectItem>
                                <SelectItem value="demand_buy">Demand - Buy</SelectItem>
                                <SelectItem value="demand_rent">Demand - Rent</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </TableHead>
                <TableHead className="h-12 p-0"></TableHead>
            </TableRow>
        </TableHeader>
    )
}

