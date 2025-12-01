/**
 * CopyLinkButton - Client Component
 * ==================================
 *
 * Button component that copies the listing detail page link to clipboard.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'

interface CopyLinkButtonProps {
    listing: CREAListing
}

export default function CopyLinkButton({ listing }: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false)
    const router = useRouter()

    const copyLink = async () => {
        try {
            // Get the current origin (domain)
            const origin = typeof window !== 'undefined' ? window.location.origin : ''
            const listingUrl = `${origin}/listing/${listing.id}`

            // Copy to clipboard
            await navigator.clipboard.writeText(listingUrl)
            setCopied(true)

            // Navigate to the listing page
            router.push(`/listing/${listing.id}`)
        } catch (err) {
            console.error('Failed to copy link:', err)
            // Still navigate even if copy fails
            router.push(`/listing/${listing.id}`)
        }
    }

    return (
        <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 hover:underline border border-purple-300 rounded px-2 py-1 bg-purple-50 hover:bg-purple-100 transition-colors"
        >
            <LinkIcon className="h-3 w-3" />
            {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
    )
}

