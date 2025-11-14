/**
 * ScrapedPropertyCard - Client Component
 * =======================================
 *
 * Displays a single scraped property with all its details.
 * This is a Client Component because it uses Popover for interactivity.
 */

'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Image from 'next/image'
import { Info } from 'lucide-react'
import { ScrapedProperty } from '@/lib/services/property-scrape.service'
import AgentCard from './AgentCard'

interface ScrapedPropertyCardProps {
    property: ScrapedProperty
}

/**
 * Get subtle background color based on relevance score
 * Green (high relevance) to Red (low relevance)
 * Score range: 0-10 (assuming, but flexible)
 */
function getRelevanceColor(score?: number): string {
    if (score === undefined || score === null) {
        return 'bg-white' // Default white if no score
    }

    // Normalize score to 0-10 range
    const normalizedScore = Math.max(0, Math.min(10, score))

    // Create gradient from green (10) to red (0)
    // Using very subtle colors
    if (normalizedScore >= 8) {
        return 'bg-green-50/50' // Very subtle green for high relevance
    } else if (normalizedScore >= 6) {
        return 'bg-green-50/30' // Lighter green
    } else if (normalizedScore >= 4) {
        return 'bg-yellow-50/30' // Subtle yellow for medium
    } else if (normalizedScore >= 2) {
        return 'bg-orange-50/30' // Subtle orange
    } else {
        return 'bg-red-50/30' // Very subtle red for low relevance
    }
}

/**
 * Get badge variant and color based on relevance score
 */
function getRelevanceBadgeStyle(score?: number): { variant: "default" | "secondary" | "outline" | "destructive", className: string } {
    if (score === undefined || score === null) {
        return { variant: "outline", className: "" }
    }

    const normalizedScore = Math.max(0, Math.min(10, score))

    if (normalizedScore >= 8) {
        return {
            variant: "default",
            className: "bg-green-500 hover:bg-green-600 text-white border-green-600"
        }
    } else if (normalizedScore >= 6) {
        return {
            variant: "default",
            className: "bg-green-400 hover:bg-green-500 text-white border-green-500"
        }
    } else if (normalizedScore >= 4) {
        return {
            variant: "secondary",
            className: "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-500"
        }
    } else if (normalizedScore >= 2) {
        return {
            variant: "outline",
            className: "bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300"
        }
    } else {
        return {
            variant: "destructive",
            className: "bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
        }
    }
}

/**
 * Parse relevance reason into matches and mismatches
 */
function parseRelevanceReason(reason: string): { matches: string; mismatches: string } {
    // Try to split by "Matches:" and "Mismatches:" patterns
    const matchesPattern = /Matches?:\s*([^.]*(?:\.[^M]*?)*?)(?=Mismatch|$)/i
    const mismatchesPattern = /Mismatches?:\s*([^.]*(?:\.[^M]*?)*?)$/i

    const matchesMatch = reason.match(matchesPattern)
    const mismatchesMatch = reason.match(mismatchesPattern)

    return {
        matches: matchesMatch ? matchesMatch[1].trim() : '',
        mismatches: mismatchesMatch ? mismatchesMatch[1].trim() : reason
    }
}

export default function ScrapedPropertyCard({ property }: ScrapedPropertyCardProps) {
    const relevanceBgColor = getRelevanceColor(property.relevance_score)

    return (
        <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${relevanceBgColor}`}>
            <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                <div className="relative w-full md:w-64 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                    {property.image_url ? (
                        <Image
                            src={property.image_url}
                            alt={property.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 256px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            No Image
                        </div>
                    )}
                </div>

                {/* Property Details */}
                <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {property.title || 'No title'}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                📍 {property.location || 'No location data'}
                            </p>
                        </div>
                        <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {property.price || 'Price not available'}
                            </div>
                            {property.price_crore && property.price_crore !== property.price && (
                                <div className="text-xs text-gray-500">{property.price_crore}</div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {property.description && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                            {property.description}
                        </p>
                    )}

                    {/* Property Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {property.bedrooms && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                🛏️ {property.bedrooms}
                            </Badge>
                        )}
                        {property.bathrooms && property.bathrooms !== property.bedrooms && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                🚿 {property.bathrooms}
                            </Badge>
                        )}
                        {property.area && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                📐 {property.area}
                            </Badge>
                        )}
                        {property.facing && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                🧭 {property.facing}
                            </Badge>
                        )}
                        {property.parking && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                🚗 {property.parking}
                            </Badge>
                        )}
                        {property.flooring && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                🏠 {property.flooring}
                            </Badge>
                        )}
                        {property.furnishing && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                🪑 {property.furnishing}
                            </Badge>
                        )}
                        {property.stairs && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                🪜 {property.stairs}
                            </Badge>
                        )}
                        {property.road_view && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                🛣️ {property.road_view}
                            </Badge>
                        )}
                    </div>

                    {/* Relevance Score */}
                    {property.relevance_score !== undefined && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={getRelevanceBadgeStyle(property.relevance_score).variant}
                                    className={`text-xs font-semibold ${getRelevanceBadgeStyle(property.relevance_score).className}`}
                                >
                                    Relevance: {property.relevance_score}/10
                                </Badge>
                                {property.relevance_reason && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                className="inline-flex items-center justify-center rounded-full p-1 hover:bg-gray-100 transition-colors"
                                                aria-label="View relevance reason"
                                            >
                                                <Info className="h-4 w-4 text-gray-500" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-96" align="start">
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-sm leading-none border-b pb-2">
                                                    Relevance Score: {property.relevance_score}/10
                                                </h4>
                                                {(() => {
                                                    const { matches, mismatches } = parseRelevanceReason(property.relevance_reason || '')
                                                    return (
                                                        <>
                                                            {matches && (
                                                                <div className="space-y-1">
                                                                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1">
                                                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                                                        Matches
                                                                    </p>
                                                                    <p className="text-sm text-gray-700 leading-relaxed pl-3 border-l-2 border-green-200">
                                                                        {matches}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {mismatches && (
                                                                <div className="space-y-1">
                                                                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide flex items-center gap-1">
                                                                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                                                        Mismatches
                                                                    </p>
                                                                    <p className="text-sm text-gray-700 leading-relaxed pl-3 border-l-2 border-red-200">
                                                                        {mismatches}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {!matches && !mismatches && (
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
                            </div>
                        </div>
                    )}

                    {/* Agent Card */}
                    {(property.agent_name || property.agent_rating || property.agent_url) && (
                        <div className="mb-4">
                            <AgentCard
                                agentName={property.agent_name}
                                agentRating={property.agent_rating}
                                agentUrl={property.agent_url}
                            />
                        </div>
                    )}

                    {/* View Property Link */}
                    {property.property_url && (
                        <a
                            href={property.property_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            View Full Listing
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </Card>
    )
}

