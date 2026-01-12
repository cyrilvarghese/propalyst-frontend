/**
 * useListingConverter - Custom Hook
 * ==================================
 * 
 * Converts WhatsAppListing to CREAListing format.
 */

import { useCallback } from 'react'
import { WhatsAppListing } from '@/lib/api/whatsapp-listings'
import { CREAListing } from '@/lib/services/crea-listings.service'

export function useListingConverter() {
    const convertToCREAListing = useCallback((listing: WhatsAppListing): CREAListing => {
        return {
            id: listing.id,
            created_at: listing.created_at,
            message_date: listing.message_date,
            agent_name: listing.agent_name || '',
            agent_contact: listing.agent_contact,
            company_name: listing.company_name,
            listing_type: listing.message_type,
            transaction_type: listing.message_type,
            property_type: listing.property_type || '',
            configuration: listing.bedrooms ? `${listing.bedrooms}BHK` : null,
            size_sqft: listing.area_sqft || 0,
            price: listing.price || 0,
            price_text: listing.price_text || '',
            location: listing.location || '',
            project_name: listing.project_name,
            facing: listing.facing_direction,
            floor: null,
            furnishing: listing.furnishing_status,
            parking: listing.parking_text || (listing.parking_count ? `${listing.parking_count} parking` : null),
            status: null,
            amenities: listing.special_features?.join(', ') || null,
            raw_message: listing.raw_message,
            sender_name: listing.sender_name
        }
    }, [])

    const convertListings = useCallback((listings: WhatsAppListing[]): CREAListing[] => {
        return listings.map(convertToCREAListing)
    }, [convertToCREAListing])

    return {
        convertToCREAListing,
        convertListings
    }
}

