import { apiClient } from '@/lib/api-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export interface TaxReceipt {
  id: string
  receiptNumber: string
  donorName: string
  donorEmail: string
  associationName: string
  donationAmount: number
  donationCurrency: string
  donationDate: string
  issueDate: string
  pdfPath: string | null
  pdfGeneratedAt: string | null
  status: 'DRAFT' | 'GENERATED' | 'SENT'
  country: string
  tenant: {
    id: string
    name: string
    slug: string
  }
  donation: {
    id: string
    amount: number
    currency: string
    createdAt: string
    campaign?: {
      id: string
      title: string
    }
  }
}

export interface TaxReceiptsByYear {
  year: number
  receipts: TaxReceipt[]
  totalAmount: number
  count: number
}

export interface TaxReceiptsStats {
  receipts: TaxReceipt[]
  totalAmount: number
  totalCount: number
  monthlyStats: Array<{
    month: string
    count: number
    totalAmount: number
  }>
}

class TaxReceiptsService {
  private baseUrl = '/tax-receipts'

  // Pour les donateurs - récupérer leurs reçus fiscaux
  async getDonorTaxReceipts(options?: {
    year?: number
    tenantId?: string
    limit?: number
    offset?: number
  }): Promise<{ receipts: TaxReceipt[], total: number }> {
    const params = new URLSearchParams()
    if (options?.year) params.append('year', options.year.toString())
    if (options?.tenantId) params.append('tenantId', options.tenantId)
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())

    const response = await apiClient.get<{ receipts: TaxReceipt[], total: number }>(`${this.baseUrl}/donor${params.toString() ? '?' + params.toString() : ''}`)
    return response.data
  }

  // Pour les donateurs - récupérer leurs reçus groupés par année
  async getDonorTaxReceiptsByYear(tenantId?: string): Promise<TaxReceiptsByYear[]> {
    const params = new URLSearchParams()
    if (tenantId) params.append('tenantId', tenantId)

    const response = await apiClient.get<TaxReceiptsByYear[]>(`${this.baseUrl}/donor/by-year${params.toString() ? '?' + params.toString() : ''}`)
    return response.data
  }

  // Pour les associations - récupérer les reçus de leur tenant
  async getTenantTaxReceipts(tenantId: string, filters?: {
    status?: string
    startDate?: string
    endDate?: string
  }): Promise<TaxReceipt[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const queryString = params.toString()
    const url = `${this.baseUrl}${queryString ? '?' + queryString : ''}`
    
    const response = await apiClient['request']<TaxReceipt[]>(url, {
      method: 'GET',
      headers: {
        'X-Tenant-ID': tenantId,
      }
    })
    return response.data
  }

  // Pour les associations - récupérer les statistiques des reçus
  async getTenantTaxReceiptsStats(tenantId: string, options?: { year?: number }): Promise<TaxReceiptsStats> {
    const params = new URLSearchParams()
    if (options?.year) params.append('year', options.year.toString())

    const queryString = params.toString()
    const url = `${this.baseUrl}/stats${queryString ? '?' + queryString : ''}`
    
    const response = await apiClient['request']<TaxReceiptsStats>(url, {
      method: 'GET',
      headers: {
        'X-Tenant-ID': tenantId,
      }
    })
    return response.data
  }

  // Télécharger un reçu fiscal PDF
  async downloadTaxReceipt(receiptId: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/api${this.baseUrl}/${receiptId}/download`, {
      method: 'GET',
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement: ${response.statusText}`)
    }

    return await response.blob()
  }

  // Générer un reçu fiscal pour une donation
  async generateTaxReceipt(tenantId: string, donationId: string, country: string): Promise<TaxReceipt> {
    const response = await apiClient['request']<TaxReceipt>(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({ donationId, country }),
    })

    return response.data
  }

  // Utilité pour télécharger et sauvegarder un fichier
  async downloadAndSaveReceipt(tenantId: string, receiptId: string, fileName: string) {
    try {
      const blob = await this.downloadTaxReceipt(receiptId)
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || `recu-fiscal-${receiptId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      throw error
    }
  }
}

export const taxReceiptsService = new TaxReceiptsService()
export default taxReceiptsService