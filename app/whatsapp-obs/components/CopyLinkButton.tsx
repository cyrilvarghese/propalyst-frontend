/**
 * CopyLinkButton - Client Component
 * ==================================
 *
 * Button component that copies a link to view the listing detail page.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Link as LinkIcon } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'

interface CopyLinkButtonProps {
    listing: CREAListing
}

export default function CopyLinkButton({ listing }: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const copyLink = async () => {
        // Create a link to the listing detail page
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const listingUrl = `${baseUrl}/listing/${listing.id}`

        try {
            await navigator.clipboard.writeText(listingUrl)

            // Clear any existing timeout before setting a new one
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            setCopied(true)
            timeoutRef.current = setTimeout(() => {
                setCopied(false)
                timeoutRef.current = null
            }, 2000)
        } catch (err) {
            console.error('Failed to copy link:', err)
        }
    }

    return (
        <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 hover:underline border border-purple-300 rounded px-2 py-1 bg-purple-50 hover:bg-purple-100 transition-colors"
        >
            <LinkIcon className="h-3 w-3" />
            {copied ? '✓ Link Copied!' : 'Copy Link'}
        </button>
    )
}

