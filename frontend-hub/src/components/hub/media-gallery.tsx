'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface MediaItem {
  id: string
  url: string
  alt: string
  type: 'image' | 'video'
  caption?: string
}

interface MediaGalleryProps {
  items: MediaItem[]
  className?: string
}

export function MediaGallery({ items, className = '' }: MediaGalleryProps) {
  const t = useTranslations('components.media')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setSelectedIndex(null)
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (selectedIndex === null) return
    
    if (direction === 'prev') {
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : items.length - 1)
    } else {
      setSelectedIndex(selectedIndex < items.length - 1 ? selectedIndex + 1 : 0)
    }
  }

  if (items.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{t('empty')}</p>
      </div>
    )
  }

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className="aspect-square relative cursor-pointer group rounded-lg overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => openLightbox(index)}
          >
            <Image
              src={item.url}
              alt={item.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            {item.type === 'video' && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {t('videos')}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Bouton fermer */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation précédent */}
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  navigateLightbox('prev')
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {/* Navigation suivant */}
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  navigateLightbox('next')
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}

            {/* Image principale */}
            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={items[selectedIndex].url}
                alt={items[selectedIndex].alt}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain"
              />
              
              {/* Légende */}
              {items[selectedIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                  <p className="text-center">{items[selectedIndex].caption}</p>
                </div>
              )}
            </motion.div>

            {/* Indicateurs */}
            {items.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {items.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedIndex(index)
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Composant simplifié pour un aperçu rapide
export function MediaGalleryPreview({ items, maxItems = 6 }: { items: MediaItem[], maxItems?: number }) {
  const displayItems = items.slice(0, maxItems)
  const remainingCount = items.length - maxItems

  return (
    <div className="grid grid-cols-3 gap-2">
      {displayItems.map((item, index) => (
        <div key={item.id} className="aspect-square relative">
          <Image
            src={item.url}
            alt={item.alt}
            fill
            className="object-cover rounded"
          />
          {index === maxItems - 1 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
              <span className="text-white font-semibold">+{remainingCount}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
