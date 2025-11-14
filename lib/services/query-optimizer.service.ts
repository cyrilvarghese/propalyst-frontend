/**
 * Query Optimizer Service - Using Gemini
 * =======================================
 *
 * Transforms absolute property search queries into optimized queries with ranges.
 * This makes searches broader and more likely to return relevant results.
 *
 * Example Transformation:
 * Input:  "4BHK 2000 square feet Indiranagar 5 crore"
 * Output: "4BHK apartment 1500-2500 square feet in Indiranagar Bangalore between 3-5 crores"
 *
 * Transformations Applied:
 * - Area: ±25% range (2000 → 1500-2500)
 * - Price: -40% lower bound (5 crore → 3-5 crore)
 * - Location: Add city context (Indiranagar → Indiranagar Bangalore)
 * - Property type: Preserve as-is
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { QUERY_OPTIMIZATION_PROMPT } from '@/lib/prompts/query-optimizer.prompts'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY

export class QueryOptimizerService {
    private gemini: GoogleGenerativeAI
    private optimizerId: string

    constructor() {
        this.optimizerId = `optimizer-${Date.now()}-${Math.random().toString(36).substring(7)}`

        if (!API_KEY) {
            throw new Error('GOOGLE_AI_API_KEY not configured')
        }

        this.gemini = new GoogleGenerativeAI(API_KEY)
        console.log(`[QueryOptimizer:${this.optimizerId}] 🚀 Initialized with Gemini`)
    }

    /**
     * Optimize user query by converting absolute values to ranges
     */
    async optimize(userQuery: string): Promise<string> {
        console.log(`[QueryOptimizer:${this.optimizerId}] 🔍 Optimizing query:`, userQuery)

        try {
            const prompt = QUERY_OPTIMIZATION_PROMPT(userQuery)
            const optimizedQuery = await this.callGemini(prompt)

            console.log(`[QueryOptimizer:${this.optimizerId}] ✅ Optimized query:`, optimizedQuery)
            return optimizedQuery

        } catch (error: any) {
            console.error(`[QueryOptimizer:${this.optimizerId}] ❌ Error:`, error.message)
            // Fallback: return original query if optimization fails
            console.log(`[QueryOptimizer:${this.optimizerId}] ⚠️ Falling back to original query`)
            return userQuery
        }
    }

    /**
     * Call Gemini API for query optimization
     */
    private async callGemini(prompt: string): Promise<string> {
        console.log(`[QueryOptimizer:${this.optimizerId}] 🌐 Calling Gemini for optimization`)

        const model = this.gemini.getGenerativeModel({
            model: 'gemini-2.0-flash-exp'
        })

        const result = await model.generateContent(prompt)
        const optimizedQuery = result.response.text().trim()

        return optimizedQuery
    }
}
