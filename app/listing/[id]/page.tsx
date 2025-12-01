/**
 * Listing Detail Page - Server Component
 * =======================================
 *
 * Page that displays detailed comparison of a single listing.
 * Route: /listing/[id]
 */

import { notFound } from 'next/navigation'
import ListingDetailContent from './ListingDetailContent'

interface PageProps {
    params: {
        id: string
    }
}

export default async function ListingDetailPage({ params }: PageProps) {
    const { id } = params

    if (!id) {
        notFound()
    }

    return <ListingDetailContent listingId={id} />
}

