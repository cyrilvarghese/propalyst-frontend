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

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function SearchFilters() {
  // 🔗 Next.js hooks for URL navigation (only work in Client Components!)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // 📝 Local state for input (controlled component)
  const [query, setQuery] = useState(searchParams.get('query') || '3BHK apartment indiranagar 2500 sqft')

  // 🎯 Current selections from URL (support multiple sources)
  const currentSources = searchParams.get('sources')?.split(',').filter(Boolean) || []
  const currentProvider = searchParams.get('provider') || ''

  // Check if all required fields are present for search
  // Note: sources are now optional - if empty, search across all domains
  const canSearch = query.trim().length > 0 && currentProvider

  /**
   * Update URL search params
   *
   * How it works:
   * 1. Create a new URLSearchParams object from current params
   * 2. Update the specific param we want to change
   * 3. Use router.push() to navigate to the new URL
   * 4. Use startTransition() to show loading state (isPending)
   */
  const updateSearchParams = (key: string, value: string) => {
    // Create new URLSearchParams from existing params
    const params = new URLSearchParams(searchParams.toString())

    // Update the specific parameter
    params.set(key, value)

    // Use startTransition for smooth UI updates
    startTransition(() => {
      // Push new URL (this will re-render the page with new params)
      router.push(`/search?${params.toString()}`)
    })
  }

  /**
   * Handle multiple source selection
   */
  const handleSourcesChange = (values: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (values.length > 0) {
      params.set('sources', values.join(','))
    } else {
      params.delete('sources')
    }
    startTransition(() => {
      router.push(`/search?${params.toString()}`)
    })
  }

  /**
   * Handle search button click
   * Only triggers search if all required fields are present
   */
  const handleSearch = () => {
    if (!canSearch) {
      return // Don't search if required fields are missing
    }
    updateSearchParams('query', query.trim())
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Section 1: Search Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Search Query
          </label>
          {!canSearch && (query || currentSources.length > 0 || currentProvider) && (
            <span className="text-xs text-amber-600">
              {!query.trim() && 'Enter a search query'}
              {query.trim() && !currentProvider && ' • Select a provider'}
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
            title={!canSearch ? 'Please enter a query and select a provider' : 'Search for properties'}
          >
            {isPending ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Section 2: Data Source Toggle Group (Multi-select) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Data Sources <span className="text-xs text-gray-500 font-normal">(optional - leave empty to search all)</span>
        </label>
        <ToggleGroup
          type="multiple"
          value={currentSources}
          onValueChange={handleSourcesChange}
          className="justify-start flex-wrap"
        >
          {['magicbricks', 'housing', '99acres', 'nobroker', 'commonfloor', 'squareyards'].map((source) => (
            <ToggleGroupItem
              key={source}
              value={source}
              aria-label={`Toggle ${source}`}
              className="capitalize"
              disabled={isPending}
            >
              {source}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {currentSources.length > 0 ? (
          <p className="text-xs text-gray-500">
            Selected: {currentSources.join(', ')}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">
            No sources selected - will search across all property websites
          </p>
        )}
      </div>

      {/* Section 3: Search Provider Buttons (Gemini, Tavily, OpenAI) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Search Provider
        </label>
        <div className="flex gap-2">
          {[
            { value: 'gemini', label: 'Gemini', emoji: '✨' },
            { value: 'tavily', label: 'Tavily', emoji: '🔍' },
            { value: 'openai', label: 'OpenAI', emoji: '🤖' },
            { value: 'google_serpapi', label: 'Google Serpapi', emoji: '🌐' }
          ].map((provider) => (
            <Button
              key={provider.value}
              variant={currentProvider === provider.value ? 'default' : 'outline'}
              onClick={() => updateSearchParams('provider', provider.value)}
              disabled={isPending}
            >
              {provider.emoji} {provider.label}
            </Button>
          ))}
        </div>
      </div>

    </Card>
  )
}
