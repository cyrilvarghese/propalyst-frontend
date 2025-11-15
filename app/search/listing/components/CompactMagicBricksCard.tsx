/**
 * CompactMagicBricksCard - Compact MagicBricks Property Card
 * ===========================================================
 *
 * A minimal, scannable card optimized for MagicBricks properties.
 * Shows MagicBricks-specific fields in a compact layout.
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Info, ExternalLink, ChevronDown, ChevronUp, User, Star, Building2 } from 'lucide-react'
import { MagicBricksProperty } from '@/lib/services/property-scrape.service'

interface CompactMagicBricksCardProps {
    property: MagicBricksProperty

}

/**
 * Get badge color based on relevance score
 */
function getRelevanceBadgeColor(score?: number): string {
    if (score === undefined || score === null) return 'bg-gray-100 text-gray-700'
    const normalizedScore = Math.max(0, Math.min(10, score))

    if (normalizedScore >= 8) return 'bg-green-500 text-white'
    if (normalizedScore >= 6) return 'bg-green-400 text-white'
    if (normalizedScore >= 4) return 'bg-yellow-400 text-yellow-900'
    if (normalizedScore >= 2) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
}

/**
 * Parse relevance reason into matches and mismatches (for backward compatibility)
 */
function parseRelevanceReason(reason: string): { matches: string; mismatches: string } {
    const matchesPattern = /Matches?:\s*([^.]*(?:\.[^M]*?)*?)(?=Mismatch|$)/i
    const mismatchesPattern = /Mismatches?:\s*([^.]*(?:\.[^M]*?)*?)$/i

    const matchesMatch = reason.match(matchesPattern)
    const mismatchesMatch = reason.match(mismatchesPattern)

    return {
        matches: matchesMatch ? matchesMatch[1].trim() : '',
        mismatches: mismatchesMatch ? mismatchesMatch[1].trim() : reason
    }
}

/**
 * Get matches and mismatches from property (uses arrays if available, fallback to parsing)
 */
function getMatchesAndMismatches(property: MagicBricksProperty): { matches: string[]; mismatches: string[] } {
    // If new format with arrays, use them directly
    if (property.matches || property.mismatches) {
        return {
            matches: property.matches || [],
            mismatches: property.mismatches || []
        }
    }

    // Fallback to parsing relevance_reason (old format)
    if (property.relevance_reason) {
        const parsed = parseRelevanceReason(property.relevance_reason)
        return {
            matches: parsed.matches ? [parsed.matches] : [],
            mismatches: parsed.mismatches ? [parsed.mismatches] : []
        }
    }

    return { matches: [], mismatches: [] }
}

export default function CompactMagicBricksCard({ property }: CompactMagicBricksCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const relevanceColor = getRelevanceBadgeColor(property.relevance_score)

    // Extract BHK info from title
    const bhkMatch = property.title.match(/(\d+)\s*BHK/i)
    const bhk = bhkMatch ? bhkMatch[1] + ' BHK' : ''

    // Determine which area field to show (priority: area > carpet_area > super_area)
    const areaValue = property.area || property.carpet_area || property.super_area
    const areaLabel = property.area ? 'Area' : property.carpet_area ? 'Carpet Area' : 'Super Area'

    return (
        <Card className="overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-indigo-300">
            <div className="p-3 space-y-2">
                {/* Posted Date - Top Left */}
                {property.posted_date && (
                    <p className="text-xs text-gray-500 mb-1">
                        Posted: {property.posted_date}
                    </p>
                )}
                {/* Header: Title and Price */}
                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
                            {property.title || 'No title'}
                        </h3>
                    </div>

                    {/* Price and Photo Count */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-gray-900">
                            {property.price || 'N/A'}
                        </div>
                        {property.photo_count && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                                📷 {property.photo_count}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Society Name (if available) */}
                {property.society_name && (
                    <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-gray-500" />
                        {property.society_url ? (
                            <a
                                href={property.society_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
                            >
                                {property.society_name}
                            </a>
                        ) : (
                            <span className="text-xs text-gray-600">{property.society_name}</span>
                        )}
                    </div>
                )}

                {/* Key Features - Always Visible */}
                <div className="flex flex-wrap gap-1">
                    {areaValue && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <span className="inline-flex">
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 cursor-help">
                                        📐 {areaValue}
                                    </Badge>
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-64" align="start">
                                <div className="text-sm">
                                    <p className="font-semibold mb-1">{areaLabel}</p>
                                    <p className="text-gray-600">{areaValue}</p>
                                    {property.price_per_sqft && (
                                        <p className="text-gray-500 text-xs mt-1">
                                            {property.price_per_sqft}
                                        </p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    {bhk && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <span className="inline-flex">
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 cursor-help">
                                        🛏️ {bhk}
                                    </Badge>
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-64" align="start">
                                <div className="text-sm space-y-1">
                                    <p className="font-semibold mb-1">Rooms</p>
                                    <p className="text-gray-600">{bhk}</p>
                                    {property.bathroom && (
                                        <p className="text-gray-600">Bathrooms: {property.bathroom}</p>
                                    )}
                                    {property.balcony && (
                                        <p className="text-gray-600">Balconies: {property.balcony}</p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    {property.facing && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <span className="inline-flex">
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 cursor-help">
                                        🧭 {property.facing}
                                    </Badge>
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-64" align="start">
                                <div className="text-sm">
                                    <p className="font-semibold mb-1">Facing</p>
                                    <p className="text-gray-600">{property.facing}</p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    {property.parking && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <span className="inline-flex">
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 cursor-help">
                                        🚗 {property.parking}
                                    </Badge>
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-64" align="start">
                                <div className="text-sm">
                                    <p className="font-semibold mb-1">Parking</p>
                                    <p className="text-gray-600">{property.parking}</p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                        {/* Description */}
                        {<p className="text-xs text-gray-700 leading-relaxed"> 
                            {property.description || property.description2 || 'No description'}
                        </p>
                        }

                        {/* All Features with Icons */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {property.floor && (
                                <div className="flex items-center gap-1.5">
                                    <span>🏢</span>
                                    <span className="text-gray-600">{property.floor}</span>
                                </div>
                            )}
                            {property.status && (
                                <div className="flex items-center gap-1.5">
                                    <span>📅</span>
                                    <span className="text-gray-600">{property.status}</span>
                                </div>
                            )}
                            {property.furnishing && (
                                <div className="flex items-center gap-1.5">
                                    <span>🪑</span>
                                    <span className="text-gray-600">{property.furnishing}</span>
                                </div>
                            )}
                            {property.transaction && (
                                <div className="flex items-center gap-1.5">
                                    <span>💼</span>
                                    <span className="text-gray-600">{property.transaction}</span>
                                </div>
                            )}
                            {property.overlooking && (
                                <div className="flex items-center gap-1.5 col-span-2">
                                    <span>👁️</span>
                                    <span className="text-gray-600">{property.overlooking}</span>
                                </div>
                            )}
                            {property.ownership && (
                                <div className="flex items-center gap-1.5">
                                    <span>📝</span>
                                    <span className="text-gray-600">{property.ownership}</span>
                                </div>
                            )}
                            {property.posted_date && (
                                <div className="flex items-center gap-1.5">
                                    <span>🕒</span>
                                    <span className="text-gray-600">{property.posted_date}</span>
                                </div>
                            )}
                        </div>

                        {/* Agent Info */}
                        {(property.agent_name || property.buyers_served) && (
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-700">
                                    <User className="w-3 h-3" />
                                    <span className="font-medium">
                                        {property.agent_name || 'Agent'}
                                    </span>
                                </div>
                                {property.buyers_served && (
                                    <p className="text-xs text-gray-500 ml-5">
                                        {property.buyers_served}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                        {property.relevance_score !== undefined && (
                            <>
                                <Badge className={`text-xs px-2 py-0 h-5 font-semibold ${relevanceColor}`}>
                                    {property.relevance_score}/10
                                </Badge>
                                {property.relevance_reason && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-gray-100 transition-colors"
                                                aria-label="View relevance reason"
                                            >
                                                <Info className="h-3 w-3 text-gray-500" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-96" align="start">
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-sm leading-none border-b pb-2">
                                                    Relevance Score: {property.relevance_score}/10
                                                </h4>
                                                {(() => {
                                                    const { matches, mismatches } = getMatchesAndMismatches(property)
                                                    return (
                                                        <>
                                                            {matches.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1">
                                                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                                                        Matches
                                                                    </p>
                                                                    <ul className="space-y-1 pl-3 border-l-2 border-green-200">
                                                                        {matches.map((match, idx) => (
                                                                            <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                                                                                • {match}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {mismatches.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide flex items-center gap-1">
                                                                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                                                        Mismatches
                                                                    </p>
                                                                    <ul className="space-y-1 pl-3 border-l-2 border-red-200">
                                                                        {mismatches.map((mismatch, idx) => (
                                                                            <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                                                                                • {mismatch}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {matches.length === 0 && mismatches.length === 0 && property.relevance_reason && (
                                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                                    {property.relevance_reason}
                                                                </p>
                                                            )}
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Expand/Collapse Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="w-3 h-3" />
                                    <span>Less</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3 h-3" />
                                    <span>More</span>
                                </>
                            )}
                        </button>

                        {/* View Link */}
                        {property.property_url && (
                            <a
                                href={property.property_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                View
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

