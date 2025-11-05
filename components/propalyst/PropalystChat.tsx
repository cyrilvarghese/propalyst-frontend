/**
 * PropalystChat - Main conversational interface
 * ==============================================
 *
 * This component handles the entire Propalyst Q&A conversation flow:
 * 1. Generates unique session_id
 * 2. Manages message history
 * 3. Makes API calls to backend
 * 4. Renders dynamic UI components
 * 5. Handles user answers
 *
 * Flow:
 * -----
 * Initial load → Ask Q1 (work location)
 * User answers Q1 → Ask Q2 (kids)
 * User answers Q2 → Ask Q3 (commute)
 * ... continues until all 5 questions answered
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Bot, Send } from 'lucide-react'
import DynamicRenderer from '@/components/DynamicRenderer'
import ChatMessage from './ChatMessage'
import { PropalystService } from '@/lib/services'
import type {
  ChatMessage as ChatMessageType,
  PropalystChatResponse,
  UIComponent,
  LoadingState
} from '@/lib/types/propalyst'

export default function PropalystChat() {
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
  const [showCompletionAlert, setShowCompletionAlert] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [summaryLoading, setSummaryLoading] = useState(false)

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
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Start conversation (only after sessionId is set and chat is visible)
  useEffect(() => {
    if (sessionId && showChat) {
      startConversation()
    }
  }, [sessionId, showChat])

  // Handle completion - show alert then fetch summary
  useEffect(() => {
    if (completed && !summary) {
      // Show completion alert
      setShowCompletionAlert(true)

      // Fade out alert after 2.5 seconds
      const alertTimer = setTimeout(() => {
        setShowCompletionAlert(false)
      }, 2500)

      // Fetch summary after 1 second
      const summaryTimer = setTimeout(() => {
        fetchSummary()
      }, 1000)

      return () => {
        clearTimeout(alertTimer)
        clearTimeout(summaryTimer)
      }
    }
  }, [completed, summary])

  /**
   * Fetch conversation summary from backend
   */
  const fetchSummary = async () => {
    setSummaryLoading(true)

    try {
      const data = await PropalystService.fetchSummary({
        session_id: sessionId,
      })

      setSummary(data.summary)
      setSummaryLoading(false)
    } catch (err) {
      console.error('Failed to fetch summary:', err)
      setSummary('Unable to generate summary. Please try again.')
      setSummaryLoading(false)
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
            setCurrentComponent(data.component)
            if (data.component?.props?.field) {
              setCurrentField(data.component.props.field)
            } else {
              // No component means text input via chat - determine field from step
              if (data.current_step === 1) {
                setCurrentField('work_location')
              }
            }

            setCurrentStep(data.current_step)
            setCompleted(data.completed)
            setLoadingState('success')
          }, 1500)
        } else {
          // Single message: show immediately with controls
          setMessages([{
            role: 'agent',
            content: data.message,
            timestamp: new Date()
          }])

          // Update UI immediately for single message
          setCurrentComponent(data.component)
          if (data.component?.props?.field) {
            setCurrentField(data.component.props.field)
          } else {
            // No component means text input via chat - determine field from step
            if (data.current_step === 1) {
              setCurrentField('work_location')
            }
          }

          setCurrentStep(data.current_step)
          setCompleted(data.completed)
          setLoadingState('success')
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
            setCurrentComponent(data.component)
            if (data.component?.props?.field) {
              setCurrentField(data.component.props.field)
            } else {
              // No component means text input via chat - determine field from step
              if (data.current_step === 1) {
                setCurrentField('work_location')
              } else if (data.current_step === 2) {
                setCurrentField('has_kids')
              } else if (data.current_step === 3) {
                setCurrentField('commute_time_max')
              } else if (data.current_step === 4) {
                setCurrentField('property_type')
              } else if (data.current_step === 5) {
                setCurrentField('budget_max')
              }
            }

            setCurrentStep(data.current_step)
            setCompleted(data.completed)
            setLoadingState('success')
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
          setCurrentComponent(data.component)
          if (data.component?.props?.field) {
            setCurrentField(data.component.props.field)
          } else {
            // No component means text input via chat - determine field from step
            if (data.current_step === 1) {
              setCurrentField('work_location')
            } else if (data.current_step === 2) {
              setCurrentField('has_kids')
            } else if (data.current_step === 3) {
              setCurrentField('commute_time_max')
            } else if (data.current_step === 4) {
              setCurrentField('property_type')
            } else if (data.current_step === 5) {
              setCurrentField('budget_max')
            }
          }

          setCurrentStep(data.current_step)
          setCompleted(data.completed)
          setLoadingState('success')
        }
      }
    } catch (err) {
      console.error('Failed to send answer:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoadingState('error')
    }
  }

  /**
   * Handle chat input submission
   * Automatically determine which field to fill based on current state
   */
  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      // Determine which field needs to be filled based on current state
      // This maps to the router logic in backend
      let field = currentField

      // If no component is shown (text input via chat), determine field from step
      if (!currentComponent && currentStep === 1) {
        field = 'work_location'
      }

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
    <div className="flex flex-col h-[700px] max-w-4xl mx-auto">
      {/* Header with premium effects */}
      <Card className="p-5 mb-4 bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Propalyst Assistant</h2>
              <p className="text-sm text-gray-500">Let's find your ideal home</p>
            </div>
          </div>
          {completed && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Complete</span>
            </div>
          )}
        </div>
      </Card>

      {/* Chat area with glassmorphism */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 relative">
        <ScrollArea className="flex-1 p-6 overflow-x-hidden">
          <div className="space-y-6 w-full overflow-x-hidden">
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
            {loadingState === 'loading' && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[75%]">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="text-red-800 font-medium">Error</div>
                <div className="text-sm text-red-600">{error}</div>
              </Card>
            )}

            {/* Completion alert - fades out after 2.5 seconds */}
            {completed && showCompletionAlert && (
              <div className="flex justify-center animate-fade-out">
                <div className="bg-gradient-to-r from-primary/20 to-accent/10 border border-primary rounded-2xl p-6 shadow-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎉</div>
                    <div className="text-gray-900 font-semibold mb-1">
                      Perfect! We have everything we need
                    </div>
                    <div className="text-sm text-gray-600">
                      Analyzing the best areas for you...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary textarea - shown after alert fades */}
            {completed && !showCompletionAlert && (
              <div className="w-full">
                {summaryLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm">Generating summary...</span>
                    </div>
                  </div>
                ) : summary ? (
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Search Summary
                    </label>
                    <Textarea
                      value={summary}
                      readOnly
                      className="w-full min-h-[100px] text-base text-gray-800 bg-gray-50 border-gray-300 resize-none focus:ring-0 focus:border-gray-300"
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Persistent chat input - always visible with premium styling */}
        <div className="p-4 border-t border-gray-200/50 bg-gradient-to-b from-white/80 to-white/95 backdrop-blur-lg">
          <div className="relative flex items-center bg-white/90 rounded-xl shadow-md focus-within:ring-2 focus-within:ring-primary/40 transition-all duration-200">
            <Input
              ref={chatInputRef}
              type="text"
              placeholder={completed ? "Refine your search..." : "Type your message..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loadingState === 'loading'}
              className="flex-1 h-12 text-base border-0 bg-transparent rounded-xl focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-20"
            />
            <Button
              onClick={handleChatSubmit}
              disabled={!chatInput.trim() || loadingState === 'loading'}
              className="absolute right-1.5 h-9 px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 text-primary-foreground font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-lg"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
