'use client'

import { Fragment } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  separator?: React.ReactNode
}

export function Breadcrumbs({ 
  items, 
  className = '',
  showHome = true,
  separator
}: BreadcrumbsProps) {
  const allItems = showHome 
    ? [{ label: 'Accueil', href: '/', icon: Home }, ...items]
    : items

  const defaultSeparator = <ChevronRight className="w-4 h-4 text-gray-400" />

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm ${className}`}>
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1
        const Icon = item.icon

        return (
          <Fragment key={index}>
            {index > 0 && (separator || defaultSeparator)}
            
            <div className="flex items-center">
              {Icon && <Icon className="w-4 h-4 mr-1" />}
              
              {item.href && !isLast ? (
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                  {item.label}
                </span>
              )}
            </div>
          </Fragment>
        )
      })}
    </nav>
  )
}