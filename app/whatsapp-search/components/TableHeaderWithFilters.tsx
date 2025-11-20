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
                <TableHead className="w-[150px]">Property</TableHead>
                <TableHead className="w-[150px]">Location</TableHead>
                <TableHead className="w-[120px]">Size</TableHead>
                <TableHead className="w-[150px]">Price</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[80px]"></TableHead>
            </TableRow>
            {/* Filter Row - Sticky below header */}
            <TableRow className="bg-gray-50 border-b sticky top-[48px] z-10">
                <TableHead className="h-12 p-2">
                    <div className="flex items-center gap-2">
                        {onExactMatchToggle && (
                            <Button
                                variant={exactMatch ? "default" : "outline"}
                                size="sm"
                                onClick={() => onExactMatchToggle(!exactMatch)}
                                className="h-8 text-xs gap-1.5"
                            >
                                {exactMatch ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                    <Circle className="h-3 w-3" />
                                )}
                                Exact
                            </Button>
                        )}
                        {hasActiveFilters && onResetFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onResetFilters}
                                className="h-8 w-8 p-0 text-xs"
                                title="Reset all filters"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </TableHead>
                <TableHead className="h-12 p-2">
                    {onAgentFilter && (
                        <Input
                            type="text"
                            placeholder="Filter by agent..."
                            value={agentFilter || ''}
                            onChange={(e) => onAgentFilter(e.target.value)}
                            className="h-8 text-xs"
                        />
                    )}
                </TableHead>
                <TableHead className="h-12 p-2">
                    {onPropertyFilter && (
                        <Input
                            type="text"
                            placeholder="Filter by property..."
                            value={propertyFilter || ''}
                            onChange={(e) => onPropertyFilter(e.target.value)}
                            className="h-8 text-xs"
                        />
                    )}
                </TableHead>
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
                <TableHead className="h-12 p-2">
                    {onTransactionTypeFilter && (
                        <Select
                            value={transactionTypeFilter || ''}
                            onValueChange={(value) => onTransactionTypeFilter(value === 'all' ? '' : value)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="sale">Buy</SelectItem>
                                <SelectItem value="sell">Sell</SelectItem>
                                <SelectItem value="sale">Sale</SelectItem>
                                <SelectItem value="requirement">Rent</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </TableHead>
                <TableHead className="h-12 p-0"></TableHead>
            </TableRow>
        </TableHeader>
    )
}

