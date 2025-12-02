/**
 * WhatsApp Search Latest Page - Server Component
 * ===============================================
 *
 * Server component that wraps the client ListingsContent with Suspense
 * to handle useSearchParams() hook properly.
 */

import { Suspense } from 'react'
import ListingsContent from './components/ListingsContent'

function ListingsContentFallback() {
    return (
        <div className="min-h-screen bg-[#1a1a1a] py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading search...</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function WhatsAppSearchLatestPage() {
    return (
        <Suspense fallback={<ListingsContentFallback />}>
            <ListingsContent />
        </Suspense>
    )
}

