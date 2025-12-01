/**
 * CompactPropertyCard - Compact, Scannable Property Card
 * ======================================================
 *
 * A minimal, scannable card optimized for quick property browsing.
 * Shows only essential information to reduce scrolling.
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Image from 'next/image'
import { Info, ExternalLink, ChevronDown, ChevronUp, User, Star } from 'lucide-react'
import { SquareYardsProperty } from '@/lib/services/property-scrape.service'

interface CompactPropertyCardProps {
    property: SquareYardsProperty
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
function getMatchesAndMismatches(property: SquareYardsProperty): { matches: string[]; mismatches: string[] } {
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

export default function CompactPropertyCard({ property }: CompactPropertyCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const relevanceColor = getRelevanceBadgeColor(property.relevance_score)

    return (
        <Card className="overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-indigo-300">
            <div className="flex gap-3 p-3">
                {/* Compact Image */}
                <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                    {property.image_url ? (
                        <Image
                            src={property.image_url}
                            alt={property.title || 'Property'}
                            fill
                            className="object-cover"
                            sizes="96px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {/* Title and Price Row */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">
                            {property.title || 'No title'}
                        </h3>
                        <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-gray-900">
                                {property.price || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <p className="text-xs text-gray-600 line-clamp-1">
                        📍 {property.location || 'No location'}
                    </p>

                    {/* Key Features - Compact (always visible) */}
                    <div className="flex flex-wrap gap-1">
                        {property.area && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <span className="inline-flex">
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 cursor-help">
                                            📐 {property.area}
                                        </Badge>
                                    </span>
                                </PopoverTrigger>
                                <PopoverContent className="w-64" align="start">
                                    <div className="text-sm">
                                        <p className="font-semibold mb-1">Area</p>
                                        <p className="text-gray-600">{property.area}</p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                        {property.bedrooms && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <span className="inline-flex">
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 cursor-help">
                                            🛏️ {property.bedrooms.split(' ')[0]}
                                        </Badge>
                                    </span>
                                </PopoverTrigger>
                                <PopoverContent className="w-64" align="start">
                                    <div className="text-sm">
                                        <p className="font-semibold mb-1">Bedrooms & Bathrooms</p>
                                        <p className="text-gray-600">{property.bedrooms}</p>
                                        {property.bathrooms && property.bathrooms !== property.bedrooms && (
                                            <p className="text-gray-600 mt-1">{property.bathrooms}</p>
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
                                            🚗 {property.parking.split(' ')[0]}
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
                            {property.description && (
                                <p className="text-xs text-gray-700 leading-relaxed">
                                    {property.description}
                                </p>
                            )}

                            {/* All Features with Icons */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {property.flooring && (
                                    <div className="flex items-center gap-1.5">
                                        <span>🏠</span>
                                        <span className="text-gray-600">{property.flooring}</span>
                                    </div>
                                )}
                                {property.furnishing && (
                                    <div className="flex items-center gap-1.5">
                                        <span>🪑</span>
                                        <span className="text-gray-600">{property.furnishing}</span>
                                    </div>
                                )}
                                {property.stairs && (
                                    <div className="flex items-center gap-1.5">
                                        <span>🪜</span>
                                        <span className="text-gray-600">{property.stairs}</span>
                                    </div>
                                )}
                                {property.road_view && (
                                    <div className="flex items-center gap-1.5">
                                        <span>🛣️</span>
                                        <span className="text-gray-600">{property.road_view}</span>
                                    </div>
                                )}
                            </div>

                            {/* Agent Info */}
                            {(property.agent_name || property.agent_rating || property.agent_url) && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="flex items-center gap-2 text-xs text-gray-700 hover:text-indigo-600 transition-colors w-full text-left">
                                            <User className="w-3 h-3" />
                                            <span className="font-medium">
                                                {property.agent_name || 'Agent'}
                                            </span>
                                            {property.agent_rating && (
                                                <div className="flex items-center gap-0.5">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                    <span>{property.agent_rating}</span>
                                                </div>
                                            )}
                                            {property.agent_url && (
                                                <ExternalLink className="w-3 h-3 ml-auto" />
                                            )}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80" align="start">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm">
                                                        {property.agent_name || 'Agent'}
                                                    </h4>
                                                    {property.agent_rating && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                            <span className="text-xs text-gray-600">
                                                                Rating: {property.agent_rating}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {property.agent_url && (
                                                <a
                                                    href={property.agent_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                                >
                                                    View Agent Profile
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    )}

                    {/* Relevance Score and Actions */}
                    <div className="flex items-center justify-between mt-auto pt-1">
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
            </div>
        </Card>
    )
}

