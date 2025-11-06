'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import PropalystChat from '@/components/propalyst/PropalystChat'
import RecommendedSection from '@/components/propalyst/RecommendedSection'

// High-end residential property background images
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
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=2070', // Contemporary luxury home
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=2070', // Stylish modern residence
  'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?q=80&w=2070', // Premium apartment exterior
  'https://images.unsplash.com/photo-1601760562234-9814eea6663a?q=80&w=2070', // Elegant villa design
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070', // Luxury property entrance
  'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?q=80&w=2070', // High-end townhouse
]

export default function PropalystPage() {
  // Area cards state - managed at page level
  const [showAreaCards, setShowAreaCards] = useState(false)
  const [areaCardsLoading, setAreaCardsLoading] = useState(false)

  // Summary state - managed at page level
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Ref for auto-scrolling to summary
  const summaryRef = useRef<HTMLDivElement>(null)

  // Randomly select a background image on each page load
  const backgroundImage = useMemo(() => {
    return BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)]
  }, [])

  // Handle area cards state from chat component
  const handleAreaCardsReady = (show: boolean, loading: boolean) => {
    setShowAreaCards(show)
    setAreaCardsLoading(loading)
  }

  // Handle summary generation
  const handleSummaryGenerated = (summaryText: string) => {
    setSummary(summaryText)
  }

  // Handle summary loading state
  const handleSummaryLoadingChange = (loading: boolean) => {
    setSummaryLoading(loading)
  }

  // Auto-scroll to recommended section when skeleton cards load
  useEffect(() => {
    if (areaCardsLoading && summaryRef.current) {
      setTimeout(() => {
        // Scroll to show the recommended areas section at the top
        summaryRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 200)
    }
  }, [areaCardsLoading])

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
      {/* Dark overlay for readability - darker like reference image */}
      <div className="absolute inset-0 bg-black/80 z-0" />

      <div className="w-full px-4 relative z-10 flex flex-col items-center">
        {/* Page header */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 pt-8">
            <span className="text-[#E6D3AF]">Propalyst</span><span className="text-white">.AI</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200">
            Your Personal Home Advisor
          </p>
        </div>

        {/* Chat interface */}
        <PropalystChat
          onAreaCardsReady={handleAreaCardsReady}
          onSummaryGenerated={handleSummaryGenerated}
          onSummaryLoadingChange={handleSummaryLoadingChange}
        />

        {/* Recommended Properties Section - Combined summary and area cards */}
        <div ref={summaryRef} className="mt-8">
          <RecommendedSection
            summary={summary}
            summaryLoading={summaryLoading}
            areaCardsLoading={areaCardsLoading}
            visible={showAreaCards}
          />
        </div>
      </div>
    </div>
  )
}
