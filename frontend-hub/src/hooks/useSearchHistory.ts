import { useState, useEffect } from 'react'

export interface SearchHistoryItem {
  id: string
  text: string
  timestamp: number
  type: 'association' | 'campaign' | 'general'
  resultCount?: number
}

const STORAGE_KEY = 'hub-search-history'
const MAX_HISTORY_ITEMS = 10

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  // Charger l'historique depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(parsed)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique de recherche:', error)
    }
  }, [])

  // Ajouter une recherche à l'historique
  const addSearchToHistory = (query: string, type: SearchHistoryItem['type'] = 'general', resultCount?: number) => {
    if (!query.trim()) return

    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      text: query.trim(),
      timestamp: Date.now(),
      type,
      resultCount
    }

    const updatedHistory = [
      newItem,
      ...history.filter(item => item.text.toLowerCase() !== query.toLowerCase())
    ].slice(0, MAX_HISTORY_ITEMS)

    setHistory(updatedHistory)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
  }

  // Supprimer une recherche de l'historique
  const removeSearchFromHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
  }

  // Vider l'historique
  const clearSearchHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  // Obtenir les suggestions récentes
  const getRecentSuggestions = (limit: number = 5): SearchHistoryItem[] => {
    return history
      .slice(0, limit)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  return {
    history,
    addSearchToHistory,
    removeSearchFromHistory,
    clearSearchHistory,
    getRecentSuggestions
  }
}
