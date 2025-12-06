/**
 * useListingsFilters - Custom Hook
 * ==================================
 * 
 * Handles client-side filtering of listings.
 */

import { useState, useCallback, useMemo } from 'react'
import { WhatsAppListing, RBProperty } from '@/lib/api/whatsapp-listings'

interface FilterState {
    location: string
    agent: string
    property: string
    bedroomCount: string
    transactionType: string
    exactMatch: boolean
}

interface UseListingsFiltersReturn {
    filters: FilterState
    setLocation: (location: string) => void
    setAgent: (agent: string) => void
    setProperty: (property: string) => void
    setBedroomCount: (count: string) => void
    setTransactionType: (type: string) => void
    setExactMatch: (exact: boolean) => void
    resetFilters: () => void
    applyFilters: (listings: WhatsAppListing[]) => WhatsAppListing[]
    applyFiltersToRBProperties: (properties: RBProperty[]) => RBProperty[]
    hasActiveFilters: boolean
}

const initialFilters: FilterState = {
    location: '',
    agent: '',
    property: '',
    bedroomCount: '',
    transactionType: '',
    exactMatch: false
}

export function useListingsFilters(): UseListingsFiltersReturn {
    const [filters, setFilters] = useState<FilterState>(initialFilters)

    const setLocation = useCallback((location: string) => {
        setFilters(prev => ({ ...prev, location }))
    }, [])

    const setAgent = useCallback((agent: string) => {
        setFilters(prev => ({ ...prev, agent }))
    }, [])

    const setProperty = useCallback((property: string) => {
        setFilters(prev => ({ ...prev, property }))
    }, [])

    const setBedroomCount = useCallback((bedroomCount: string) => {
        setFilters(prev => ({ ...prev, bedroomCount }))
    }, [])

    const setTransactionType = useCallback((transactionType: string) => {
        setFilters(prev => ({ ...prev, transactionType }))
    }, [])

    const setExactMatch = useCallback((exactMatch: boolean) => {
        setFilters(prev => ({ ...prev, exactMatch }))
    }, [])

    const resetFilters = useCallback(() => {
        setFilters(initialFilters)
    }, [])

    const applyFilters = useCallback((listings: WhatsAppListing[]): WhatsAppListing[] => {
        let filtered = [...listings]

        // Filter by location
        if (filters.location.trim()) {
            const locationLower = filters.location.trim().toLowerCase()
            filtered = filtered.filter(listing => {
                const listingLocation = (listing.location || '').toLowerCase()
                return filters.exactMatch
                    ? listingLocation === locationLower
                    : listingLocation.includes(locationLower)
            })
        }

        // Filter by agent name
        if (filters.agent.trim()) {
            const agentLower = filters.agent.trim().toLowerCase()
            filtered = filtered.filter(listing => {
                const agentName = (listing.agent_name || '').toLowerCase()
                const companyName = (listing.company_name || '').toLowerCase()
                if (filters.exactMatch) {
                    return agentName === agentLower || companyName === agentLower
                }
                return agentName.includes(agentLower) || companyName.includes(agentLower)
            })
        }

        // Note: property_type and message_type are now server-side filters, handled by API

        // Filter by bedroom count
        if (filters.bedroomCount.trim()) {
            const bedroomCount = parseInt(filters.bedroomCount)
            filtered = filtered.filter(listing => {
                if (!listing.bedrooms) return false
                // For "6+", show 6 or more bedrooms
                if (bedroomCount === 6) {
                    return listing.bedrooms >= 6
                }
                return listing.bedrooms === bedroomCount
            })
        }

        return filtered
    }, [filters])

    const applyFiltersToRBProperties = useCallback((properties: RBProperty[]): RBProperty[] => {
        let filtered = [...properties]

        // Filter by location
        if (filters.location.trim()) {
            const locationLower = filters.location.trim().toLowerCase()
            filtered = filtered.filter(property => {
                const propertyLocation = (property.location || '').toLowerCase()
                return filters.exactMatch
                    ? propertyLocation === locationLower
                    : propertyLocation.includes(locationLower)
            })
        }

        // Filter by agent name
        if (filters.agent.trim()) {
            const agentLower = filters.agent.trim().toLowerCase()
            filtered = filtered.filter(property => {
                const agentName = (property.agent_name || '').toLowerCase()
                const companyName = (property.company_name || '').toLowerCase()
                if (filters.exactMatch) {
                    return agentName === agentLower || companyName === agentLower
                }
                return agentName.includes(agentLower) || companyName.includes(agentLower)
            })
        }

        // Filter by bedroom count
        if (filters.bedroomCount.trim()) {
            const bedroomCount = parseInt(filters.bedroomCount)
            filtered = filtered.filter(property => {
                if (!property.bedrooms) return false
                // For "6+", show 6 or more bedrooms
                if (bedroomCount === 6) {
                    return property.bedrooms >= 6
                }
                return property.bedrooms === bedroomCount
            })
        }

        return filtered
    }, [filters])

    const hasActiveFilters = useMemo(() => {
        return (
            filters.location.trim().length > 0 ||
            filters.agent.trim().length > 0 ||
            filters.bedroomCount.trim().length > 0 ||
            filters.exactMatch
        )
    }, [filters])

    return {
        filters,
        setLocation,
        setAgent,
        setProperty,
        setBedroomCount,
        setTransactionType,
        setExactMatch,
        resetFilters,
        applyFilters,
        applyFiltersToRBProperties,
        hasActiveFilters
    }
}

