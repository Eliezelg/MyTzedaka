import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function useUrlState<T extends Record<string, any>>(
  defaultState: T,
  stateKey?: string
): [T, (newState: Partial<T>) => void, () => void] {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<T>(defaultState)

  // Charger l'état depuis l'URL au montage
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString())
    const stateFromUrl: Partial<T> = {}

    Object.keys(defaultState).forEach(key => {
      const value = urlParams.get(key)
      if (value !== null) {
        // Convertir les valeurs selon le type attendu
        if (typeof defaultState[key] === 'boolean') {
          stateFromUrl[key as keyof T] = (value === 'true') as T[keyof T]
        } else if (typeof defaultState[key] === 'number') {
          const num = parseInt(value, 10)
          if (!isNaN(num)) {
            stateFromUrl[key as keyof T] = num as T[keyof T]
          }
        } else {
          stateFromUrl[key as keyof T] = value as T[keyof T]
        }
      }
    })

    // Charger aussi depuis localStorage si une clé est fournie
    if (stateKey) {
      try {
        const stored = localStorage.getItem(stateKey)
        if (stored) {
          const parsedStored = JSON.parse(stored)
          Object.assign(stateFromUrl, parsedStored)
        }
      } catch (error) {
        console.error('Erreur lors du chargement depuis localStorage:', error)
      }
    }

    setState(prevState => ({ ...prevState, ...stateFromUrl }))
  }, [searchParams, defaultState, stateKey])

  // Mettre à jour l'état et l'URL
  const updateState = useCallback((newState: Partial<T>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState }
      
      // Mettre à jour l'URL
      const urlParams = new URLSearchParams()
      Object.entries(updatedState).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Ne pas inclure les valeurs par défaut dans l'URL
          if (value !== defaultState[key as keyof T]) {
            urlParams.set(key, value.toString())
          }
        }
      })

      const newUrl = urlParams.toString() 
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname

      router.push(newUrl, { scroll: false })

      // Sauvegarder aussi dans localStorage si une clé est fournie
      if (stateKey) {
        try {
          localStorage.setItem(stateKey, JSON.stringify(updatedState))
        } catch (error) {
          console.error('Erreur lors de la sauvegarde dans localStorage:', error)
        }
      }

      return updatedState
    })
  }, [router, defaultState, stateKey])

  // Réinitialiser l'état
  const resetState = useCallback(() => {
    setState(defaultState)
    router.push(window.location.pathname, { scroll: false })
    
    if (stateKey) {
      try {
        localStorage.removeItem(stateKey)
      } catch (error) {
        console.error('Erreur lors de la suppression du localStorage:', error)
      }
    }
  }, [router, defaultState, stateKey])

  return [state, updateState, resetState]
}
