'use client'

/**
 * Search New Page - Server Component
 * ===================================
 *
 * New Google-style search landing page at /search-new
 * This is a completely new page that doesn't modify any existing code.
 */
import { useEffect } from 'react';
import { Suspense } from 'react'
import SearchContainer from './components/SearchContainer'
import { initMixpanel } from "../../lib/mixpanel-client";
import { GoogleTagManager } from '@next/third-parties/google'

function SearchContentFallback() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <GoogleTagManager gtmId="G-09F9PPJ5CN" />
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading...</p>
            </div>
        </div>
    )
}

export default function SearchNewPage() {
    useEffect(() => {
        console.log("mixpanel added")
        initMixpanel();
    }, []);

    return (
        <Suspense fallback={<SearchContentFallback />}>
            <SearchContainer />
        </Suspense>
    )
}
