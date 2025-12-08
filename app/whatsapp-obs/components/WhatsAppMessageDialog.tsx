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
import { Send, Phone } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'

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

    // Initialize phone number and message when dialog opens
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

            // Use raw_message directly
            setMessage(listing.raw_message || '')
        } else {
            // Reset phone number when dialog closes
            setPhoneNumber('')
            setAvailableNumbers([])
            setMessage('')
        }
    }, [isOpen, listing.raw_message, listing.agent_contact, initialPhoneNumber])

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

    // Create WhatsApp link using raw_message
    const handleSend = () => {
        if (!phoneNumber) return

        const formattedPhone = formatPhoneForWhatsApp(phoneNumber)
        const rawMessage = listing.raw_message || message || ''
        const encodedMessage = encodeURIComponent(rawMessage)
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
                    <Textarea
                        id="message-text-dialog"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message"
                        className="w-full h-full min-h-[300px] text-base resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
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
                        disabled={!phoneNumber}
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

