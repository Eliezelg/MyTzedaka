import { motion } from 'framer-motion'
import { Calendar, Target, Users, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Campaign } from '@/types/hub'
import { formatCurrency, formatDate, truncateText, calculateProgress } from '@/lib/utils'

interface CampaignCardProps {
  campaign: Campaign & {
    raised?: number
    donorCount?: number
  }
  index?: number
  onClick?: (campaign: Campaign) => void
}

const statusColors = {
  DRAFT: 'secondary',
  ACTIVE: 'success',
  PAUSED: 'warning',
  COMPLETED: 'accent',
  CANCELLED: 'destructive'
} as const

const statusLabels = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Active',
  PAUSED: 'En pause',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée'
} as const

export function CampaignCard({ campaign, index = 0, onClick }: CampaignCardProps) {
  const raised = campaign.raised || 0
  const donorCount = campaign.donorCount || campaign._count?.donations || 0
  const progress = calculateProgress(raised, campaign.goal)
  const isActive = campaign.status === 'ACTIVE'
  const endDate = new Date(campaign.endDate)
  const isExpired = endDate < new Date()

  const handleClick = () => {
    onClick?.(campaign)
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
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <Badge variant={statusColors[campaign.status]}>
              {statusLabels[campaign.status]}
            </Badge>
            {campaign.tenant && (
              <span className="text-xs text-gray-500 font-medium">
                {campaign.tenant.name}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {campaign.title}
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {truncateText(campaign.description, 100)}
          </p>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Progression */}
          <div>
            <Progress 
              value={raised} 
              max={campaign.goal} 
              variant="accent"
              showLabel
              label={`${progress.toFixed(0)}% collecté`}
            />
          </div>

          {/* Montants */}
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(raised, campaign.currency)}
              </span>
              <span className="text-gray-500 ml-1">
                / {formatCurrency(campaign.goal, campaign.currency)}
              </span>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-2" />
              {donorCount} donateur{donorCount > 1 ? 's' : ''}
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {isExpired ? 'Expirée' : `Fin ${formatDate(campaign.endDate)}`}
            </div>
          </div>

          {/* Objectif */}
          <div className="flex items-center text-gray-600 text-sm">
            <Target className="w-4 h-4 mr-2" />
            Objectif: {formatCurrency(campaign.goal, campaign.currency)}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          {isActive && !isExpired ? (
            <Button 
              variant="primary" 
              className="w-full group"
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
            >
              Faire un don
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full group"
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
            >
              Voir détails
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
