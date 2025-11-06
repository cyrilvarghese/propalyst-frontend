/**
 * PropalystChat - Main conversational interface
 * ==============================================
 *
 * This component orchestrates the Propalyst Q&A conversation flow:
 * 1. Manages session state and API communication
 * 2. Coordinates child components (Header, Messages, Input)
 * 3. Handles completion flow and summary generation
 * 4. Notifies parent about area cards display
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import DynamicRenderer from '@/components/DynamicRenderer'
import ChatMessage from './ChatMessage'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import LoadingIndicator from './LoadingIndicator'
import { PropalystService, Area } from '@/lib/services'
import type {
  ChatMessage as ChatMessageType,
  UIComponent,
  LoadingState
} from '@/lib/types/propalyst'

interface PropalystChatProps {
  onAreaCardsReady?: (show: boolean, loading: boolean) => void
  onSummaryGenerated?: (summary: string) => void
  onSummaryLoadingChange?: (loading: boolean) => void
  onAreasLoaded?: (areas: Area[]) => void
}

export default function PropalystChat({
  onAreaCardsReady,
  onSummaryGenerated,
  onSummaryLoadingChange,
  onAreasLoaded
}: PropalystChatProps) {
  // Session and state
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [currentComponent, setCurrentComponent] = useState<UIComponent | null>(null)
  const [currentField, setCurrentField] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(1)
  const [completed, setCompleted] = useState(false)
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Chat input state
  const [chatInput, setChatInput] = useState('')

  // Summary state
  const [summary, setSummary] = useState<string>('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Area cards state
  const [areaCardsLoading, setAreaCardsLoading] = useState(false)

  // Initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)

  // Auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize session ID on client only (prevents hydration mismatch)
  useEffect(() => {
    setSessionId(uuidv4())
  }, [])

  // Initial load - show chat after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
      setShowChat(true)
      // Focus on chat input after chat is visible
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 500)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Start conversation (only after sessionId is set and chat is visible)
  useEffect(() => {
    if (sessionId && showChat) {
      startConversation()
    }
  }, [sessionId, showChat])

  // Handle completion - show loading indicator and fetch summary
  useEffect(() => {
    if (completed && !summary) {
      // Set loading state to show loading indicator
      setLoadingState('loading')

      // Fetch summary after 500ms
      const summaryTimer = setTimeout(() => {
        fetchSummary()
      }, 500)

      return () => {
        clearTimeout(summaryTimer)
      }
    }
  }, [completed, summary])

  // Load area cards immediately when summary is generated
  useEffect(() => {
    if (summary && !areaCardsLoading) {
      // Show skeleton cards immediately with summary
      loadAreaCards()
    }
  }, [summary])

  /**
   * Fetch conversation summary from backend
   */
  const fetchSummary = async () => {
    setSummaryLoading(true)
    if (onSummaryLoadingChange) {
      onSummaryLoadingChange(true)
    }

    try {
      const data = await PropalystService.fetchSummary({
        session_id: sessionId,
      })

      setSummary(data.summary)
      setSummaryLoading(false)
      setLoadingState('success') // Remove loading indicator
      if (onSummaryLoadingChange) {
        onSummaryLoadingChange(false)
      }

      // Notify parent that summary is ready
      if (onSummaryGenerated) {
        onSummaryGenerated(data.summary)
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err)
      setSummary('Unable to generate summary. Please try again.')
      setSummaryLoading(false)
      setLoadingState('error')
      if (onSummaryLoadingChange) {
        onSummaryLoadingChange(false)
      }
    }
  }

  /**
   * Load area cards - fetch from backend API
   */
  const loadAreaCards = async () => {
    setAreaCardsLoading(true)

    // Notify parent that area cards are loading
    if (onAreaCardsReady) {
      onAreaCardsReady(false, true)
    }

    try {
      // Fetch areas from backend
      const data = await PropalystService.fetchAreas({
        session_id: sessionId,
      })

      // Notify parent with fetched areas
      if (onAreasLoaded) {
        onAreasLoaded(data.areas)
      }

      setAreaCardsLoading(false)

      // Notify parent to show area cards
      if (onAreaCardsReady) {
        onAreaCardsReady(true, false)
      }
    } catch (err) {
      console.error('Failed to fetch areas:', err)
      setAreaCardsLoading(false)

      // Still notify parent even on error (will show empty state)
      if (onAreaCardsReady) {
        onAreaCardsReady(true, false)
      }
    }
  }

  /**
   * Start the conversation (initial API call)
   */
  const startConversation = async () => {
    setLoadingState('loading')

    try {
      const data = await PropalystService.sendChat({
        session_id: sessionId,
        user_input: null,
      })

      // Add agent's message to history
      // Backend may send multiple messages separated by "|||"
      if (data.message) {
        const messageParts = data.message.split('|||').filter(msg => msg.trim())

        if (messageParts.length > 1) {
          // Multiple messages: show first immediately, keep loading
          const firstMessage = {
            role: 'agent' as const,
            content: messageParts[0].trim(),
            timestamp: new Date()
          }
          setMessages([firstMessage])
          // Keep loading state active until second message

          // Show second message and controls after 1.5 second delay
          setTimeout(() => {
            const secondMessage = {
              role: 'agent' as const,
              content: messageParts[1].trim(),
              timestamp: new Date()
            }
            setMessages(prev => [...prev, secondMessage])

            // Update UI with controls/component when second message appears
            updateUIState(data)
          }, 1500)
        } else {
          // Single message: show immediately with controls
          setMessages([{
            role: 'agent',
            content: data.message,
            timestamp: new Date()
          }])

          // Update UI immediately for single message
          updateUIState(data)
        }
      }
    } catch (err) {
      console.error('Failed to start conversation:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoadingState('error')
    }
  }

  /**
   * Send user's answer to backend
   */
  const sendAnswer = async (userInput: string) => {
    // Add user's message to history immediately for instant feedback
    const userMessage: ChatMessageType = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Clear current component while loading
    setCurrentComponent(null)
    setLoadingState('loading')

    try {
      const data = await PropalystService.sendChat({
        session_id: sessionId,
        user_input: userInput,
        field: currentField,
      })

      // Add agent's response(s) to history
      // Backend may send multiple messages separated by "|||"
      if (data.message) {
        const messageParts = data.message.split('|||').filter(msg => msg.trim())

        if (messageParts.length > 1) {
          // Multiple messages: show first immediately, keep loading
          const firstMessage = {
            role: 'agent' as const,
            content: messageParts[0].trim(),
            timestamp: new Date()
          }
          setMessages(prev => [...prev, firstMessage])
          // Keep loading state active until second message

          // Show second message and controls after 1.5 second delay
          setTimeout(() => {
            const secondMessage = {
              role: 'agent' as const,
              content: messageParts[1].trim(),
              timestamp: new Date()
            }
            setMessages(prev => [...prev, secondMessage])

            // Update UI with controls/component when second message appears
            updateUIState(data)

            // Return focus to chat input after response
            setTimeout(() => {
              chatInputRef.current?.focus()
            }, 100)
          }, 1500)
        } else {
          // Single message: show immediately with controls
          const newMessages = messageParts.map(content => ({
            role: 'agent' as const,
            content: content.trim(),
            timestamp: new Date()
          }))
          setMessages(prev => [...prev, ...newMessages])

          // Update UI immediately for single message
          updateUIState(data)

          // Return focus to chat input after response
          setTimeout(() => {
            chatInputRef.current?.focus()
          }, 100)
        }
      }
    } catch (err) {
      console.error('Failed to send answer:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoadingState('error')

      // Return focus to chat input even on error
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    }
  }

  /**
   * Helper to update UI state from API response
   */
  const updateUIState = (data: any) => {
    setCurrentComponent(data.component)

    if (data.component?.props?.field) {
      setCurrentField(data.component.props.field)
    } else {
      // No component means text input via chat - determine field from step
      setCurrentField(determineFieldFromStep(data.current_step))
    }

    setCurrentStep(data.current_step)
    setCompleted(data.completed)
    setLoadingState('success')
  }

  /**
   * Helper to determine field name from step number
   */
  const determineFieldFromStep = (step: number): string => {
    const fieldMap: Record<number, string> = {
      1: 'work_location',
      2: 'has_kids',
      3: 'commute_time_max',
      4: 'property_type',
      5: 'budget_max'
    }
    return fieldMap[step] || ''
  }

  /**
   * Handle chat input submission
   * Automatically determine which field to fill based on current state
   */
  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      sendAnswer(chatInput.trim())
      setChatInput('')

      // Return focus to input after submission
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSubmit()
    }
  }

  // Show loading screen for first 2 seconds
  if (isInitialLoading || !sessionId) {
    return (
      <div className="flex flex-col h-[700px] max-w-4xl mx-auto items-center justify-center">
        <div className="text-center">
          <div className="flex items-center gap-2 text-gray-300 mb-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          <div className="text-lg text-gray-200 font-medium">
            Loading your personalized home search experience...
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Chat Messages Area - Scrolls with page content (NOT sticky) */}
      <motion.div
        className="flex flex-col w-full max-w-[896px] mx-auto mb-8 px-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        transition={{
          duration: 1.2,
          delay: 0.5,
          ease: [0, 0.71, 0.2, 1.01],
          opacity: { duration: 1.5, ease: "easeInOut" }
        }}
      >
        {/* Header */}
        <ChatHeader completed={completed} />

        {/* Chat messages area with glassmorphism - Fixed height with internal scroll */}
        <Card className="flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 relative h-[600px] w-full max-w-[896px]">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6 w-full max-w-full">
              {/* Message history */}
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}

              {/* Current component (inline with messages) - only show if component exists */}
              {currentComponent && !completed && (
                <div className="flex justify-start w-full">
                  <div className="w-full max-w-full overflow-hidden">
                    <DynamicRenderer
                      config={currentComponent}
                      onSubmit={sendAnswer}
                      onSelect={sendAnswer}
                    />
                  </div>
                </div>
              )}

              {/* If no component, show placeholder hint for chat input */}
              {!currentComponent && !completed && loadingState !== 'loading' && (
                <div className="flex justify-center py-2">
                  <div className="text-sm text-gray-400 italic">
                    Type your answer in the chat box below...
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {loadingState === 'loading' && !completed && <LoadingIndicator />}
              {loadingState === 'loading' && completed && <LoadingIndicator message="Loading recommendations" />}

              {/* Error message */}
              {error && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="text-red-800 font-medium">Error</div>
                  <div className="text-sm text-red-600">{error}</div>
                </Card>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>
      </motion.div>

      {/* Floating Chat Input Box - Sticky at bottom, floats over area cards */}
      <motion.div
        className="fixed bottom-8 left-0 right-0 z-50 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <ChatInput
          value={chatInput}
          onChange={setChatInput}
          onSubmit={handleChatSubmit}
          onKeyPress={handleKeyPress}
          loadingState={loadingState}
          completed={completed}
          inputRef={chatInputRef}
        />
      </motion.div>
    </>
  )
}
