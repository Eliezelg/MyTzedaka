'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  Heart, 
  Target, 
  Calendar,
  Award,
  BarChart3,
  PieChart,
  Lightbulb,
  CheckCircle
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatNumber } from '@/utils/format'

interface ImpactData {
  totalRaised: number
  totalDonors: number
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  avgDonation: number
  conversionRate: number
  retention: number
  socialImpact: {
    beneficiaries: number
    projects: number
    communities: number
  }
  monthlyGrowth: {
    donations: number
    donors: number
    campaigns: number
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    date: string
    type: 'milestone' | 'award' | 'recognition'
  }>
  goals: Array<{
    id: string
    title: string
    current: number
    target: number
    unit: string
    deadline?: string
  }>
}

interface ImpactMetricsProps {
  targetId: string
  targetType: 'association' | 'campaign'
  data?: ImpactData
  variant?: 'full' | 'compact' | 'summary'
  className?: string
  showGrowth?: boolean
  showGoals?: boolean
  showAchievements?: boolean
}

export function ImpactMetrics({
  targetId,
  targetType,
  data,
  variant = 'full',
  className = '',
  showGrowth = true,
  showGoals = true,
  showAchievements = true
}: ImpactMetricsProps) {
  const [impactData, setImpactData] = useState<ImpactData | null>(data || null)
  const [isLoading, setIsLoading] = useState(!data)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  useEffect(() => {
    if (!data) {
      // Simuler le chargement des données d'impact
      const loadImpactData = async () => {
        setIsLoading(true)
        // TODO: Remplacer par un vrai appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setImpactData(mockImpactData)
        setIsLoading(false)
      }

      loadImpactData()
    }
  }, [targetId, targetType, data])

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="h-8 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!impactData) {
    return null
  }

  const primaryMetrics = [
    {
      id: 'raised',
      label: 'Total collecté',
      value: formatCurrency(impactData.totalRaised, 'EUR'),
      growth: impactData.monthlyGrowth.donations,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'donors',
      label: 'Donateurs',
      value: formatNumber(impactData.totalDonors),
      growth: impactData.monthlyGrowth.donors,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'campaigns',
      label: 'Campagnes',
      value: formatNumber(impactData.totalCampaigns),
      growth: impactData.monthlyGrowth.campaigns,
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'avg',
      label: 'Don moyen',
      value: formatCurrency(impactData.avgDonation, 'EUR'),
      growth: 5.2,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  if (variant === 'compact') {
    return (
      <Card className={`p-4 ${className}`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Impact
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {primaryMetrics.slice(0, 2).map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.id} className="text-center">
                <div className={`w-12 h-12 rounded-full ${metric.bgColor} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className="font-bold text-lg">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            )
          })}
        </div>
      </Card>
    )
  }

  if (variant === 'summary') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {primaryMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.id} className="p-4 text-center">
              <Icon className={`w-8 h-8 ${metric.color} mx-auto mb-2`} />
              <div className="font-bold text-xl">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
              {showGrowth && metric.growth && (
                <div className={`text-xs mt-1 ${metric.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.growth > 0 ? '+' : ''}{metric.growth}% ce mois
                </div>
              )}
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métriques principales */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Métriques d'impact
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {primaryMetrics.map((metric) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.id}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
              >
                <div className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedMetric === metric.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                    {showGrowth && metric.growth && (
                      <Badge 
                        variant={metric.growth > 0 ? 'default' : 'secondary'}
                        className={`text-xs ${metric.growth > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}
                      >
                        {metric.growth > 0 ? '+' : ''}{metric.growth}%
                      </Badge>
                    )}
                  </div>
                  
                  <div className="font-bold text-2xl mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>

      {/* Impact social */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Impact social
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-red-500" />
            </div>
            <div className="font-bold text-xl text-red-600">
              {formatNumber(impactData.socialImpact.beneficiaries)}
            </div>
            <div className="text-sm text-gray-600">Bénéficiaires aidés</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-8 h-8 text-green-500" />
            </div>
            <div className="font-bold text-xl text-green-600">
              {formatNumber(impactData.socialImpact.projects)}
            </div>
            <div className="text-sm text-gray-600">Projets réalisés</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-purple-500" />
            </div>
            <div className="font-bold text-xl text-purple-600">
              {formatNumber(impactData.socialImpact.communities)}
            </div>
            <div className="text-sm text-gray-600">Communautés touchées</div>
          </div>
        </div>
      </Card>

      {/* Objectifs et progression */}
      {showGoals && impactData.goals.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Objectifs en cours
          </h4>
          
          <div className="space-y-4">
            {impactData.goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-gray-600">
                      {formatNumber(goal.current)} / {formatNumber(goal.target)} {goal.unit}
                    </span>
                  </div>
                  
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{progress.toFixed(1)}% atteint</span>
                    {goal.deadline && (
                      <span>Échéance: {new Date(goal.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Réalisations et récompenses */}
      {showAchievements && impactData.achievements.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Réalisations
          </h4>
          
          <div className="space-y-4">
            {impactData.achievements.map((achievement) => {
              const getTypeIcon = () => {
                switch (achievement.type) {
                  case 'milestone': return TrendingUp
                  case 'award': return Award
                  case 'recognition': return CheckCircle
                  default: return CheckCircle
                }
              }
              
              const TypeIcon = getTypeIcon()
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{achievement.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{achievement.description}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(achievement.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="capitalize">
                    {achievement.type}
                  </Badge>
                </motion.div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Métriques détaillées */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-500" />
          Performance détaillée
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-lg">{impactData.conversionRate}%</div>
            <div className="text-sm text-gray-600">Taux de conversion</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-lg">{impactData.retention}%</div>
            <div className="text-sm text-gray-600">Fidélisation</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-lg">{impactData.activeCampaigns}</div>
            <div className="text-sm text-gray-600">Campagnes actives</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-lg">{impactData.completedCampaigns}</div>
            <div className="text-sm text-gray-600">Campagnes terminées</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Données mock pour les tests
const mockImpactData: ImpactData = {
  totalRaised: 127500,
  totalDonors: 342,
  totalCampaigns: 15,
  activeCampaigns: 4,
  completedCampaigns: 11,
  avgDonation: 78.50,
  conversionRate: 12.5,
  retention: 67,
  socialImpact: {
    beneficiaries: 850,
    projects: 23,
    communities: 5
  },
  monthlyGrowth: {
    donations: 15.3,
    donors: 8.7,
    campaigns: 2.1
  },
  achievements: [
    {
      id: '1',
      title: 'Objectif 100k€ atteint',
      description: 'Premier cap de collecte franchi avec succès',
      icon: 'milestone',
      date: '2024-04-15T10:00:00Z',
      type: 'milestone'
    },
    {
      id: '2',
      title: 'Prix de l\'association de l\'année',
      description: 'Reconnu par la ville pour son impact communautaire',
      icon: 'award',
      date: '2024-03-20T10:00:00Z',
      type: 'award'
    },
    {
      id: '3',
      title: 'Partenariat officiel établi',
      description: 'Reconnaissance institutionnelle de nos actions',
      icon: 'recognition',
      date: '2024-02-10T10:00:00Z',
      type: 'recognition'
    }
  ],
  goals: [
    {
      id: '1',
      title: 'Objectif annuel de collecte',
      current: 127500,
      target: 200000,
      unit: '€',
      deadline: '2024-12-31T23:59:59Z'
    },
    {
      id: '2',
      title: 'Nombre de donateurs',
      current: 342,
      target: 500,
      unit: 'donateurs',
      deadline: '2024-12-31T23:59:59Z'
    },
    {
      id: '3',
      title: 'Bénéficiaires aidés',
      current: 850,
      target: 1000,
      unit: 'personnes',
      deadline: '2024-12-31T23:59:59Z'
    }
  ]
}
