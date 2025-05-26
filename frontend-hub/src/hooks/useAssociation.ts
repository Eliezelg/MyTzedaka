import { useQuery } from '@tanstack/react-query'
import { hubApiClient } from '@/lib/hub-client'
import type { Association, Campaign } from '@/lib/hub-client'

interface AssociationWithCampaigns extends Association {
  campaigns?: Campaign[]
}

export function useAssociation(id: string) {
  return useQuery<AssociationWithCampaigns, Error>({
    queryKey: ['association', id],
    queryFn: async () => {
      if (!id || id === 'undefined') {
        throw new Error('Association ID is required')
      }

      // Récupération des détails de l'association
      const association = await hubApiClient.getAssociationById(id)
      
      // Récupération des campagnes de cette association
      const campaignsResponse = await hubApiClient.getCampaigns({
        page: 1,
        limit: 20,
        associationId: id,
        status: 'ACTIVE'
      })

      return {
        ...association,
        campaigns: campaignsResponse.data
      }
    },
    enabled: !!id && id !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Ne pas retry si c'est une erreur 404
      if (error.message?.includes('404')) {
        return false
      }
      return failureCount < 3
    }
  })
}

export function useAssociationCampaigns(associationId: string, limit = 6) {
  return useQuery({
    queryKey: ['association-campaigns', associationId, limit],
    queryFn: () => hubApiClient.getCampaigns({
      page: 1,
      limit,
      associationId,
      status: 'ACTIVE'
    }),
    enabled: !!associationId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })
}
