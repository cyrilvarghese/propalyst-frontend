/**
 * Property Utility Functions
 * ===========================
 * 
 * Helper functions for extracting and processing property data
 */

/**
 * Extract numeric price from string (e.g., "₹5.34 Cr" -> 53400000)
 * Handles formats like:
 * - "₹5.34 Cr" or "5.34 Crore" -> converts to rupees
 * - "₹50 L" or "50 Lakh" -> converts to rupees
 * - "₹50000" -> returns as is
 */
export function extractPrice(priceStr: string): number {
    const str = priceStr.toLowerCase().replace(/[₹,\s]/g, '')
    if (str.includes('cr') || str.includes('crore')) {
        const num = parseFloat(str.replace(/[^0-9.]/g, '')) || 0
        return num * 10000000
    } else if (str.includes('l') || str.includes('lakh')) {
        const num = parseFloat(str.replace(/[^0-9.]/g, '')) || 0
        return num * 100000
    } else {
        return parseFloat(str.replace(/[^0-9.]/g, '')) || 0
    }
}

/**
 * Extract numeric area from string (e.g., "2375 sqft" -> 2375)
 * Handles formats with commas and units
 */
export function extractArea(areaStr: string): number {
    const match = areaStr.match(/([\d,]+)/)
    return match ? parseFloat(match[1].replace(/,/g, '')) || 0 : 0
}

/**
 * Extract date timestamp from string
 * Returns timestamp in milliseconds, or 0 if invalid
 */
export function extractDate(dateStr: string): number {
    if (!dateStr) return 0
    // Try to parse common date formats
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? 0 : date.getTime()
}

/**
 * Safely decode URI components with error handling
 * Handles malformed URIs (e.g., incomplete percent encodings at the end)
 * 
 * @param encoded - The encoded URI string to decode
 * @returns The decoded string, or original string if decoding fails
 * 
 * Example:
 * - "Ready%20house" -> "Ready house"
 * - "Ready%20house%2C%" -> "Ready house," (handles trailing incomplete %)
 */
export function safeDecodeURIComponent(encoded: string): string {
    if (!encoded) return ''
    
    try {
        // First, try direct decoding
        return decodeURIComponent(encoded)
    } catch (e) {
        // If decoding fails, try to fix common issues:
        // 1. Remove trailing incomplete percent encodings (e.g., "%" at the end)
        // 2. Replace incomplete percent sequences with the literal character
        
        let fixed = encoded
        
        // Remove trailing incomplete percent encodings
        fixed = fixed.replace(/%$/, '') // Remove trailing %
        fixed = fixed.replace(/%[0-9A-Fa-f]$/i, '') // Remove trailing %X (single hex digit)
        
        try {
            return decodeURIComponent(fixed)
        } catch (e2) {
            // If still failing, replace remaining incomplete % sequences
            fixed = fixed.replace(/%[^0-9A-Fa-f]|%$/gi, (match) => {
                // Replace incomplete % sequences with the character after %
                return match.length > 1 ? match.substring(1) : ''
            })
            
            try {
                return decodeURIComponent(fixed)
            } catch (e3) {
                // Last resort: return original string
                return encoded
            }
        }
    }
}


