/**
 * CopyDebugSQLButton - Client Component
 * ======================================
 *
 * Button component that copies a debug SQL query to clipboard.
 */

'use client'

import { useState } from 'react'
import { Bug } from 'lucide-react'
import { CREAListing } from '@/lib/services/crea-listings.service'

interface CopyDebugSQLButtonProps {
    listing: CREAListing
}

export default function CopyDebugSQLButton({ listing }: CopyDebugSQLButtonProps) {
    const [copied, setCopied] = useState(false)

    const copyDebugSQL = async () => {
        const sqlQuery = `SELECT

  -- processed table fields

  p.id                             AS listing_id,

  p.source_raw_message_id,

  p.agent_name,

  p.agent_contact,

  p.raw_message                    AS processed_message,

  p.message_date                   AS processed_message_date,

  -- raw table fields

  r.id                             AS raw_id,

  r.sender_name                    AS raw_sender_name,

  r.message_text                   AS raw_message,

  r.message_date                   AS raw_message_date,

  r.source_file,

  r.line_number,

  r.processed                      AS raw_processed_flag,

  r.processed_at,

  -- quick diff helpers

  (p.message_date = r.message_date) AS dates_match,

  (p.raw_message = r.message_text)  AS exact_text_match

FROM public.whatsapp_listing_data p

LEFT JOIN public.whatsapp_raw_messages r

  ON r.id = p.source_raw_message_id

WHERE p.id = '${listing.id}'::uuid;`

        try {
            await navigator.clipboard.writeText(sqlQuery)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy SQL query:', err)
        }
    }

    return (
        <button
            onClick={copyDebugSQL}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline border border-blue-300 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
            <Bug className="h-3 w-3" />
            {copied ? '✓ Copied!' : 'Copy Debug SQL'}
        </button>
    )
}

