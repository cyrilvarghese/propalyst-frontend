/**
 * Query Optimizer Prompts
 * =======================
 * 
 * Prompt templates for the Query Optimizer Service.
 * Separates prompt engineering from service logic.
 */

export const QUERY_OPTIMIZATION_PROMPT = (userQuery: string) => `You are a real estate search query optimizer for property searches in India.

Transform this user query into an optimized search query by applying the following rules:

**USER QUERY:** "${userQuery}"

**TRANSFORMATION RULES:**

1. **Area/Square Feet:**
   - If absolute value given (e.g., "2000 sqft"), convert to ±25% range
   - Example: "2000 sqft" → "1500-2500 sqft"
   - Example: "1800 square feet" → "1350-2250 square feet"
   - If range already given (e.g., "2000-4000 sqft"), preserve it

2. **Budget Calculation (Cost per sq ft):**
   - If budget specified as cost per sq ft (e.g., "Rs 250-270 / sq feet" or "250-270 per sq ft")
   - AND area is specified (e.g., "2000-4000 sq feet")
   - Calculate total budget: area × cost per sq ft
   - Example: "2000-4000 sq feet" + "Rs 250-270 / sq feet" → Calculate:
     * Min: 2000 × 250 = 500,000 Rs = 5 lakhs
     * Max: 4000 × 270 = 1,080,000 Rs = 10.8 lakhs
     * Output: "budget 5-10.8 lakhs" or "between 5-10.8 lakhs"
   - Convert to appropriate unit (lakhs for < 1 crore, crores for ≥ 1 crore)
   - Example: "1500-2500 sqft" + "Rs 300/sq ft" → "budget 4.5-7.5 lakhs"
   - If only single area value, use ±25% range first, then calculate budget

3. **Price (Crores/Lakhs):**
   - If single price given (and NOT calculated from budget), create range with -40% lower bound
   - Example: "5 crore" → "3-5 crore" (5 - 40% = 3)
   - Example: "80 lakh" → "48-80 lakh" (80 - 40% = 48)
   - Example: "50000" (rental) → "30000-50000" (rental - 40% = 30000)
   - If budget was calculated from cost per sq ft, use that calculated budget instead

4. **Location:**
   - Add city context if not present
   - Example: "Indiranagar" → "Indiranagar Bangalore"
   - Example: "Whitefield" → "Whitefield Bangalore"
   - Example: "HSR Layout" → "HSR Layout Bangalore"

5. **Property Type:**
   - Preserve BHK specification exactly
   - Add "apartment" or "house" keyword if not present
   - Example: "4BHK" → "4BHK apartment"
   - Example: "3BHK house" → "3BHK house" (preserved)

6. **Keywords:**
   - Keep existing keywords like "independent", "furnished", "gated community" "storage" "showroom" "shop"
   - Add "for rent" or "for sale" based on context (crore/lakh = sale, low numbers = rent)

**OUTPUT FORMAT:**
Return ONLY the optimized query string. Do not include explanations, reasoning, or markdown.

**EXAMPLES:**

Input: "4BHK 2000 square feet Indiranagar 5 crore"
Output: 4BHK apartment 1500-2500 square feet in Indiranagar Bangalore between 3-5 crores for sale

Input: "3BHK Whitefield under 40000"
Output: 3BHK apartment in Whitefield Bangalore between 24000-40000 for rent

Input: "2BHK 1200 sqft Koramangala"
Output: 2BHK apartment 900-1500 sqft in Koramangala Bangalore

Input: "Retail Store Church Street 2000-4000 Sq Feet ground floor budget Rs 250-270 / sq feet"
Output: Retail Store in Church Street Bangalore 1500-5000 square feet ground floor budget 3.75-10.8 lakhs commercial

Input: "Commercial space 3000 sqft budget Rs 200 per sq ft"
Output: Commercial space 2250-3750 sqft budget 4.5-7.5 lakhs

Now optimize this query:
"${userQuery}"

Return ONLY the optimized query, nothing else.`

