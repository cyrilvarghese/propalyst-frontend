/**
 * JsonResultCard - Client Component
 * ==================================
 *
 * Displays raw JSON response from search APIs for debugging.
 * Shows exactly what data is being returned without parsing.
 */

'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface JsonResultCardProps {
  result: any
  index: number
  origQuery?: string
}

export default function JsonResultCard({ result, index, origQuery }: JsonResultCardProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  // Handle URL click - navigate to listing page to scrape and show properties
  const handleUrlClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (result.url) {
      const encodedUrl = encodeURIComponent(result.url)
      const params = new URLSearchParams({ url: encodedUrl })
      if (origQuery) {
        params.set('orig_query', encodeURIComponent(origQuery))
      }
      router.push(`/search/listing?${params.toString()}`)
    }
  }

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(result.rawContent || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Result #{index + 1}
            </h3>
            {result.url && (() => {
              const params = new URLSearchParams({ url: encodeURIComponent(result.url) })
              if (origQuery) {
                params.set('orig_query', encodeURIComponent(origQuery))
              }
              return (
                <a
                  href={`/search/listing?${params.toString()}`}
                  onClick={handleUrlClick}
                  className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline break-all cursor-pointer"
                >
                  {result.url}
                </a>
              )
            })()}
          </div>
          {result.score && (
            <Badge variant="secondary" className="ml-2">
              Score: {result.score.toFixed(2)}
            </Badge>
          )}
        </div>

        {/* Title */}
        {result.title && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 mb-1">TITLE:</div>
            <div className="text-sm text-gray-900 font-medium">{result.title}</div>
          </div>
        )}

        {/* Content/Snippet */}
        {result.content && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium text-gray-500">CONTENT:</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
                className="h-6 text-xs"
              >
                {copied ? '✓ Copied!' : 'Copy Content'}
              </Button>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
              {result.content}
            </div>
          </div>
        )}

        {/* Raw JSON */}
        <details className="mt-4">
          <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-2">
            <span>View Full JSON</span>
          </summary>
          <div className="mt-2">
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                className="h-6 text-xs"
              >
                {copied ? '✓ Copied JSON!' : 'Copy JSON'}
              </Button>
            </div>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </Card>
  )
}
