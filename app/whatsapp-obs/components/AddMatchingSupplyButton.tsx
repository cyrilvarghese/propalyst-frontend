/**
 * AddMatchingSupplyButton - Client Component
 * ==========================================
 *
 * Button component that adds a matching supply by linking a WhatsApp listing to a lead.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link2, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface AddMatchingSupplyButtonProps {
    listing: CREAListing
}

export default function AddMatchingSupplyButton({ listing }: AddMatchingSupplyButtonProps) {
    const searchParams = useSearchParams()
    const leadId = searchParams.get('lead_id')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handleAddMatchingSupply = async () => {
        if (!leadId) {
            setStatus('error')
            setErrorMessage('Lead ID not found in URL')
            
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => {
                setStatus('idle')
                setErrorMessage('')
                timeoutRef.current = null
            }, 3000)
            return
        }

        setStatus('loading')
        setErrorMessage('')

        try {
            const response = await fetch(`${API_BASE_URL}/api/matching-supply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lead_id: parseInt(leadId),
                    whatsapp_listing_id: listing.id
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
                throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`)
            }

            setStatus('success')
            
            // Clear any existing timeout before setting a new one
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            
            timeoutRef.current = setTimeout(() => {
                setStatus('idle')
                timeoutRef.current = null
            }, 2000)
        } catch (err: any) {
            console.error('Error adding matching supply:', err)
            setStatus('error')
            setErrorMessage(err.message || 'Failed to add matching supply')
            
            // Clear any existing timeout before setting a new one
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            
            timeoutRef.current = setTimeout(() => {
                setStatus('idle')
                setErrorMessage('')
                timeoutRef.current = null
            }, 3000)
        }
    }

    if (!leadId) {
        return null // Don't show button if no lead_id in URL
    }

    return (
        <button
            onClick={handleAddMatchingSupply}
            disabled={status === 'loading'}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline border border-blue-300 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {status === 'loading' ? (
                <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Adding...
                </>
            ) : status === 'success' ? (
                <>
                    <CheckCircle2 className="h-3 w-3" />
                    Added!
                </>
            ) : status === 'error' ? (
                <>
                    <XCircle className="h-3 w-3" />
                    {errorMessage || 'Error'}
                </>
            ) : (
                <>
                    <Link2 className="h-3 w-3" />
                    Add to Lead
                </>
            )}
        </button>
    )
}

