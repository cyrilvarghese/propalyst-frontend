/**
 * Dynamic UI Generator - Main Page
 * =================================
 *
 * This is where everything comes together!
 *
 * User types: "button"
 *      ↓
 * Backend processes with LangGraph
 *      ↓
 * Returns JSON: { type: "Button", props: {...} }
 *      ↓
 * DynamicRenderer renders the component
 *      ↓
 * User sees the button on screen!
 */

'use client'

import { useState } from 'react'
import DynamicRenderer from '@/components/DynamicRenderer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ComponentConfig, GenerateUIResponse } from '@/lib/types/ui-components'

export default function Home() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [userInput, setUserInput] = useState('')
  const [componentConfig, setComponentConfig] = useState<ComponentConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agentMessage, setAgentMessage] = useState<string | null>(null)

  // ============================================================================
  // API CALL
  // ============================================================================

  const generateUI = async () => {
    if (!userInput.trim()) {
      setError('Please enter a component description')
      return
    }

    setLoading(true)
    setError(null)
    setComponentConfig(null)
    setAgentMessage(null)

    try {
      const response = await fetch('http://localhost:8000/api/generate-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: GenerateUIResponse = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.component) {
        setComponentConfig(data.component)
        setAgentMessage(data.message)
      } else {
        setError('No component returned from agent')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate UI')
      console.error('Error generating UI:', err)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // EXAMPLE PROMPTS
  // ============================================================================

  const examplePrompts = [
    'button',
    'text area',
    'checkbox with options: React, Vue, Angular',
    'slider from 0 to 100',
  ]

  const tryExample = (prompt: string) => {
    setUserInput(prompt)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* ====================================================================== */}
        {/* HEADER */}
        {/* ====================================================================== */}

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            ✨ Dynamic UI Generator
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Powered by LangGraph + Next.js + Generative UI
          </p>
          <p className="text-slate-500">
            Type what you want, and watch the AI generate it!
          </p>
        </div>

        {/* ====================================================================== */}
        {/* INPUT SECTION */}
        {/* ====================================================================== */}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="space-y-4">
            <Label htmlFor="user-input" className="text-lg font-semibold">
              What UI component do you want to generate?
            </Label>

            <Textarea
              id="user-input"
              placeholder="Try: 'button' or 'checkbox with options A, B, C' or 'slider from 0 to 100'"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={3}
              className="text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  generateUI()
                }
              }}
            />

            <div className="flex items-center gap-4">
              <Button
                onClick={generateUI}
                disabled={loading || !userInput.trim()}
                size="lg"
                className="min-w-[200px]"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span>
                    Generate UI
                  </>
                )}
              </Button>

              <span className="text-sm text-slate-500">
                or press Ctrl+Enter
              </span>
            </div>

            {/* Example prompts */}
            <div className="border-t pt-4">
              <p className="text-sm text-slate-600 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => tryExample(prompt)}
                    className="text-sm px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* RESULT SECTION */}
        {/* ====================================================================== */}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-12 mb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl animate-bounce">🤖</div>
              <div className="text-center">
                <h3 className="font-semibold text-blue-900 mb-1">
                  LangGraph Agent Working...
                </h3>
                <p className="text-blue-700">
                  Processing your request with AI
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success State - Agent Message */}
        {agentMessage && !loading && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Agent Response</h3>
                <p className="text-blue-800">{agentMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State - Rendered Component */}
        {componentConfig && !loading && (
          <div className="mb-8">
            <DynamicRenderer config={componentConfig} />
          </div>
        )}

        {/* ====================================================================== */}
        {/* HOW IT WORKS */}
        {/* ====================================================================== */}

        <div className="bg-slate-800 text-slate-100 rounded-xl p-8 mt-12">
          <h2 className="text-2xl font-bold mb-4">🎓 How This Works</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">User Input</h3>
                <p className="text-slate-300">
                  You type a natural language description (e.g., "button")
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">LangGraph Agent</h3>
                <p className="text-slate-300">
                  Backend processes with LLM (OpenAI/Gemini) to extract component type and props
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">JSON Response</h3>
                <p className="text-slate-300">
                  Returns structured JSON: {`{ type: "Button", props: { label: "Click Me" } }`}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Dynamic Rendering</h3>
                <p className="text-slate-300">
                  DynamicRenderer looks up component in registry and renders it
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold mb-1">UI Appears</h3>
                <p className="text-slate-300">
                  You see the generated component on screen! ✨
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="font-semibold mb-2">🛠️ Technologies Used:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'LangGraph',
                'LangChain',
                'OpenAI/Gemini',
                'FastAPI',
                'Next.js 14',
                'TypeScript',
                'shadcn/ui',
                'Tailwind CSS',
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-slate-700 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* FOOTER */}
        {/* ====================================================================== */}

        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>Project 1: Dynamic UI Generator</p>
          <p className="mt-1">Part of Propalyst Learning Roadmap</p>
        </div>
      </div>
    </div>
  )
}
