"use client"

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { ReactNode, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from './card'
import Image from 'next/image'

interface EnhancedCardProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
  enableHover?: boolean
  enableTilt?: boolean
}

export function EnhancedCard({ 
  children, 
  className = "", 
  href, 
  onClick,
  enableHover = true,
  enableTilt = false
}: EnhancedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Motion values pour l'effet de tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Transform les valeurs de mouvement en rotation
  const rotateX = useTransform(y, [-100, 100], [5, -5])
  const rotateY = useTransform(x, [-100, 100], [-5, 5])
  
  // Spring animation pour un mouvement fluide
  const springConfig = { stiffness: 300, damping: 30 }
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
    if (!enableTilt) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = event.clientX - centerX
    const mouseY = event.clientY - centerY
    
    x.set(mouseX)
    y.set(mouseY)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (enableTilt) {
      x.set(0)
      y.set(0)
    }
  }

  const cardVariants = {
    initial: { 
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    hover: { 
      scale: enableHover ? 1.02 : 1,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  }

  const Component = href ? motion.a : motion.div

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`cursor-pointer ${className}`}
      style={enableTilt ? {
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: "preserve-3d"
      } : {}}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="relative overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-200">
        {/* Gradient overlay qui apparaît au hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          animate={{
            x: isHovered ? "200%" : "-100%"
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
        />
        
        {children}
      </Card>
    </Component>
  )
}

// Enhanced Association Card avec animations
interface EnhancedAssociationCardProps {
  association: {
    id: string
    name: string
    description: string
    category: string
    location: string
    isVerified: boolean
    donationsCount: number
    totalRaised: number
    image?: string
  }
  className?: string
}

export function EnhancedAssociationCard({ association, className = "" }: EnhancedAssociationCardProps) {
  return (
    <EnhancedCard className={className} enableHover enableTilt href={`/associations/${association.id}`}>
      <CardHeader className="relative">
        {association.image && (
          <motion.div
            className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg mb-4 overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Image 
              src={association.image} 
              alt={association.name}
              width={300}
              height={200}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
        
        <div className="flex items-start justify-between">
          <motion.h3 
            className="font-semibold text-lg text-gray-900 dark:text-white"
            layoutId={`title-${association.id}`}
          >
            {association.name}
          </motion.h3>
          
          {association.isVerified && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
            >
              Vérifié ✓
            </motion.div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
          {association.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {association.category}
          </span>
          <span>{association.location}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between w-full text-sm">
          <motion.div
            className="text-gray-600 dark:text-gray-300"
            whileHover={{ scale: 1.05 }}
          >
            {association.donationsCount} donateurs
          </motion.div>
          <motion.div
            className="font-semibold text-primary"
            whileHover={{ scale: 1.1 }}
          >
            {association.totalRaised.toLocaleString()}€ collectés
          </motion.div>
        </div>
      </CardFooter>
    </EnhancedCard>
  )
}
