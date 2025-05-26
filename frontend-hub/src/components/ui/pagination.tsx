import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface PaginationProps {
  currentPage: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  siblingCount?: number
  className?: string
  totalPages: number
}

export function Pagination({
  currentPage,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  siblingCount = 1,
  className,
  totalPages
}: PaginationProps) {
  // Générer la liste des pages à afficher
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    
    // Toujours afficher la première page
    if (showFirstLast) {
      pages.push(1)
    }
    
    // Calculer la plage autour de la page actuelle
    const startPage = Math.max(1, currentPage - siblingCount)
    const endPage = Math.min(totalPages, currentPage + siblingCount)
    
    // Ajouter ellipsis si nécessaire avant la plage
    if (startPage > (showFirstLast ? 2 : 1)) {
      pages.push('ellipsis')
    }
    
    // Ajouter les pages dans la plage
    for (let i = startPage; i <= endPage; i++) {
      if (showFirstLast && i === 1) continue // Déjà ajoutée
      if (showFirstLast && i === totalPages) continue // Sera ajoutée plus tard
      pages.push(i)
    }
    
    // Ajouter ellipsis si nécessaire après la plage
    if (endPage < (showFirstLast ? totalPages - 1 : totalPages)) {
      pages.push('ellipsis')
    }
    
    // Toujours afficher la dernière page
    if (showFirstLast && totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
  }

  const pages = generatePageNumbers()

  if (totalPages <= 1) return null

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <div className="flex flex-row items-center gap-1">
        {/* Bouton Précédent */}
        {showPrevNext && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Aller à la page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Pages */}
        {pages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>
            )
          }

          const isActive = page === currentPage

          return (
            <Button
              key={page}
              variant={isActive ? "primary" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              aria-label={`Aller à la page ${page}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                isActive && "pointer-events-none"
              )}
            >
              {page}
            </Button>
          )
        })}

        {/* Bouton Suivant */}
        {showPrevNext && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Aller à la page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </nav>
  )
}

// Composant d'information de pagination
interface PaginationInfoProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  className?: string
}

export function PaginationInfo({
  currentPage,
  totalItems,
  itemsPerPage,
  className
}: PaginationInfoProps) {

  return (
    <motion.div
      key={`pagination-info-${currentPage}-${totalItems}`}
      className={cn("text-sm text-gray-700", className)}
    >
      Affichage de <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> à{' '}
      <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> sur{' '}
      <span className="font-medium">{totalItems}</span> résultats
    </motion.div>
  )
}
