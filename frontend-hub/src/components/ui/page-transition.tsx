"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants = {
  initial: { 
    opacity: 0, 
    x: -20,
    scale: 0.98
  },
  in: { 
    opacity: 1, 
    x: 0,
    scale: 1
  },
  out: { 
    opacity: 0, 
    x: 20,
    scale: 1.02
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Container pour les listes avec stagger animations
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function StaggerContainer({ children, className = "", delay = 0.1 }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
            delayChildren: 0.2
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Item pour les animations stagger
interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { 
          opacity: 0, 
          y: 20,
          scale: 0.95
        },
        visible: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}
