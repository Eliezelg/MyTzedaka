'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp, Filter as FilterIcon, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchService, AutocompleteResponse } from '@/lib/search-service'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string, type?: 'association' | 'campaign' | 'all') => void
  onClear?: () => void
  defaultValue?: string
  suggestions?: string[]
  className?: string
  searchType?: 'association' | 'campaign' | 'all'
  onSearchTypeChange?: (type: 'association' | 'campaign' | 'all') => void
  showTypeSelector?: boolean
  showVoiceSearch?: boolean
}

export function SearchBar({ 
  placeholder = "Rechercher une association, une campagne...", 
  onSearch, 
  onClear,
  defaultValue = "",
  searchType = 'all',
  onSearchTypeChange,
  showTypeSelector = true,
  showVoiceSearch = false,
  className 
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [autocompleteData, setAutocompleteData] = useState<AutocompleteResponse>({ suggestions: [], recent: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isVoiceSearching, setIsVoiceSearching] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  const { addSearchToHistory, getRecentSuggestions } = useSearchHistory()
  const debouncedQuery = useDebounce(query, 300)

  // Charger les suggestions en temps réel
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      loadAutocompleteSuggestions(debouncedQuery)
    } else {
      setAutocompleteData({
        suggestions: [],
        recent: getRecentSuggestions(5)
      })
    }
  }, [debouncedQuery])

  const loadAutocompleteSuggestions = async (searchQuery: string) => {
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
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    if (value.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSearch = useCallback((searchQuery: string = query, type: typeof searchType = searchType) => {
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      // Ajouter à l'historique
      addSearchToHistory(trimmedQuery, type === 'all' ? 'general' : type)
      
      // Effectuer la recherche
      onSearch?.(trimmedQuery, type)
      setShowSuggestions(false)
      setSelectedIndex(-1)
      
      // Déselectionner l'input
      inputRef.current?.blur()
    }
  }, [query, searchType, onSearch, addSearchToHistory])

  const handleClear = () => {
    setQuery("")
    setShowSuggestions(false)
    setSelectedIndex(-1)
    onClear?.()
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: string, type?: 'association' | 'campaign') => {
    setQuery(suggestion)
    setShowSuggestions(false)
    
    // Déterminer le type de recherche
    const finalType = type || searchType
    handleSearch(suggestion, finalType)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const suggestions = [
      ...autocompleteData.recent.map(r => ({ text: r.text, type: r.type })),
      ...autocompleteData.suggestions.map(s => ({ text: s.text, type: s.type }))
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
      setShowSuggestions(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  // Recherche vocale (Web Speech API)
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('La recherche vocale n\'est pas supportée sur votre navigateur')
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false

    setIsVoiceSearching(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      handleSearch(transcript)
    }

    recognition.onerror = (event) => {
      console.error('Erreur de reconnaissance vocale:', event.error)
      setIsVoiceSearching(false)
    }

    recognition.onend = () => {
      setIsVoiceSearching(false)
    }

    recognition.start()
  }

  const handleTypeChange = (type: 'association' | 'campaign' | 'all') => {
    onSearchTypeChange?.(type)
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
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allSuggestions = [
    ...autocompleteData.recent.map((r, i) => ({ 
      ...r, 
      isRecent: true, 
      index: i 
    })),
    ...autocompleteData.suggestions.map((s, i) => ({ 
      ...s, 
      isRecent: false, 
      index: i + autocompleteData.recent.length 
    }))
  ]

  return (
    <div className={`relative w-full max-w-2xl ${className}`} ref={suggestionsRef}>
      {/* Sélecteur de type de recherche */}
      {showTypeSelector && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">Rechercher :</span>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'Tout', icon: Search },
              { key: 'association', label: 'Associations', icon: FilterIcon },
              { key: 'campaign', label: 'Campagnes', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={searchType === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTypeChange(key as any)}
                className="flex items-center gap-1"
              >
                <Icon className="w-3 h-3" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => {
            if (query.trim() || autocompleteData.recent.length > 0) {
              setShowSuggestions(true)
            }
          }}
          className="pl-12 pr-32 h-12 text-base"
        />
        
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Recherche vocale */}
          {showVoiceSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              disabled={isVoiceSearching}
              className={`h-8 w-8 p-1 ${isVoiceSearching ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Zap className="h-4 w-4" />
            </Button>
          )}
          
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
        {showSuggestions && (query.trim() || autocompleteData.recent.length > 0) && (
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
                      onClick={() => handleSuggestionClick(suggestion.text, suggestion.type as any)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        selectedIndex === globalIndex ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{suggestion.text}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge 
                          variant={suggestion.type === 'campaign' ? 'accent' : 'outline'} 
                          className="text-xs"
                        >
                          {suggestion.type === 'association' ? 'Assoc' : 'Camp'}
                        </Badge>
                        {suggestion.count && (
                          <Badge variant="outline" className="text-xs">
                            {suggestion.count}
                          </Badge>
                        )}
                      </div>
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
