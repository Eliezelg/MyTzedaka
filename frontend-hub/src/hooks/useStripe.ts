import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stripeService, StripeConfig, ConnectAccountInfo, OnboardingLinkResponse } from '@/services/stripe-service';

/**
 * Hook pour récupérer la configuration Stripe d'un tenant
 */
export function useStripeConfig(tenantId: string) {
  return useQuery<StripeConfig, Error>({
    queryKey: ['stripe', 'config', tenantId],
    queryFn: () => stripeService.getTenantConfig(tenantId),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook pour récupérer la clé publique Stripe d'un tenant
 */
export function useStripePublishableKey(tenantId: string) {
  return useQuery<{ publishableKey: string }, Error>({
    queryKey: ['stripe', 'publishableKey', tenantId],
    queryFn: () => stripeService.getPublishableKey(tenantId),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook pour configurer un tenant Stripe
 */
export function useConfigureTenant() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    { 
      tenantId: string; 
      mode: 'PLATFORM' | 'CUSTOM'; 
      customKeys?: { secretKey: string; publishableKey: string } 
    }
  >({
    mutationFn: ({ tenantId, mode, customKeys }) => 
      stripeService.configureTenant(tenantId, mode, customKeys),
    onSuccess: (_, variables) => {
      // Invalider les caches pour ce tenant
      queryClient.invalidateQueries({ queryKey: ['stripe', 'config', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['stripe', 'publishableKey', variables.tenantId] });
    },
    onError: (error) => {
      console.error('Erreur configuration tenant:', error);
    },
  });
}

/**
 * Hook pour créer un compte Stripe Connect
 */
export function useCreateConnectAccount() {
  const queryClient = useQueryClient();

  return useMutation<
    ConnectAccountInfo,
    Error,
    { tenantId: string; country?: string; type?: 'express' | 'standard' }
  >({
    mutationFn: ({ tenantId, country, type }) => 
      stripeService.createConnectAccount(
        tenantId, 
        country || 'FR', // Utiliser 'FR' comme valeur par défaut si undefined
        type || 'standard' // Utiliser 'standard' comme valeur par défaut si undefined
      ),
    onSuccess: (_, variables) => {
      // Invalider la configuration pour ce tenant
      queryClient.invalidateQueries({ queryKey: ['stripe', 'config', variables.tenantId] });
    },
    onError: (error) => {
      console.error('Erreur création compte Connect:', error);
    },
  });
}

/**
 * Hook pour générer un lien d'onboarding Stripe Connect
 */
export function useGenerateOnboardingLink() {
  return useMutation<
    OnboardingLinkResponse,
    Error,
    { tenantId: string; refreshUrl: string; returnUrl: string }
  >({
    mutationFn: ({ tenantId, refreshUrl, returnUrl }) => 
      stripeService.createOnboardingLink(tenantId, refreshUrl, returnUrl),
    onError: (error) => {
      console.error('Erreur génération lien onboarding:', error);
    },
  });
}

/**
 * Hook principal pour Stripe (utilisé dans les composants de configuration)
 */
export function useStripe(tenantId: string) {
  const config = useStripeConfig(tenantId);
  const publishableKey = useStripePublishableKey(tenantId);
  const configureTenant = useConfigureTenant();
  const createConnectAccount = useCreateConnectAccount();
  const generateOnboardingLink = useGenerateOnboardingLink();

  return {
    // Données
    config: config.data,
    publishableKey: publishableKey.data?.publishableKey,
    
    // État de chargement
    isLoadingConfig: config.isLoading,
    isLoadingKey: publishableKey.isLoading,
    
    // Erreurs
    configError: config.error,
    keyError: publishableKey.error,
    
    // Actions
    configureTenant,
    createConnectAccount,
    generateOnboardingLink,
    
    // État des mutations
    isConfiguringTenant: configureTenant.isPending,
    isCreatingAccount: createConnectAccount.isPending,
    isGeneratingLink: generateOnboardingLink.isPending,
    
    // Refresh
    refetchConfig: config.refetch,
    refetchKey: publishableKey.refetch,
  };
}
