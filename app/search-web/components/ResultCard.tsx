/**
 * ResultCard - Client Component
 * =============================
 *
 * This is now a Client Component because we need interactivity:
 * - onClick handler to navigate to listing details page
 * - Event handlers for user interactions
 *
 * Why Client Component?
 * - Needs onClick event handler
 * - Needs Next.js router for navigation
 * - Needs to handle user interactions
 */

'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface Property {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  imageUrl: string
  description: string
  propertyFor?: 'rent' | 'sale'
  url?: string
  source?: string
}

interface ResultCardProps {
  property: Property
}

export default function ResultCard({ property }: ResultCardProps) {
  const router = useRouter()

  // Handle card click - navigate to listing details page
  const handleCardClick = () => {
    // Only navigate if URL exists
    if (!property.url) {
      console.warn('No URL available for scraping')
      return
    }

    // Encode the URL to use as a route parameter
    // We'll use base64 encoding to safely pass URLs in the route
    const encodedUrl = encodeURIComponent(property.url)

    // Navigate to the listing details page
    router.push(`/search/listing?url=${encodedUrl}`)
  }

  // Prevent card click when clicking the "View Full Listing" link
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation() // Stop the click from bubbling up to the card
  }

  // Format price based on property type (rent vs sale)
  const formatPrice = (price: number, propertyFor: 'rent' | 'sale' = 'rent'): { display: string; label: string } => {
    if (propertyFor === 'sale') {
      // For sale: Convert to Crores or Lakhs
      if (price >= 10000000) {
        const crores = price / 10000000
        return {
          display: `₹${crores.toFixed(2)} Cr`,
          label: 'Total Price'
        }
      } else if (price >= 100000) {
        const lakhs = price / 100000
        return {
          display: `₹${lakhs.toFixed(2)} L`,
          label: 'Total Price'
        }
      } else {
        return {
          display: `₹${price.toLocaleString('en-IN')}`,
          label: 'Total Price'
        }
      }
    } else {
      // For rent: Show monthly rent
      return {
        display: `₹${price.toLocaleString('en-IN')}`,
        label: 'per month'
      }
    }
  }

  const { display: priceDisplay, label: priceLabel } = formatPrice(property.price, property.propertyFor)
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex flex-col md:flex-row">
        {/* Property Image */}
        <div className="relative w-full md:w-64 h-48 md:h-auto bg-gray-200 flex-shrink-0">
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 256px"
          />
        </div>

        {/* Property Details */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {property.title || 'No title'}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                📍 {property.location || 'No location data'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {priceDisplay}
              </div>
              <div className="text-xs text-gray-500">{priceLabel}</div>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {property.description || 'No description'}
          </p>

          {/* Property Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              🛏️ {property.bedrooms || 0} Bedrooms
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              🚿 {property.bathrooms || 0} Bathrooms
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              📐 {property.area || 0} sq.ft
            </Badge>
            {property.source && (
              <Badge variant="outline" className="flex items-center gap-1 capitalize">
                🌐 {property.source}
              </Badge>
            )}
          </div>

          {/* View Listing Link */}
          {property.url && (
            <a
              href={property.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View Full Listing
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}
