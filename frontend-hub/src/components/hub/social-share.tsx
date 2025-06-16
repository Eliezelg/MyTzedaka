'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy, 
  Check,
  Mail,
  MessageCircle,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  hashtags?: string[]
  via?: string
  className?: string
  variant?: 'buttons' | 'modal' | 'dropdown'
}

export function SocialShare({
  url,
  title,
  description = '',
  hashtags = [],
  via = '',
  className = '',
  variant = 'buttons'
}: SocialShareProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)
  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ')

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: 'Partager sur Facebook'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${via ? `&via=${via}` : ''}${hashtagString ? `&hashtags=${hashtagString.replace(/#/g, '')}` : ''}`,
      label: 'Partager sur Twitter'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      label: 'Partager sur LinkedIn'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      label: 'Partager sur WhatsApp'
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      label: 'Partager par email'
    }
  ]

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        })
      } catch (error) {
        console.log('Erreur partage natif:', error)
        // Fallback vers la modal
        setIsModalOpen(true)
      }
    } else {
      setIsModalOpen(true)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Erreur copie:', error)
    }
  }

  const openSocialLink = (platformUrl: string) => {
    window.open(platformUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {socialPlatforms.slice(0, 3).map((platform) => {
          const Icon = platform.icon
          return (
            <Button
              key={platform.name}
              variant="outline"
              size="sm"
              onClick={() => openSocialLink(platform.url)}
              className="flex-1"
            >
              <Icon className="w-4 h-4 mr-2" />
              {platform.name}
            </Button>
          )
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
        >
          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Share2 className="w-4 h-4 mr-2" />
          {t('share')}
        </Button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              <div className="p-2">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <button
                      key={platform.name}
                      onClick={() => {
                        openSocialLink(platform.url)
                        setIsDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {platform.label}
                    </button>
                  )
                })}
                <hr className="my-2" />
                <button
                  onClick={() => {
                    copyToClipboard()
                    setIsDropdownOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                >
                  {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'Copié !' : 'Copier le lien'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay pour fermer le dropdown */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        {t('share')}
      </Button>

      {/* Modal de partage */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Partager</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Aperçu du contenu */}
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-medium mb-2 line-clamp-2">{title}</h4>
                  {description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
                  )}
                  <div className="text-xs text-blue-600 mt-2 truncate">{url}</div>
                </Card>

                {/* Boutons de partage */}
                <div className="grid grid-cols-2 gap-3">
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon
                    return (
                      <Button
                        key={platform.name}
                        variant="outline"
                        onClick={() => openSocialLink(platform.url)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {platform.name}
                      </Button>
                    )
                  })}
                </div>

                {/* Copier le lien */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                {isCopied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 text-sm text-center"
                  >
                    Lien copié dans le presse-papiers !
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Bouton de partage rapide
export function QuickShareButton({ 
  url, 
  title, 
  className = '' 
}: { 
  url: string
  title: string
  className?: string 
}) {
  const handleQuickShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch (error) {
        console.log('Erreur partage:', error)
      }
    } else {
      // Fallback: copier l'URL
      try {
        await navigator.clipboard.writeText(url)
        // TODO: Afficher toast de confirmation
      } catch (error) {
        console.error('Erreur copie:', error)
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleQuickShare}
      className={className}
    >
      <Share2 className="w-4 h-4" />
    </Button>
  )
}
