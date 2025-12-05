/**
 * WhatsAppMessageDialog - Client Component
 * ========================================
 *
 * Full-screen modal dialog component that shows a generated welcome message
 * and allows sending via WhatsApp.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Send, MessageSquare, Phone } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'
import { CREAMessageService } from '@/lib/services/crea-message.service'

interface WhatsAppMessageDialogProps {
    listing: CREAListing
    children: React.ReactNode
    initialPhoneNumber?: string
}

export default function WhatsAppMessageDialog({ listing, children, initialPhoneNumber }: WhatsAppMessageDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState<string>('')
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [availableNumbers, setAvailableNumbers] = useState<string[]>([])
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
                setMessage(response.formatted_message + "\nwww.realbroker.app")
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

    // Initialize phone number and generate message when dialog opens
    useEffect(() => {
        if (isOpen) {
            // Parse available numbers
            const numbers = listing.agent_contact
                ? listing.agent_contact.split(/[,/\n]+/).map(n => n.trim()).filter(Boolean)
                : []
            setAvailableNumbers(numbers)

            // Initialize phone number
            if (initialPhoneNumber) {
                setPhoneNumber(initialPhoneNumber)
            } else if (numbers.length > 0) {
                setPhoneNumber(numbers[0])
            }

            // Generate message if not already loaded
            if (!message && !isLoading && listing.agent_contact) {
                generateMessage()
            }
        } else {
            // Reset phone number when dialog closes
            setPhoneNumber('')
            setAvailableNumbers([])
        }
    }, [isOpen, message, isLoading, listing.agent_contact, generateMessage, initialPhoneNumber])

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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild >
                {children}
            </DialogTrigger>
            <DialogContent aria-describedby='message-text-dialog' className="w-[95vw] md:max-w-[50vw] h-[80vh] md:h-[55vh] max-h-[95vh] flex flex-col p-4 rounded-xl shadow-xl border border-slate-200">
                <DialogHeader>
                    <DialogTitle>
                        Message {listing.agent_name ? `- ${listing.agent_name}` : ''} {listing.company_name ? `(${listing.company_name})` : ''}
                    </DialogTitle>
                </DialogHeader>


                <div className="flex-1 overflow-y-auto py-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <span className="ml-3 text-base text-gray-600">Generating message...</span>
                        </div>
                    ) : error ? (
                        <div className="text-base text-red-600 py-4">
                            {error}
                        </div>
                    ) : (
                        <Textarea
                            id="message-text-dialog"
                            value={message || 'Loading message...'}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your message"
                            className="w-full h-full min-h-[300px] text-base resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            disabled={isLoading}
                        />
                    )}
                </div>

                {/* Footer with Phone number and Send button */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t">
                    <div className="flex items-center gap-2 w-full md:w-[180px]" >
                        <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                        {availableNumbers.length > 1 && !initialPhoneNumber ? (
                            <Select
                                value={phoneNumber}
                                onValueChange={setPhoneNumber}
                            >
                                <SelectTrigger className="h-9 w-full">
                                    <SelectValue placeholder="Select number" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableNumbers.map((num, idx) => (
                                        <SelectItem key={idx} value={num}>
                                            {num}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSend()
                                    }
                                }}
                                id="phone-number-dialog"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Phone number"
                                className="h-9 text-sm flex-1"
                            />
                        )}
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={!message || !phoneNumber || isLoading}
                        size="sm"
                        className="gap-2 w-full md:w-auto"
                    >
                        <Send className="h-4 w-4" />
                        Message {listing.agent_name}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

