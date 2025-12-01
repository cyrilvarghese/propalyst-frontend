/**
 * AgentCard Component
 * ===================
 * 
 * Displays agent information with a clickable card that links to their profile.
 */

'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Star, User } from 'lucide-react'

interface AgentCardProps {
    agentName?: string
    agentRating?: string
    agentUrl?: string
}

export default function AgentCard({ agentName, agentRating, agentUrl }: AgentCardProps) {
    // Don't render if no agent info
    if (!agentName && !agentRating && !agentUrl) {
        return null
    }

    const content = (
        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors rounded-lg">
            {/* Agent Avatar */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {agentName || 'Agent'}
                    </p>
                    {agentUrl && (
                        <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    )}
                </div>
                {agentRating && (
                    <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium text-gray-600">
                            {agentRating}
                        </span>
                        <Badge variant="secondary" className="text-xs ml-1">
                            Agent
                        </Badge>
                    </div>
                )}
            </div>

            {/* View Profile Arrow */}
            {agentUrl && (
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    )

    // If there's an agent URL, wrap in a clickable link
    if (agentUrl) {
        return (
            <a
                href={agentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
            >
                <Card className="border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                    {content}
                </Card>
            </a>
        )
    }

    // Otherwise just show the card
    return (
        <Card className="border border-gray-200">
            {content}
        </Card>
    )
}





