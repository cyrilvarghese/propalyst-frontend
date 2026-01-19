/**
 * SearchLanding - Google-style Landing Page
 * ==========================================
 *
 * Minimal landing page with centered logo and search bar.
 * Matches Google's clean, focused design aesthetic.
 */

'use client'

import { useState, KeyboardEvent } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchLandingProps {
    onSearch: (query: string) => void
    onBrowseAll: () => void
    isLoading?: boolean
}

export default function SearchLanding({ onSearch, onBrowseAll, isLoading }: SearchLandingProps) {
    const [query, setQuery] = useState('')

    const handleSearch = () => {
        onSearch(query.trim())
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col relative overflow-hidden">
            {/* Wavy Background - Top */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg
                    className="absolute -top-10 left-0 w-full h-64 md:h-80"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="xMidYMin slice"
                    fill="none"
                >
                    <path
                        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        fill="url(#waveGradient)"
                        fillOpacity="0.15"
                        transform="scale(1,-1) translate(0,-320)"
                    />
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#c0392b" />
                            <stop offset="50%" stopColor="#e74c3c" />
                            <stop offset="100%" stopColor="#c0392b" />
                        </linearGradient>
                    </defs>
                </svg>
                <svg
                    className="absolute -top-10 left-0 w-full h-48 md:h-64"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="xMidYMin slice"
                    fill="none"
                >
                    <path
                        d="M0,256L48,240C96,224,192,192,288,186.7C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        fill="url(#waveGradient2)"
                        fillOpacity="0.1"
                        transform="scale(1,-1) translate(0,-320)"
                    />
                    <defs>
                        <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a93226" />
                            <stop offset="100%" stopColor="#c0392b" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Main Content - Centered */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
                {/* Logo */}
                <div className="mb-8">
                    <div className="relative h-16 w-64 md:h-20 md:w-80">
                        <Image
                            src="/propalyst-mls-logo.png"
                            alt="Propalyst MLS"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-xl md:max-w-2xl">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                            <Search className="absolute left-5 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Enter keywords like location or project name"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                className="w-full pl-12 md:pl-14 pr-5 py-4 md:py-8 text-base md:text-lg border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-sm md:placeholder:text-lg"
                            />
                        </div>
                    </div>

                    {/* Hint text right below search bar */}
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Search across thousands of listings from our database
                    </p>

                    {/* Action Button */}
                    <div className="flex items-center justify-center mt-6">
                        <Button
                            onClick={handleSearch}
                            disabled={isLoading || !query.trim()}
                            className="h-12 px-8 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-full text-base font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 px-6 bg-gray-100 border-t border-gray-200">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 text-xs md:text-sm text-gray-600">
                    <div className="text-center md:text-left flex flex-col md:block">
                        <span>© 2026 <a href="https://propalyst.com" target="_blank" rel="noopener noreferrer" className="text-[#e74c3c]">Propalyst</a>. All rights reserved.</span>
                        <span className="hidden md:inline mx-2">|</span>
                        <span className="mt-1 md:mt-0">Need help? Write to support at <a href="https://propalyst.com" className="text-[#e74c3c] hover:underline transition-colors">Propalyst.com</a></span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <span>Want to add your listing?</span>
                        <a
                            href="https://chat.whatsapp.com/J827YjNq8RU5Zwf0NWhXHY"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs md:text-sm font-medium rounded-full transition-colors"
                        >
                            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Join
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
