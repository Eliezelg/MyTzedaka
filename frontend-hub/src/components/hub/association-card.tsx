import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, MapPin, Building } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Association } from '@/types/hub'
import { truncateText } from '@/lib/utils'

interface AssociationCardProps {
  association: Association
  index?: number
  onClick?: (association: Association) => void
}

export function AssociationCard({ association, index = 0, onClick }: AssociationCardProps) {
  const handleClick = () => {
    onClick?.(association)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card 
        hover 
        shadow="soft" 
        className="h-full flex flex-col cursor-pointer"
        onClick={handleClick}
      >
        {/* Image ou placeholder */}
        <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
          {association.coverImage ? (
            <img 
              src={association.coverImage} 
              alt={association.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building className="w-16 h-16 text-primary-300" />
            </div>
          )}
          
          {/* Badges sur l'image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="accent">
              {association.category}
            </Badge>
            {association.isVerified && (
              <Badge variant="verified" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Vérifiée
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="flex-1 p-6">
          <div className="space-y-4">
            {/* Nom et description */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                {association.name}
                {association.isVerified && (
                  <CheckCircle className="ml-2 w-5 h-5 text-accent-500" />
                )}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {truncateText(association.description, 120)}
              </p>
            </div>

            {/* Localisation */}
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              {association.location}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {association.activeCampaigns}
                </div>
                <div className="text-xs text-gray-500">
                  Campagne{association.activeCampaigns > 1 ? 's' : ''} active{association.activeCampaigns > 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-600">
                  {association.totalCampaigns}
                </div>
                <div className="text-xs text-gray-500">
                  Total campagnes
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button 
            variant="outline" 
            className="w-full group"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            Découvrir
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
