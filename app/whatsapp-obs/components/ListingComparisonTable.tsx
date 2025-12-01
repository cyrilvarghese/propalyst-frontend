/**
 * ListingComparisonTable - Client Component
 * ==========================================
 *
 * Table component that displays side-by-side comparison of processed and raw listing data.
 */

'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface ComparisonData {
    processed: any
    raw: any
    comparison: {
        dates_match: boolean
        exact_text_match: boolean
        has_raw_message: boolean
    }
}

interface ListingComparisonTableProps {
    data: ComparisonData
}

export default function ListingComparisonTable({ data }: ListingComparisonTableProps) {
    const { processed, raw, comparison } = data

    // Common fields to compare
    const commonFields = [
        { key: 'id', label: 'ID', processedKey: 'id', rawKey: 'id' },
        { key: 'message_date', label: 'Message Date', processedKey: 'message_date', rawKey: 'message_date' },
        { key: 'agent_contact', label: 'Agent Contact', processedKey: 'agent_contact', rawKey: 'sender_name' },
        { key: 'agent_name', label: 'Agent Name', processedKey: 'agent_name', rawKey: null },
        { key: 'message_text', label: 'Message Text', processedKey: 'raw_message', rawKey: 'message_text' },
        { key: 'property_type', label: 'Property Type', processedKey: 'property_type', rawKey: null },
        { key: 'location', label: 'Location', processedKey: 'location', rawKey: null },
        { key: 'price', label: 'Price', processedKey: 'price', rawKey: null },
        { key: 'area_sqft', label: 'Area (sqft)', processedKey: 'area_sqft', rawKey: null },
        { key: 'bedroom_count', label: 'Bedrooms', processedKey: 'bedroom_count', rawKey: null },
        { key: 'source_file', label: 'Source File', processedKey: null, rawKey: 'source_file' },
        { key: 'line_number', label: 'Line Number', processedKey: null, rawKey: 'line_number' },
    ]

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return 'N/A'
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
    }

    const areValuesEqual = (processedValue: any, rawValue: any): boolean => {
        if (processedValue === null && rawValue === null) return true
        if (processedValue === null || rawValue === null) return false
        return String(processedValue) === String(rawValue)
    }

    return (
        <div className="space-y-4">


            {/* Comparison Table */}
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Field</TableHead>
                            <TableHead className="bg-blue-50">Processed</TableHead>
                            <TableHead className="bg-green-50">Raw</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {commonFields
                            .filter((field) => {
                                const processedValue = field.processedKey ? processed[field.processedKey] : null
                                const rawValue = field.rawKey ? raw[field.rawKey] : null
                                // Only show rows where at least one side has actual data (not null/undefined)
                                return processedValue !== null && processedValue !== undefined ||
                                    rawValue !== null && rawValue !== undefined
                            })
                            .map((field) => {
                                const processedValue = field.processedKey ? processed[field.processedKey] : null
                                const rawValue = field.rawKey ? raw[field.rawKey] : null
                                const match = field.processedKey && field.rawKey
                                    ? areValuesEqual(processedValue, rawValue)
                                    : null

                                // Only show "N/A" if the other side has data, otherwise skip the row entirely
                                const hasProcessedData = processedValue !== null && processedValue !== undefined
                                const hasRawData = rawValue !== null && rawValue !== undefined

                                return (
                                    <TableRow key={field.key}>
                                        <TableCell className="font-medium">{field.label}</TableCell>
                                        <TableCell className="bg-blue-50/50">
                                            <div className="text-sm whitespace-pre-wrap break-words">
                                                {hasProcessedData ? formatValue(processedValue) : '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="bg-green-50/50">
                                            <div className="text-sm whitespace-pre-wrap break-words">
                                                {hasRawData ? formatValue(rawValue) : '-'}
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                )
                            })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

