import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function parseValue(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function useUrlState<T extends Record<string, unknown>>(
  defaultState: T,
  stateKey?: string
): [T, (newState: Partial<T>) => void, () => void] {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Stabiliser defaultState pour éviter les re-renders infinis
  const stableDefaultState = useMemo(() => defaultState, [])
  const [state, setState] = useState<T>(stableDefaultState)

  // Charger l'état depuis l'URL au montage
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString())
    const stateFromUrl: Partial<T> = {}

    Object.keys(stableDefaultState).forEach(key => {
      const value = urlParams.get(key)
      if (value !== null) {
        // Convertir les valeurs selon le type attendu
        if (typeof stableDefaultState[key] === 'boolean') {
          stateFromUrl[key as keyof T] = (value === 'true') as T[keyof T]
        } else if (typeof stableDefaultState[key] === 'number') {
          stateFromUrl[key as keyof T] = (Number(value) || 0) as T[keyof T]
        } else {
          stateFromUrl[key as keyof T] = parseValue(value) as T[keyof T]
        }
      }
    })

    // Charger aussi depuis localStorage si une clé est fournie
    if (stateKey) {
      try {
        const stored = localStorage.getItem(stateKey)
        if (stored) {
          const parsedStored = parseValue(stored)
          Object.assign(stateFromUrl, parsedStored)
        }
      } catch (error) {
        console.error('Erreur lors du chargement depuis localStorage:', error)
      }
    }

    setState(prevState => ({ ...prevState, ...stateFromUrl }))
  }, [searchParams, stateKey]) // Retirer defaultState des dépendances

  // Mettre à jour l'état et l'URL
  const updateState = useCallback((newState: Partial<T>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState }
      
      // Mettre à jour l'URL
      const urlParams = new URLSearchParams()
      Object.entries(updatedState).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Ne pas inclure les valeurs par défaut dans l'URL
          if (value !== stableDefaultState[key as keyof T]) {
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
  }, [router, stableDefaultState, stateKey])

  // Réinitialiser l'état
  const resetState = useCallback(() => {
    setState(stableDefaultState)
    router.push(window.location.pathname, { scroll: false })
    
    if (stateKey) {
      try {
        localStorage.removeItem(stateKey)
      } catch (error) {
        console.error('Erreur lors de la suppression du localStorage:', error)
      }
    }
  }, [router, stableDefaultState, stateKey])

  return [state, updateState, resetState]
}
