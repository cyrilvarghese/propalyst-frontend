/**
 * Data Augmentation Page - Client Component
 * ==========================================
 *
 * This page provides a UI for running data extraction processes.
 * It streams responses in real-time from the backend API.
 */

'use client'

import DataExtractionPanel from './components/DataExtractionPanel'

export default function AugmentDataPage() {
    return (
        <div className="min-h-screen bg-[#1a1a1a] py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Data Extraction</h1>
                    <p className="text-gray-400">
                        Extract structured data from unprocessed WhatsApp messages
                    </p>
                </div>
                <DataExtractionPanel />
            </div>
        </div>
    )
}


