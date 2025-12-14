'use client'

import { Phone } from 'lucide-react'
import WhatsAppLinkButton from './WhatsAppLinkButton'
import { CREAListing } from '@/lib/services/crea-listings.service'

interface AgentContactDisplayProps {
    listing: CREAListing
}

const isPhoneNumber = (contact: string): boolean => {
    return /\d/.test(contact) && !/[a-zA-Z]/.test(contact)
}

const PhoneButton = ({ contact, listing }: { contact: string; listing: CREAListing }) => (
    <WhatsAppLinkButton listing={listing} initialPhoneNumber={contact}>
        <button className="text-xs text-slate-600 hover:text-slate-900 hover:underline inline-flex items-center gap-1 cursor-pointer">
            <Phone className="w-3 h-3" /> ({contact})
        </button>
    </WhatsAppLinkButton>
)

const PlainText = ({ text, tag = 'span' }: { text: string; tag?: 'span' | 'p' }) => {
    const Element = tag
    return <Element className="text-xs text-slate-600">{text}</Element>
}

export default function AgentContactDisplay({ listing }: AgentContactDisplayProps) {
    // If agent has contact(s), display them
    if (listing.agent_contact) {
        const contacts = listing.agent_contact.split(/[,/\n]+/).map((contact) => contact.trim()).filter(Boolean)

        return (
            <div className="flex flex-col gap-1 items-start">
                {contacts.map((contact, index) =>
                    isPhoneNumber(contact) ? (
                        <PhoneButton key={index} contact={contact} listing={listing} />
                    ) : (
                        <PlainText key={index} text={contact} tag="span" />
                    )
                )}
            </div>
        )
    }

    // Fallback to sender name if no agent contact
    if (listing.sender_name) {
        return isPhoneNumber(listing.sender_name) ? (
            <div className='flex flex-row'>
                <span className="inline">~</span>
                <PhoneButton contact={listing.sender_name} listing={listing} />
            </div>
        ) : (
            <PlainText text={listing.sender_name} tag="p" />
        )
    }

    return null
}
