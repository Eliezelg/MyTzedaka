'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DownloadIcon, CalendarIcon, BuildingIcon, EuroIcon } from 'lucide-react'
import { taxReceiptsService, TaxReceipt, TaxReceiptsByYear } from '@/services/tax-receipts-service'
import { formatCurrency } from '@/lib/utils/currency'

interface TaxReceiptsListProps {
  mode: 'donor' | 'tenant'
  tenantId?: string
  showYearlyView?: boolean
  limit?: number
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'GENERATED':
      return 'bg-green-100 text-green-800'
    case 'SENT':
      return 'bg-blue-100 text-blue-800'
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'GENERATED':
      return 'Généré'
    case 'SENT':
      return 'Envoyé'
    case 'DRAFT':
      return 'Brouillon'
    default:
      return status
  }
}

export function TaxReceiptsList({ mode, tenantId, showYearlyView = false, limit }: TaxReceiptsListProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())

  // Query pour les reçus par année (vue donateur)
  const { data: receiptsByYear, isLoading: isLoadingByYear } = useQuery({
    queryKey: ['tax-receipts-by-year', tenantId],
    queryFn: () => taxReceiptsService.getDonorTaxReceiptsByYear(tenantId),
    enabled: mode === 'donor' && showYearlyView,
  })

  // Query pour les reçus individuels
  const { data: receiptsData, isLoading: isLoadingReceipts } = useQuery({
    queryKey: ['tax-receipts', mode, tenantId, selectedYear, limit],
    queryFn: () => {
      if (mode === 'donor') {
        return taxReceiptsService.getDonorTaxReceipts({
          year: selectedYear,
          tenantId,
          limit,
        })
      } else if (mode === 'tenant' && tenantId) {
        return taxReceiptsService.getTenantTaxReceipts(tenantId, {
          startDate: `${selectedYear}-01-01`,
          endDate: `${selectedYear}-12-31`,
        }).then(receipts => ({ receipts, total: receipts.length }))
      }
      return { receipts: [], total: 0 }
    },
    enabled: !showYearlyView,
  })

  const handleDownload = async (receipt: TaxReceipt) => {
    if (!receipt.tenant?.id || downloadingIds.has(receipt.id)) return

    setDownloadingIds(prev => new Set(prev).add(receipt.id))

    try {
      const fileName = `recu-fiscal-${receipt.receiptNumber}.pdf`
      await taxReceiptsService.downloadAndSaveReceipt(receipt.tenant.id, receipt.id, fileName)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      // TODO: Afficher une notification d'erreur
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(receipt.id)
        return newSet
      })
    }
  }

  if (showYearlyView && receiptsByYear) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Mes reçus fiscaux par année</h3>
        </div>

        {receiptsByYear.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                Aucun reçu fiscal trouvé
              </p>
            </CardContent>
          </Card>
        ) : (
          receiptsByYear.map((yearData: TaxReceiptsByYear) => (
            <Card key={yearData.year}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Année {yearData.year}</span>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{yearData.count} reçu{yearData.count > 1 ? 's' : ''}</span>
                    <span className="font-semibold">
                      Total: {formatCurrency(yearData.totalAmount)}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {yearData.receipts.map((receipt: TaxReceipt) => (
                    <div
                      key={receipt.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusBadgeColor(receipt.status)}>
                            {getStatusLabel(receipt.status)}
                          </Badge>
                          <span className="font-medium">{receipt.receiptNumber}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <BuildingIcon className="h-4 w-4" />
                            <span>{receipt.associationName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <EuroIcon className="h-4 w-4" />
                            <span>{formatCurrency(receipt.donationAmount)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{new Date(receipt.donationDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(receipt)}
                        disabled={!receipt.pdfPath || downloadingIds.has(receipt.id)}
                      >
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        {downloadingIds.has(receipt.id) ? 'Téléchargement...' : 'PDF'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  const receipts = receiptsData?.receipts || []
  const isLoading = isLoadingReceipts || isLoadingByYear

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {mode === 'donor' ? 'Mes reçus fiscaux' : 'Reçus fiscaux émis'}
        </h3>
        
        {/* Sélecteur d'année */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {receipts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              Aucun reçu fiscal trouvé pour {selectedYear}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {receipts.map((receipt) => (
            <Card key={receipt.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge className={getStatusBadgeColor(receipt.status)}>
                        {getStatusLabel(receipt.status)}
                      </Badge>
                      <span className="font-semibold text-lg">{receipt.receiptNumber}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Association:</span>
                        <p className="font-medium">{receipt.associationName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Montant:</span>
                        <p className="font-medium">{formatCurrency(receipt.donationAmount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date du don:</span>
                        <p className="font-medium">{new Date(receipt.donationDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Reçu émis:</span>
                        <p className="font-medium">{new Date(receipt.issueDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {mode === 'donor' && receipt.donation?.campaign && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Campagne:</span>
                        <p className="font-medium">{receipt.donation.campaign.title}</p>
                      </div>
                    )}

                    {mode === 'tenant' && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Donateur:</span>
                        <p className="font-medium">{receipt.donorName}</p>
                        <p className="text-gray-600">{receipt.donorEmail}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(receipt)}
                      disabled={!receipt.pdfPath || downloadingIds.has(receipt.id)}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      {downloadingIds.has(receipt.id) ? 'Téléchargement...' : 'Télécharger PDF'}
                    </Button>
                    
                    {receipt.pdfGeneratedAt && (
                      <span className="text-xs text-gray-500 text-center">
                        PDF généré le {new Date(receipt.pdfGeneratedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}