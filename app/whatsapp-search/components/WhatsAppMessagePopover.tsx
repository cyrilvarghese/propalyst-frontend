/**
 * WhatsAppMessagePopover - Client Component
 * =========================================
 *
 * Popover component that shows a generated welcome message
 * and allows sending via WhatsApp.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Send, MessageSquare, Phone } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'
import { CREAMessageService } from '@/lib/services/crea-message.service'

interface WhatsAppMessagePopoverProps {
    listing: CREAListing
    children: React.ReactNode
}

export default function WhatsAppMessagePopover({ listing, children }: WhatsAppMessagePopoverProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState<string>('')
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Generate message function
    const generateMessage = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await CREAMessageService.formatMessage({
                raw_message: listing.raw_message || '',
                agent_name: listing.agent_name || 'Agent',
                tone: 'professional_friendly',
                include_emojis: false,
            })

            if (response.success) {
                setMessage(response.formatted_message)
            } else {
                setError(response.error || 'Failed to generate message')
                // Fallback to default message
                setMessage(`Hello ${listing.agent_name || 'Agent'}, I'm interested in the ${listing.property_type || 'property'} property in ${listing.location || 'location'}. Could you please provide more details?`)
            }
        } catch (err: any) {
            console.error('Error generating message:', err)
            setError(err.message || 'Failed to generate message')
            // Fallback to default message
            setMessage(`Hello ${listing.agent_name || 'Agent'}, I'm interested in the ${listing.property_type || 'property'} property in ${listing.location || 'location'}. Could you please provide more details?`)
        } finally {
            setIsLoading(false)
        }
    }, [listing])

    // Initialize phone number and generate message when popover opens
    useEffect(() => {
        if (isOpen) {
            // Initialize phone number from listing only once when popover opens
            if (listing.agent_contact) {
                setPhoneNumber(listing.agent_contact)
            }
            // Generate message if not already loaded
            if (!message && !isLoading && listing.agent_contact) {
                generateMessage()
            }
        } else {
            // Reset phone number when popover closes
            setPhoneNumber('')
        }
    }, [isOpen, message, isLoading, listing.agent_contact, generateMessage])

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

    // Create WhatsApp link using edited values
    const handleSend = () => {
        if (!phoneNumber || !message) return

        const formattedPhone = formatPhoneForWhatsApp(phoneNumber)
        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`

        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-120" align="start">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-indigo-600" />
                        <h4 className="font-semibold text-sm">WhatsApp Message</h4>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                            <span className="ml-2 text-sm text-gray-600">Generating message...</span>
                        </div>
                    ) : error ? (
                        <div className="text-sm text-red-600 py-2">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Phone Number Input */}
                            <div className="space-y-2">
                                <Label htmlFor="phone-number" className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone-number"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="text-sm"
                                />
                            </div>

                            {/* Message Textarea */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="message-text" className="text-xs font-medium text-gray-700">
                                        Message
                                    </Label>
                                    <div className="text-xs text-gray-500">
                                        To: {listing.agent_name || 'Agent'}
                                    </div>
                                </div>
                                <Textarea
                                    id="message-text"
                                    value={message || 'Loading message...'}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter your message"
                                    className="min-h-[120px] min-w-[500px] text-sm resize-none"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Send button aligned left */}
                            <div className="flex items-center justify-start gap-2 pt-2 border-t">
                                <Button
                                    onClick={handleSend}
                                    disabled={!message || !phoneNumber || isLoading}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    Send
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

