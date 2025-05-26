"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface LoadingStateProps {
  isLoading: boolean
  children: ReactNode
  loadingComponent?: ReactNode
  className?: string
}

export function LoadingState({ isLoading, children, loadingComponent, className = "" }: LoadingStateProps) {
  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {loadingComponent || <DefaultLoader />}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Loader par défaut avec animation sophistiquée
export function DefaultLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        {/* Cercles animés */}
        <motion.div
          className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Pulse central */}
        <motion.div
          className="absolute inset-2 bg-primary/10 rounded-full"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  )
}

// Loader pour cartes avec skeleton
export function CardLoader() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="border rounded-lg p-6 bg-white shadow-sm"
        >
          <div className="flex items-start space-x-4">
            {/* Avatar skeleton */}
            <motion.div
              className="w-12 h-12 bg-gray-200 rounded-full"
              animate={{
                backgroundColor: ["#e5e7eb", "#f3f4f6", "#e5e7eb"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="flex-1 space-y-3">
              {/* Titre skeleton */}
              <motion.div
                className="h-4 bg-gray-200 rounded"
                style={{ width: `${60 + Math.random() * 40}%` }}
                animate={{
                  backgroundColor: ["#e5e7eb", "#f3f4f6", "#e5e7eb"]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
              
              {/* Description skeleton */}
              <div className="space-y-2">
                {[...Array(2)].map((_, j) => (
                  <motion.div
                    key={j}
                    className="h-3 bg-gray-200 rounded"
                    style={{ width: j === 1 ? "80%" : "100%" }}
                    animate={{
                      backgroundColor: ["#e5e7eb", "#f3f4f6", "#e5e7eb"]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4 + j * 0.1
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Loader pour listes avec stagger
export function ListLoader({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(items)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: i * 0.05,
            duration: 0.3
          }}
          className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
        >
          <motion.div
            className="w-8 h-8 bg-gray-200 rounded-full"
            animate={{
              backgroundColor: ["#e5e7eb", "#f3f4f6", "#e5e7eb"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
          
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-3 bg-gray-200 rounded"
              style={{ width: `${50 + Math.random() * 30}%` }}
              animate={{
                backgroundColor: ["#e5e7eb", "#f3f4f6", "#e5e7eb"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1 + 0.2
              }}
            />
            
            <motion.div
              className="h-2 bg-gray-200 rounded"
              style={{ width: `${30 + Math.random() * 20}%` }}
              animate={{
                backgroundColor: ["#e5e7eb", "#f3f4f6", "#e5e7eb"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1 + 0.4
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Loader pour grille d'éléments
export function GridLoader({ columns = 3, rows = 3 }: { columns?: number; rows?: number }) {
  return (
    <div 
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {[...Array(columns * rows)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: (i % columns) * 0.05 + Math.floor(i / columns) * 0.1,
            duration: 0.4,
            type: "spring"
          }}
          className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
        >
          <motion.div
            className="w-full h-full bg-gray-200"
            animate={{
              backgroundColor: ["#e5e7eb", "#f3f4f6", "#e5e7eb"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

// Progress loader avec étapes
interface ProgressLoaderProps {
  steps: string[]
  currentStep: number
  isLoading: boolean
}

export function ProgressLoader({ steps, currentStep, isLoading }: ProgressLoaderProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="space-y-6 py-8">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        <motion.div
          className="absolute -top-1 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"
          animate={{ left: `calc(${progress}% - 8px)` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Étapes */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index <= currentStep ? 1 : 0.5,
              x: 0
            }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                index < currentStep 
                  ? 'bg-green-500 border-green-500 text-white'
                  : index === currentStep
                  ? 'bg-primary border-primary text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
              animate={index === currentStep && isLoading ? {
                scale: [1, 1.1, 1],
                rotate: [0, 360, 720]
              } : {}}
              transition={{
                duration: 2,
                repeat: index === currentStep && isLoading ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {index < currentStep ? '✓' : index + 1}
            </motion.div>
            
            <span className={`text-sm ${
              index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}>
              {step}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Hook pour gérer les états de chargement multiples
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }))
  }

  const isLoading = (key: string) => loadingStates[key] || false
  
  const isAnyLoading = () => Object.values(loadingStates).some(Boolean)

  return { setLoading, isLoading, isAnyLoading }
}
