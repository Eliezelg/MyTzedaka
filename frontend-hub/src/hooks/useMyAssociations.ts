import { useQuery } from '@tanstack/react-query'
import { associationsService, UserAssociation } from '@/services/associations.service'

export function useMyAssociations() {
  return useQuery({
    queryKey: ['my-associations'],
    queryFn: async () => {
      console.log(' Appel API pour récupérer mes associations...')
      try {
        const result = await associationsService.getMyAssociations()
        console.log(' Associations récupérées:', result)
        return result
      } catch (error) {
        console.error(' Erreur lors de la récupération des associations:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useMyAssociationsCount() {
  const { data: associations } = useMyAssociations()
  return associations?.length || 0
}
