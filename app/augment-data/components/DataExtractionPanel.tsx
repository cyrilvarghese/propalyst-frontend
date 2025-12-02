/**
 * DataExtractionPanel - Component
 * =================================
 *
 * Two-stage data extraction process:
 * 
 * Stage 1: Upload File
 * - Upload WhatsApp export .txt file
 * - POST /api/whatsapp-raw/upload-file
 * - Returns JSON response with upload statistics
 * 
 * Stage 2: Process Messages with LLM
 * - Process unprocessed messages using LLM
 * - POST /api/whatsapp-raw/process-unprocessed-stream?limit=1000
 * - Returns SSE stream with real-time processing results
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Play, Square, Loader2, RefreshCw, Upload, CheckCircle2, AlertCircle } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const UPLOAD_FILE_ENDPOINT = `${API_BASE_URL}/api/whatsapp-raw/upload-file`
const PROCESS_STREAM_ENDPOINT = `${API_BASE_URL}/api/whatsapp-raw/process-unprocessed-stream`
const STATS_ENDPOINT = `${API_BASE_URL}/api/whatsapp-listings/stats`
const RAW_STATS_ENDPOINT = `${API_BASE_URL}/api/whatsapp-raw/raw-stats`

interface UploadResponse {
    success: boolean
    messages_parsed?: number
    messages_inserted?: number
    messages_skipped?: number
    ready_for_llm?: number
    message?: string
    error?: string
}

interface StreamMessage {
    type: 'start' | 'progress' | 'complete' | 'error'
    batch_size?: number
    message_id?: string
    status?: 'completed' | 'skipped' | 'failed'
    message_type?: string
    location?: string
    split_index?: string | null  // Format: "1/2" or null
    is_relevant?: boolean
    progress?: string  // Format: "47/100"
    messages_extracted?: number
    messages_failed?: number
    message?: string
    error?: string
    [key: string]: any
}

interface StatsData {
    total_raw_messages_all_time: number
    extracted_listings_count: number
    unprocessed_count: number
    progress_percentage: number
    recent_raw_messages_4_months?: number
    message?: string
    message_type_breakdown?: {
        [key: string]: number
    }
}

interface RawStatsData {
    total_messages_all_time: number
    recent_messages_4_months: number
    old_messages_over_4_months: number
    processed: number
    unprocessed: number
    deleted: number
    media: number
    ready_for_llm: number
    unique_senders: number
    date_range: {
        earliest: string
        latest: string
    }
}

export default function DataExtractionPanel() {
    // Stage 1: Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null)

    // Stage 2: Processing state
    const [isProcessing, setIsProcessing] = useState(false)
    const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([])
    const [batchProgress, setBatchProgress] = useState(0)
    const [batchCurrent, setBatchCurrent] = useState(0)
    const [batchTotal, setBatchTotal] = useState(100)
    const [processLimit, setProcessLimit] = useState<number>(1000)

    // Stats state
    const [stats, setStats] = useState<StatsData | null>(null)
    const [rawStats, setRawStats] = useState<RawStatsData | null>(null)
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [isLoadingRawStats, setIsLoadingRawStats] = useState(false)

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.name.endsWith('.txt')) {
                setFileError('Please select a .txt file')
                setSelectedFile(null)
                return
            }
            setFileError(null)
            setSelectedFile(file)
        } else {
            setSelectedFile(null)
            setFileError(null)
        }
    }, [])

    // Fetch functions - declared early so they can be used in other callbacks
    const fetchStats = useCallback(async () => {
        setIsLoadingStats(true)
        try {
            const response = await fetch(STATS_ENDPOINT)
            if (response.ok) {
                const result = await response.json()
                // Handle both wrapped and direct response formats
                if (result.success && result.data) {
                    setStats(result.data)
                } else if (result.success) {
                    // If success is true but data is at root level
                    const { success, message, ...statsData } = result
                    setStats(statsData)
                } else {
                    // Direct format
                    setStats(result)
                }
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setIsLoadingStats(false)
        }
    }, [])

    const fetchRawStats = useCallback(async () => {
        setIsLoadingRawStats(true)
        try {
            const response = await fetch(RAW_STATS_ENDPOINT)
            if (response.ok) {
                const data = await response.json()
                setRawStats(data)
            }
        } catch (error) {
            console.error('Error fetching raw stats:', error)
        } finally {
            setIsLoadingRawStats(false)
        }
    }, [])

    // STAGE 1: Upload File
    const handleUploadFile = useCallback(async () => {
        // Validate file is selected
        if (!selectedFile) {
            setFileError('Please select a .txt file to upload')
            return
        }

        setIsUploading(true)
        setFileError(null)
        setUploadResponse(null)

        try {
            // Prepare FormData with file
            const formData = new FormData()
            formData.append('file', selectedFile)

            // Make POST request with file upload
            const response = await fetch(UPLOAD_FILE_ENDPOINT, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Upload failed' }))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setUploadResponse(data)

            // Refresh stats after upload
            await fetchRawStats()
        } catch (error: any) {
            console.error('Error during upload:', error)
            setUploadResponse({
                success: false,
                error: error.message || 'An error occurred during upload',
            })
        } finally {
            setIsUploading(false)
        }
    }, [selectedFile, fetchRawStats])

    // STAGE 2: Process Messages with LLM
    const handleProcessMessages = useCallback(async () => {
        // Reset processing state
        setStreamMessages([])
        setBatchProgress(0)
        setBatchCurrent(0)
        setBatchTotal(100)
        setIsProcessing(true)

        // Create abort controller for cancellation
        const abortController = new AbortController()
        abortControllerRef.current = abortController

        try {
            // Make POST request to process unprocessed messages
            const response = await fetch(`${PROCESS_STREAM_ENDPOINT}?limit=${processLimit}`, {
                method: 'POST',
                headers: {
                    'Accept': 'text/event-stream',
                },
                signal: abortController.signal,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            // Read the stream using Fetch API with streaming
            // Based on STREAMING_API_EXAMPLES.md - uses named events (event: start, event: progress, etc.)
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            if (!reader) {
                throw new Error('No response body reader available')
            }

            // Process complete SSE events (separated by double newlines)
            // Format: event: start\ndata: {...}\n\n
            const processSSEEvent = (eventText: string) => {
                if (!eventText.trim()) return

                const lines = eventText.split('\n')
                let eventType: string | null = null
                let data: StreamMessage | null = null

                // Parse event and data lines
                for (const line of lines) {
                    if (line.startsWith('event: ')) {
                        eventType = line.substring(7).trim()
                    } else if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.substring(6).trim()
                            if (jsonStr) {
                                data = JSON.parse(jsonStr) as StreamMessage
                                // Add type field for backward compatibility
                                if (!data.type && eventType) {
                                    data.type = eventType as StreamMessage['type']
                                }
                            }
                        } catch (error) {
                            console.error('Error parsing JSON data:', error, 'Line:', line)
                            return
                        }
                    }
                }

                // Process the event if we have both event type and data
                if (eventType && data) {
                    // Add message to stream first
                    setStreamMessages(prev => [...prev, data!])

                    // Then update state based on event type
                    if (eventType === 'start') {
                        setBatchTotal(data.batch_size || 100)
                        setBatchCurrent(0)
                        setBatchProgress(0)
                    } else if (eventType === 'progress') {
                        // Parse progress from "47/100" format
                        if (data.progress) {
                            const progressMatch = data.progress.match(/(\d+)\/(\d+)/)
                            if (progressMatch) {
                                const current = parseInt(progressMatch[1], 10)
                                const total = parseInt(progressMatch[2], 10)
                                setBatchCurrent(current)
                                setBatchTotal(total)
                                setBatchProgress(total > 0 ? (current / total) * 100 : 0)
                            }
                        }
                    } else if (eventType === 'complete') {
                        setIsProcessing(false)
                        setBatchProgress(100)
                        // Refresh stats after processing completes
                        setTimeout(() => {
                            fetchStats()
                            fetchRawStats()
                        }, 500)
                    } else if (eventType === 'error') {
                        setIsProcessing(false)
                    }
                }
            }

            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    // Process any remaining buffer
                    if (buffer.trim()) {
                        processSSEEvent(buffer)
                    }
                    break
                }

                // Decode chunk and add to buffer
                buffer += decoder.decode(value, { stream: true })

                // Process complete SSE events (separated by double newlines)
                // SSE format: event: <type>\ndata: {...}\n\n
                const eventSeparator = '\n\n'
                let eventIndex = buffer.indexOf(eventSeparator)

                // Process all complete events in buffer
                while (eventIndex !== -1) {
                    const eventText = buffer.substring(0, eventIndex)
                    buffer = buffer.substring(eventIndex + eventSeparator.length)

                    // Process this complete event
                    processSSEEvent(eventText)

                    // Look for next event
                    eventIndex = buffer.indexOf(eventSeparator)
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Stream aborted by user')
            } else {
                console.error('Error during processing:', error)
                setStreamMessages(prev => [
                    ...prev,
                    {
                        type: 'error',
                        error: error.message || 'An error occurred during processing',
                    },
                ])
            }
            setIsProcessing(false)
        }
    }, [processLimit, fetchStats, fetchRawStats])

    const handleStopProcessing = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setIsProcessing(false)
    }, [])

    const lastMessage = streamMessages[streamMessages.length - 1]
    const isComplete = lastMessage?.type === 'complete'
    const hasError = lastMessage?.type === 'error'

    // Fetch stats on mount
    useEffect(() => {
        fetchStats()
        fetchRawStats()
    }, [fetchStats, fetchRawStats])

    // Refresh stats after extraction completes
    useEffect(() => {
        if (isComplete) {
            // Small delay to ensure backend stats are updated
            setTimeout(() => {
                fetchStats()
                fetchRawStats()
            }, 500)
        }
    }, [isComplete, fetchStats, fetchRawStats])

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Extraction Statistics Card */}
                <Card className="bg-[#252525] border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-white">Extraction Statistics</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchStats}
                            disabled={isLoadingStats}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {stats ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-400">Total Messages (All Time)</div>
                                        <div className="text-2xl font-bold text-white">{stats.total_raw_messages_all_time}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Extracted Listings</div>
                                        <div className="text-2xl font-bold text-green-400">{stats.extracted_listings_count}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Unprocessed</div>
                                        <div className="text-2xl font-bold text-yellow-400">{stats.unprocessed_count}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Progress</div>
                                        <div className="text-2xl font-bold text-blue-400">
                                            {stats.progress_percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                    {stats.recent_raw_messages_4_months !== undefined && (
                                        <div>
                                            <div className="text-sm text-gray-400">Recent (4 Months)</div>
                                            <div className="text-2xl font-bold text-cyan-400">{stats.recent_raw_messages_4_months}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2 border-t border-gray-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-400">Overall Progress</span>
                                        <span className="text-sm text-gray-400">
                                            {stats.progress_percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress value={stats.progress_percentage} className="h-2" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm">
                                {isLoadingStats ? 'Loading statistics...' : 'No statistics available'}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Raw Stats Card */}
                <Card className="bg-[#252525] border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-white">Raw Messages Statistics</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchRawStats}
                            disabled={isLoadingRawStats}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoadingRawStats ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {rawStats ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-400">Total (All Time)</div>
                                        <div className="text-2xl font-bold text-white">{rawStats.total_messages_all_time}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Recent (4 Months)</div>
                                        <div className="text-2xl font-bold text-blue-400">{rawStats.recent_messages_4_months}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Old (&gt; 4 Months)</div>
                                        <div className="text-2xl font-bold text-purple-400">{rawStats.old_messages_over_4_months}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Processed</div>
                                        <div className="text-2xl font-bold text-green-400">{rawStats.processed}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Unprocessed</div>
                                        <div className="text-2xl font-bold text-yellow-400">{rawStats.unprocessed}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Ready for LLM</div>
                                        <div className="text-2xl font-bold text-cyan-400">{rawStats.ready_for_llm}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Deleted</div>
                                        <div className="text-2xl font-bold text-red-400">{rawStats.deleted}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Media</div>
                                        <div className="text-2xl font-bold text-orange-400">{rawStats.media}</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-700">
                                    <div className="text-sm text-gray-400 mb-2">Additional Info</div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Unique Senders</span>
                                            <span className="text-white font-semibold">{rawStats.unique_senders}</span>
                                        </div>
                                        {rawStats.date_range && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Earliest</span>
                                                    <span className="text-white font-mono text-xs">
                                                        {new Date(rawStats.date_range.earliest).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Latest</span>
                                                    <span className="text-white font-mono text-xs">
                                                        {new Date(rawStats.date_range.latest).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm">
                                {isLoadingRawStats ? 'Loading raw statistics...' : 'No raw statistics available'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* STAGE 1: Upload File */}
            <Card className="bg-[#252525] border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Stage 1: Upload File</CardTitle>
                    <CardDescription className="text-gray-400">
                        Upload WhatsApp export file (.txt) to parse and insert into database
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* File Upload Input */}
                    <div className="mb-4 space-y-2">
                        <Label htmlFor="fileUpload" className="text-white">
                            WhatsApp Export File (.txt)
                        </Label>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Input
                                    ref={fileInputRef}
                                    id="fileUpload"
                                    type="file"
                                    accept=".txt"
                                    onChange={handleFileChange}
                                    disabled={isUploading || isProcessing}
                                    className="sr-only"
                                />
                                <label
                                    htmlFor="fileUpload"
                                    className={`flex items-center justify-center h-10 px-4 rounded-md border-2 border-dashed transition-colors ${isUploading || isProcessing
                                        ? 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50 pointer-events-none'
                                        : selectedFile
                                            ? 'border-green-600 bg-green-900/20 hover:border-green-500 cursor-pointer'
                                            : 'border-gray-600 bg-[#1a1a1a] hover:border-gray-500 hover:bg-[#2a2a2a] cursor-pointer'
                                        }`}
                                >
                                    <span className="text-sm text-gray-300 truncate max-w-full">
                                        {selectedFile ? selectedFile.name : 'Click to select .txt file'}
                                    </span>
                                </label>
                            </div>
                            {selectedFile && !isUploading && !isProcessing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedFile(null)
                                        setFileError(null)
                                        setUploadResponse(null)
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = ''
                                        }
                                    }}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                        {selectedFile && (
                            <p className="text-sm text-green-400">
                                ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                        {fileError && (
                            <p className="text-sm text-red-400">{fileError}</p>
                        )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleUploadFile}
                            disabled={isUploading || isProcessing || !selectedFile}
                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload File
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Upload Response */}
                    {uploadResponse && (
                        <div className={`mt-4 p-4 rounded-md border ${uploadResponse.success
                            ? 'bg-green-900/20 border-green-700'
                            : 'bg-red-900/20 border-red-700'
                            }`}>
                            {uploadResponse.success ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        <span className="text-green-400 font-semibold">Upload Successful!</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                        {uploadResponse.messages_parsed !== undefined && (
                                            <div>
                                                <div className="text-sm text-gray-400">Messages Parsed</div>
                                                <div className="text-xl font-bold text-white">{uploadResponse.messages_parsed}</div>
                                            </div>
                                        )}
                                        {uploadResponse.messages_inserted !== undefined && (
                                            <div>
                                                <div className="text-sm text-gray-400">Messages Inserted</div>
                                                <div className="text-xl font-bold text-green-400">{uploadResponse.messages_inserted}</div>
                                            </div>
                                        )}
                                        {uploadResponse.messages_skipped !== undefined && (
                                            <div>
                                                <div className="text-sm text-gray-400">Messages Skipped</div>
                                                <div className="text-xl font-bold text-yellow-400">{uploadResponse.messages_skipped}</div>
                                            </div>
                                        )}
                                        {uploadResponse.ready_for_llm !== undefined && (
                                            <div>
                                                <div className="text-sm text-gray-400">Ready for LLM</div>
                                                <div className="text-xl font-bold text-blue-400">{uploadResponse.ready_for_llm}</div>
                                            </div>
                                        )}
                                    </div>
                                    {uploadResponse.message && (
                                        <p className="text-sm text-gray-300 mt-2">{uploadResponse.message}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <span className="text-red-400">{uploadResponse.error || 'Upload failed'}</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* STAGE 2: Process Messages with LLM */}
            <Card className="bg-[#252525] border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Stage 2: Process Messages with LLM</CardTitle>
                    <CardDescription className="text-gray-400">
                        Process unprocessed messages using LLM to extract structured data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Process Limit Input */}
                    <div className="mb-4 space-y-2">
                        <Label htmlFor="processLimit" className="text-white">
                            Process Limit
                        </Label>
                        <Input
                            id="processLimit"
                            type="number"
                            min="1"
                            value={processLimit}
                            onChange={(e) => setProcessLimit(parseInt(e.target.value) || 1000)}
                            disabled={isProcessing}
                            className="bg-[#1a1a1a] border-gray-600 text-white max-w-[200px]"
                        />
                        <p className="text-sm text-gray-400">
                            Maximum number of messages to process in this batch
                        </p>
                    </div>

                    {/* Process Button */}
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleProcessMessages}
                            disabled={isProcessing || isUploading}
                            className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Process Messages
                                </>
                            )}
                        </Button>
                        {isProcessing && (
                            <Button
                                onClick={handleStopProcessing}
                                variant="destructive"
                            >
                                <Square className="h-4 w-4 mr-2" />
                                Stop
                            </Button>
                        )}
                    </div>

                    {/* Processing Progress Bar */}
                    {isProcessing && batchTotal > 0 && (
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>
                                    Processing: {batchCurrent} / {batchTotal}
                                </span>
                                <span>{Math.round(batchProgress)}%</span>
                            </div>
                            <Progress value={batchProgress} className="h-2" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Processing Stream Output */}
            {(isProcessing || streamMessages.length > 0) && (
                <Card className="bg-[#252525] border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Processing Output</CardTitle>
                        <CardDescription className="text-gray-400">
                            Real-time LLM processing results
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] w-full rounded-md border border-gray-700 bg-[#1a1a1a] p-4">
                            <div className="space-y-2 font-mono text-sm">
                                {streamMessages.length === 0 ? (
                                    <div className="text-gray-500 italic">
                                        Waiting for processing to start...
                                    </div>
                                ) : (
                                    streamMessages.map((message, index) => (
                                        <StreamMessageLine key={index} message={message} />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {/* Processing Summary */}
            {isComplete && lastMessage && lastMessage.type === 'complete' && (
                <Card className="bg-[#252525] border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Processing Summary</CardTitle>
                        {lastMessage.message && (
                            <CardDescription className="text-gray-400">
                                {lastMessage.message}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-400">Extracted</div>
                                <div className="text-2xl font-bold text-green-400">
                                    {lastMessage.messages_extracted || 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Failed</div>
                                <div className="text-2xl font-bold text-red-400">
                                    {lastMessage.messages_failed || 0}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Display */}
            {hasError && lastMessage?.error && (
                <Card className="bg-red-900/20 border-red-700">
                    <CardHeader>
                        <CardTitle className="text-red-400">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-300">{lastMessage.error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

/**
 * StreamMessageLine - Component
 * ==============================
 *
 * Displays a single stream message with appropriate styling.
 */
function StreamMessageLine({ message }: { message: StreamMessage }) {
    const [copied, setCopied] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const getMessageColor = () => {
        switch (message.type) {
            case 'start':
                return 'text-blue-400'
            case 'progress':
                if (message.status === 'completed') return 'text-green-400'
                if (message.status === 'skipped') return 'text-gray-400'
                if (message.status === 'failed') return 'text-red-400'
                return 'text-yellow-400'
            case 'complete':
                return 'text-yellow-400'
            case 'error':
                return 'text-red-400'
            default:
                return 'text-gray-300'
        }
    }

    const handleCopySQL = async (messageId: string) => {
        const sqlQuery = `SELECT * FROM public.whatsapp_listing_data WHERE source_message_id = '${messageId}';`

        try {
            await navigator.clipboard.writeText(sqlQuery)

            // Clear any existing timeout before setting a new one
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            setCopied(true)
            timeoutRef.current = setTimeout(() => {
                setCopied(false)
                timeoutRef.current = null
            }, 2000)
        } catch (err) {
            console.error('Failed to copy SQL query:', err)
        }
    }

    const messageColor = getMessageColor()

    if (message.type === 'start') {
        return (
            <div className={messageColor}>
                <span className="text-gray-500">data:</span> 🚀 Started: Batch size {message.batch_size || 100}
            </div>
        )
    } else if (message.type === 'progress') {
        const statusIcon = message.status === 'completed' ? '✓' : message.status === 'skipped' ? '⊘' : message.status === 'failed' ? '✗' : '⟳'
        const typeBadge = message.message_type ? ` [${message.message_type}]` : ''
        const locationBadge = message.location ? ` - ${message.location}` : ''
        const splitBadge = message.split_index ? ` (split: ${message.split_index})` : ''
        const errorText = message.error ? ` - ${message.error}` : ''

        return (
            <div className={messageColor}>
                <span className="text-gray-500">data:</span> {statusIcon}{' '}
                {message.message_id ? (
                    <button
                        onClick={() => handleCopySQL(message.message_id!)}
                        className="underline hover:no-underline font-mono text-sm cursor-pointer hover:opacity-80 transition-opacity"
                        title="Click to copy SQL query to clipboard"
                    >
                        {copied ? (
                            <span className="text-green-300">✓ Copied!</span>
                        ) : (
                            message.message_id
                        )}
                    </button>
                ) : (
                    <span>{message.progress || ''}</span>
                )}{' '}
                - {message.status || 'processing'}{typeBadge}{locationBadge}{splitBadge}{errorText}
            </div>
        )
    } else if (message.type === 'complete') {
        return (
            <div className={messageColor}>
                <span className="text-gray-500">data:</span> ✅ Complete: {message.messages_extracted || 0} extracted, {message.messages_skipped || 0} skipped, {message.messages_failed || 0} failed
            </div>
        )
    } else if (message.type === 'error') {
        return (
            <div className={messageColor}>
                <span className="text-gray-500">data:</span> ❌ Error: {message.error || 'Unknown error'}
            </div>
        )
    }

    return (
        <div className={messageColor}>
            <span className="text-gray-500">data:</span> {JSON.stringify(message, null, 2)}
        </div>
    )
}

