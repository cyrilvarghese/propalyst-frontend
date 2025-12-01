/**
 * SearchFilters - Client Component
 * =================================
 *
 * This MUST be a Client Component because:
 * - It has input fields (needs onChange handlers)
 * - It has buttons (needs onClick handlers)
 * - It uses hooks (useRouter, useSearchParams)
 * - It's interactive!
 */

'use client' // ← This makes it a Client Component

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SearchFilters() {
  // 🔗 Next.js hooks for URL navigation (only work in Client Components!)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // 📝 Local state for input (controlled component)
  const [query, setQuery] = useState(searchParams.get('query') || '3BHK apartment indiranagar 2500 sqft')

  // 🎯 Auto-set provider to tavily if not set (hidden from UI)
  useEffect(() => {
    if (!searchParams.get('provider')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('provider', 'tavily')
      router.replace(`/search?${params.toString()}`)
    }
  }, [searchParams, router])

  // Check if all required fields are present for search
  const canSearch = query.trim().length > 0

  /**
   * Handle search button click
   * Only triggers search if all required fields are present
   */
  const handleSearch = () => {
    if (!canSearch) {
      return // Don't search if required fields are missing
    }
    
    // Create new URLSearchParams from existing params
    const params = new URLSearchParams(searchParams.toString())
    params.set('query', query.trim())
    
    // Use startTransition for smooth UI updates
    startTransition(() => {
      router.push(`/search?${params.toString()}`)
    })
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Section 1: Search Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Search Query
          </label>
          {!canSearch && query && (
            <span className="text-xs text-amber-600">
              {!query.trim() && 'Enter a search query'}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g., 3BHK apartment indiranagar 2500 sqft"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSearch) {
                handleSearch()
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={isPending || !canSearch}
            title={!canSearch ? 'Please enter a query' : 'Search for properties'}
          >
            {isPending ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Provider hidden but set to tavily by default */}
      
    </Card>
  )
}
