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


