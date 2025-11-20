/**
 * Search Page - Server Component
 * ================================
 *
 * This is a Server Component (no 'use client' needed).
 *
 * Why Server Component?
 * - It's the main layout (no interactivity needed here)
 * - Can read searchParams directly from props
 * - Lighter bundle (doesn't ship to browser)
 * - Can be async if we need to fetch data
 */

import { Suspense } from 'react'
import SearchFilters from './components/SearchFilters'
import SearchResultsSerp from './components/SearchResultsSerp'
import SearchResults from './components/SearchResults'
import ResultsSkeleton from './components/ResultsSkeleton'
import Link from 'next/link'

// High-end residential property background images (same as Propalyst)
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071', // Luxury villa exterior
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075', // Modern luxury house
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053', // Contemporary villa
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070', // Elegant modern home
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2070', // High-end apartment
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070', // Luxury residential complex
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070', // Modern luxury home with pool
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2074', // Upscale apartment building
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070', // Luxury house facade
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070', // Beautiful modern house
]

// TypeScript types for search params
// In Next.js 15+, searchParams is a Promise that must be awaited
interface SearchPageProps {
  searchParams: Promise<{
    query?: string        // e.g., "3BHK independent house"
    sources?: string       // e.g., "magicbrick" | "housing" | "99acres"
    provider?: string     // e.g., "gemini" | "tavily" | "openai"
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // IMPORTANT: In Next.js 15+, searchParams is a Promise
  // We must await it before accessing its properties
  // This enables better streaming and performance
  //
  // Server Components can be async - this is impossible in Client Components!
  const params = await searchParams

  // No default values - let user select filters first
  const query = params.query || ''
  const sources = params.sources || ''
  const provider = params.provider || ''

  // Debug: Log which component will be rendered
  console.log('🔀 Search Page - Provider selected:', provider)

  let componentToRender = 'SearchResultsBackend (Python Backend - default)'
  if (provider === 'google_serpapi') {
    componentToRender = 'SearchResultsSerp (SerpAPI)'
  }

  console.log('🔀 Will render:', componentToRender)

  // Use first background image (static, no switching)
  const backgroundImage = BACKGROUND_IMAGES[0]

  return (
    <div
      className="min-h-screen bg-[#1a1a1a] py-8 relative"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/80 z-0" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 pt-8">
            <span className="text-white">Property</span> <span className="text-[#E6D3AF]">Search</span>
          </h1>
          <p className="text-gray-200 text-lg">
            Search across multiple property listing platforms
          </p>
        </div>

        {/* SearchFilters - Client Component with interactive inputs/buttons */}
        <div className="mb-8">
          <Link href="/whatsapp-search" className="text-white hover:text-[#E6D3AF] hover:underline">WhatsApp Search</Link>
        </div>
        <SearchFilters />

        {/* SearchResults wrapped in Suspense for streaming */}
        <div className="mt-8">
          {/*
            Key prop forces Suspense to show fallback on param changes.
            Without key, Suspense might not re-trigger fallback UI.

            Conditionally render based on provider:
            - google_serpapi: Use SearchResultsSerp (SerpAPI)
            - gemini/tavily/openai (default): Use SearchResultsBackend (Python Backend)
          */}
          <Suspense key={`${query}-${sources}-${provider}`} fallback={<ResultsSkeleton />}>
            {provider === 'google_serpapi' ? (
              <SearchResultsSerp
                query={query}
                sources={sources}
                provider={provider}
              />
            ) : (
              <SearchResults
                query={query}
                sources={sources}
                provider={provider}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
