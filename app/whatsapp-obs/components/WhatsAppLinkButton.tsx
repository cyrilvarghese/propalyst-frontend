/**
 * WhatsAppLinkButton - Client Component
 * ======================================
 *
 * Simple component that opens WhatsApp directly with the listing's raw_message.
 * No dialog - just direct navigation to WhatsApp.
 */

'use client'

import { CREAListing } from '@/lib/services/crea-listings.service'

interface WhatsAppLinkButtonProps {
    listing: CREAListing
    initialPhoneNumber?: string
    children: React.ReactNode
}

export default function WhatsAppLinkButton({ listing, initialPhoneNumber, children }: WhatsAppLinkButtonProps) {
    // Format phone number for WhatsApp
    const formatPhoneForWhatsApp = (phone: string): string => {
        const digitsOnly = phone.replace(/\D/g, '')
        if (digitsOnly.length === 10) {
            return `91${digitsOnly}`
        }
        if (digitsOnly.startsWith('91')) {
            return digitsOnly
        }
        return digitsOnly
    }

    // Handle click - open WhatsApp directly
    const handleClick = () => {
        // Determine which phone number to use
        let phoneNumber = initialPhoneNumber

        // If no initial phone number, try to get from listing
        if (!phoneNumber && listing.agent_contact) {
            const numbers = listing.agent_contact.split(/[,/\n]+/).map(n => n.trim()).filter(Boolean)
            if (numbers.length > 0) {
                phoneNumber = numbers[0]
            }
        }

        if (!phoneNumber) {
            console.warn('No phone number available for WhatsApp link')
            return
        }

        // Get raw message from listing and prepend greeting
        const rawMessage = listing.raw_message || ''
        const messageWithGreeting = `Hi - I saw this message on https://mls.propalyst.com\n\n${rawMessage}`

        // Format and encode
        const formattedPhone = formatPhoneForWhatsApp(phoneNumber)
        const encodedMessage = encodeURIComponent(messageWithGreeting)
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`

        // Open WhatsApp
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }

    return (
        <div onClick={handleClick} className="cursor-pointer">
            {children}
        </div>
    )
}

