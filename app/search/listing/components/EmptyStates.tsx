/**
 * Empty States Components
 * =======================
 * 
 * Reusable components for different states:
 * - LoadingState: When data is being fetched
 * - ErrorState: When an error occurred
 * - EmptyState: When no results found
 * 
 * CONCEPT: Presentational Components
 * - Only render UI based on props
 * - No state, no hooks (usually)
 * - Easy to test and reuse
 */

import { Card } from '@/components/ui/card'
import Link from 'next/link'

// ============================================================================
// LOADING STATE
// ============================================================================

interface LoadingStateProps {
    /** Message to display while loading */
    message?: string
}

/**
 * LoadingState Component
 * 
 * Shows spinner and loading message while data is being fetched.
 * 
 * CONCEPT: Props Pattern
 * - Props let you customize component behavior
 * - This component can show different messages
 * - Make components flexible with optional props (using ?)
 */
export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
            <div className="text-center py-12">
                {/* Animated spinner */}
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-gray-600 mt-4">{message}</p>
            </div>
        </Card>
    )
}

// ============================================================================
// ERROR STATE
// ============================================================================

interface ErrorStateProps {
    /** Error message to display */
    error: Error
}

/**
 * ErrorState Component
 * 
 * Shows error message in a prominent way.
 * 
 * CONCEPT: Extracting Errors
 * - Extract error display to reusable component
 * - Can use same component for different errors
 * - Consistent error UI across app
 */
export function ErrorState({ error }: ErrorStateProps) {
    return (
        <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
            <div className="text-center py-12">
                <div className="text-red-400 text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Error loading properties
                </h3>
                <p className="text-gray-500">{error.message}</p>
            </div>
        </Card>
    )
}

// ============================================================================
// NO URL STATE
// ============================================================================

/**
 * NoUrlState Component
 * 
 * Shows when user navigated to page without URL parameter.
 */
export function NoUrlState() {
    return (
        <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
            <div className="text-center py-12">
                <p className="text-gray-600">No URL provided</p>
                <Link
                    href="/search"
                    className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
                >
                    Go back to search
                </Link>
            </div>
        </Card>
    )
}

// ============================================================================
// EMPTY RESULTS STATE
// ============================================================================

/**
 * EmptyResultsState Component
 * 
 * Shows when search completed but no properties were found.
 */
export function EmptyResultsState() {
    return (
        <Card className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 p-6">
            <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No properties found
                </h3>
                <p className="text-gray-500">
                    The URL did not return any property listings
                </p>
            </div>
        </Card>
    )
}


