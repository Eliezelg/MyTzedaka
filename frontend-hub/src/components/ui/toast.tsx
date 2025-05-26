"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Undo } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive'
}

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
  action?: ToastAction
  onDismiss?: () => void
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const toastStyles = {
  success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100',
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100'
}

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [newToast, ...prev])

    // Auto remove after duration
    if (toast.duration !== 0) {
      const duration = toast.duration || 5000
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast()
  const Icon = toastIcons[toast.type]

  const handleDismiss = () => {
    toast.onDismiss?.()
    removeToast(toast.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      className={`
        relative p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${toastStyles[toast.type]}
      `}
    >
      {/* Progress bar pour la durée */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}

      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          <Icon className={`w-5 h-5 ${iconStyles[toast.type]} flex-shrink-0`} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="font-medium text-sm"
          >
            {toast.title}
          </motion.div>
          
          {toast.description && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm opacity-80 mt-1"
            >
              {toast.description}
            </motion.div>
          )}

          {toast.action && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-3"
            >
              <button
                onClick={toast.action.onClick}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium
                  transition-colors duration-200
                  ${toast.action.variant === 'destructive' 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                    : 'bg-white/80 text-current hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Undo className="w-3 h-3" />
                {toast.action.label}
              </button>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={handleDismiss}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-current/60 hover:text-current transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

// Hook helper pour des toasts prédéfinis
export function useToastHelpers() {
  const { addToast } = useToast()

  return {
    success: (title: string, description?: string, action?: ToastAction) =>
      addToast({ type: 'success', title, description, action }),
    
    error: (title: string, description?: string, action?: ToastAction) =>
      addToast({ type: 'error', title, description, action, duration: 7000 }),
    
    warning: (title: string, description?: string, action?: ToastAction) =>
      addToast({ type: 'warning', title, description, action }),
    
    info: (title: string, description?: string, action?: ToastAction) =>
      addToast({ type: 'info', title, description, action })
  }
}
