import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: 'primary' | 'accent' | 'secondary' | 'orange'
  format?: 'number' | 'currency' | 'none'
  currency?: string
  delay?: number
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-100',
    icon: 'text-primary-600',
  },
  accent: {
    bg: 'bg-accent-100',
    icon: 'text-accent-600',
  },
  secondary: {
    bg: 'bg-secondary-100',
    icon: 'text-secondary-600',
  },
  orange: {
    bg: 'bg-orange-100',
    icon: 'text-orange-600',
  },
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary',
  format = 'number',
  currency = 'EUR',
  delay = 0 
}: StatCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return formatCurrency(val, currency)
      case 'number':
        return formatNumber(val)
      default:
        return val.toString()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <Card className="text-center p-6 hover:shadow-medium transition-shadow duration-300">
        <div className={`w-16 h-16 ${colorClasses[color].bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`w-8 h-8 ${colorClasses[color].icon}`} />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {formatValue(value)}
        </div>
        <div className="text-gray-600 font-medium">
          {title}
        </div>
      </Card>
    </motion.div>
  )
}
