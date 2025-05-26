'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Zap, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchService, AutocompleteResponse } from '@/lib/search-service'

interface SearchBarProps {
  onSearch?: (query: string, type?: 'all' | 'associations' | 'campaigns') => void
  placeholder?: string
  className?: string
}

interface SpeechRecognitionResult {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionError {
  error: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResult['results']
}

interface SpeechRecognitionErrorEvent extends Event {
  error: SpeechRecognitionError['error']
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Rechercher une association, une campagne...", 
  className
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [autocompleteData, setAutocompleteData] = useState<AutocompleteResponse>({ suggestions: [], recent: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isVoiceSearching, setIsVoiceSearching] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  const { addSearchToHistory, getRecentSuggestions } = useSearchHistory()

  const loadAutocompleteSuggestions = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const recentSuggestions = getRecentSuggestions(5)
      const data = await SearchService.getAutocompleteSuggestions(searchQuery, recentSuggestions)
      setAutocompleteData(data)
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [getRecentSuggestions])

  // Charger les suggestions en temps réel avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        loadAutocompleteSuggestions(query)
      } else {
        setAutocompleteData({
          suggestions: [],
          recent: getRecentSuggestions(5)
        })
      }
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [query, loadAutocompleteSuggestions, getRecentSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
  }

  const handleSearch = useCallback((searchQuery: string = query) => {
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      // Ajouter à l'historique
      addSearchToHistory(trimmedQuery)
      
      // Effectuer la recherche
      onSearch?.(trimmedQuery)
      setSelectedIndex(-1)
      
      // Déselectionner l'input
      inputRef.current?.blur()
    }
  }, [query, onSearch, addSearchToHistory])

  const handleClear = () => {
    setQuery("")
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const suggestions = [
      ...autocompleteData.recent.map(r => ({ text: r.text })),
      ...autocompleteData.suggestions.map(s => ({ text: s.text }))
    ]

    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex].text)
      } else {
        handleSearch()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  // Vérifier la disponibilité de la reconnaissance vocale côté client uniquement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    }
  }, [])

  // Recherche vocale (Web Speech API)
  const handleVoiceSearch = () => {
    if (!isVoiceSupported) {
      console.warn('Reconnaissance vocale non supportée')
      return
    }

    setIsVoiceSearching(true)

    // @ts-expect-error - Types de reconnaissance vocale non standards
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'fr-FR'

    recognition.onresult = (event: SpeechRecognitionEvent & Event) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      handleSearch(transcript)
      setIsVoiceSearching(false)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent & Event) => {
      console.error('Erreur reconnaissance vocale:', event.error)
      setIsVoiceSearching(false)
    }

    recognition.onend = () => {
      setIsVoiceSearching(false)
    }

    recognition.start()
  }

  // Fermer les suggestions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative w-full max-w-2xl ${className}`} ref={suggestionsRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="pl-12 pr-32 h-12 text-base"
        />
        
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Recherche vocale */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceSearch}
            disabled={!isVoiceSupported}
            className={`absolute right-16 top-1/2 transform -translate-y-1/2 h-8 px-2 ${
              isVoiceSearching ? 'text-red-500 animate-pulse' : 'text-gray-400'
            }`}
          >
            <Zap className="h-4 w-4" />
          </Button>
          
          {/* Bouton clear */}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Bouton de recherche */}
          <Button 
            onClick={() => handleSearch()}
            disabled={!query.trim() || isLoading}
            className="h-8 px-3"
            size="sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Rechercher'
            )}
          </Button>
        </div>
      </div>

      {/* Dropdown des suggestions */}
      <AnimatePresence>
        {(query.trim() || autocompleteData.recent.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-auto"
          >
            {/* Recherches récentes */}
            {autocompleteData.recent.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Recherches récentes
                </div>
                {autocompleteData.recent.map((recent, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleSuggestionClick(recent.text)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                      selectedIndex === index ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{recent.text}</span>
                    {recent.resultCount && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {recent.resultCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions intelligentes */}
            {autocompleteData.suggestions.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Suggestions
                </div>
                {autocompleteData.suggestions.map((suggestion, index) => {
                  const globalIndex = index + autocompleteData.recent.length
                  return (
                    <button
                      key={`suggestion-${index}`}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        selectedIndex === globalIndex ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{suggestion.text}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
