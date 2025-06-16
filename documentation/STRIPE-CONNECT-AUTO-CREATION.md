# Création automatique de comptes Stripe Connect

## Contexte
Auparavant, lors de la création d'une association, le système créait le tenant et l'association mais ne créait pas automatiquement le compte Sxxxxxxxxxxxct. Les associations devaient ensuite appeler manuellement l'endpoint `/stripe-config/:tenantId/configure` pour créer leur compte Stripe Connect.

## Changements implémentés

### 1. Modification du service Hub
**Fichier**: `/backend/src/hub/hub.service.ts`

Le service `HubService` a été modifié pour :
- Importer et injecter `MultiTenantStripeService`
- Créer automatiquement un compte Stripe Connect lors de la création d'une association en mode PLATFORM

### 2. Flux de création amélioré

Quand une association est créée avec `stripeMode: 'PLATFORM'` :

1. **Création du Tenant** : Structure multi-tenant créée
2. **Création de l'AssociationListing** : Entrée dans le répertoire public
3. **Création automatique du compte Stripe Connect** :
   ```typescript
   const stripeAccount = await this.multiTenantStripeService.createConnectAccount(
     tenant.id,
     associationData.email,
     associationData.name
   );
   ```
4. **Création du UserTenantMembership** : Le créateur devient admin

### 3. Gestion des erreurs
Si la création du compte Stripe Connect échoue :
- Un message d'erreur est loggé
- La création de l'association continue sans bloquer
- L'association pourra configurer Stripe plus tard via l'interface d'administration

### 4. Mode CUSTOM inchangé
Pour le mode CUSTOM, le comportement reste identique :
- Les clés Stripe sont fournies par l'association
- Elles sont cryptées et stockées dans StripeAccount

## Avantages de cette approche

1. **Expérience utilisateur simplifiée** : Plus besoin d'étapes supplémentaires après la création
2. **Configuration automatique** : Le compte Stripe Connect est créé avec les bonnes métadonnées
3. **Résilience** : Si Stripe est indisponible, la création d'association fonctionne quand même
4. **Traçabilité** : Les logs indiquent clairement la création du compte Stripe Connect

## Logs de débogage

Le système génère des logs pour suivre le processus :
```
🚀 Création automatique du compte Stripe Connect pour: [Nom de l'association]
✅ Compte Stripe Connect créé avec succès: [ID du compte]
```

ou en cas d'erreur :
```
⚠️ Erreur lors de la création du compte Stripe Connect: [Message d'erreur]
```

## API xxxxxxxxxxxxct utilisée

Le système utilise l'API Stripe Connect pour créer des comptes de type "Standard" :
```typescript
await this.platformStripe.accounts.create({
  type: 'standard',
  country: 'FR',
  email: email,
  business_profile: {
    name: businessName,
  },
  metadata: {
    tenantId: tenantId,
  },
});
```

## Prochaines étapes

Après la création automatique du compte :
1. L'association doit compléter l'onboarding Stripe Connect
2. Un lien d'onboarding peut être généré via `/stripe-config/:tenantId/connect/onboarding`
3. Une fois l'onboarding complété, l'association peut accepter des paiements

## Notes importantes

- Les clés Stripe utilisées sont celles de la plateforme (STRIPE_SECRET_KEY)
- Le compte créé est de type "standard" (permet plus de flexibilité)
- Le pays est défini sur "FR" par défaut (à adapter selon les besoins)
- Les métadonnées incluent le tenantId pour faciliter le tracking