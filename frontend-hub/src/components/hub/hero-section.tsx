'use client'

import { motion } from 'framer-motion'
import { Search, ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface HeroSectionProps {
  onSearchClick?: () => void
  onExploreClick?: () => void
}

export function HeroSection({ onSearchClick, onExploreClick }: HeroSectionProps) {
  const t = useTranslations('index')
  
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary-200/30 to-transparent"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-secondary-200/30 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge d'introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-primary-200/50"
          >
            <Heart className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-gray-700">
              {t('hero.badge')}
            </span>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            {t('hero.title')}
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="xl" 
              className="group min-w-[200px]"
              onClick={onSearchClick}
            >
              <Search className="w-5 h-5 mr-2" />
              {t('hero.searchButton')}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="xl" 
              className="group min-w-[200px] bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white"
              onClick={onExploreClick}
            >
              {t('hero.exploreButton')}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Statistiques rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">100+</div>
              <div className="text-sm text-gray-600">{t('stats.associationsVerified')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-600 mb-1">50k€</div>
              <div className="text-sm text-gray-600">{t('stats.raisedThisMonth')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-600 mb-1">1000+</div>
              <div className="text-sm text-gray-600">{t('stats.activeDonors')}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
