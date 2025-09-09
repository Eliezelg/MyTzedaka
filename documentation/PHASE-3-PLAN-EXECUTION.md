# 🚀 PLAN D'EXÉCUTION - PHASE 3: FRONTEND CUSTOM MULTI-TENANT

## 📋 Vue d'ensemble
Développement d'un système de sites web personnalisables pour chaque association/synagogue, intégré dans le projet frontend-hub existant.

---

## 📅 PHASE 1: Infrastructure Multi-Tenant (Jour 1-2)

### Jour 1 - Matin: Setup Routing
```bash
# Structure des dossiers
frontend-hub/src/app/
├── [locale]/                 # Routes hub existantes
└── sites/                    # NOUVEAU
    └── [domain]/            # Routes multi-tenant
        ├── layout.tsx       # Layout custom par tenant
        ├── page.tsx         # Homepage tenant
        └── [[...slug]]/     # Pages dynamiques
            └── page.tsx
```

**Tâches:**
- [ ] Créer structure dossiers sites/[domain]
- [ ] Implémenter middleware de résolution tenant
- [ ] Créer TenantProvider (Context API)
- [ ] Setup layout système avec données tenant

### Jour 1 - Après-midi: Services & API
```typescript
// lib/tenant/tenant-resolver.ts
export class TenantResolver {
  static async resolveTenant(domain: string)
  static async getTenantConfig(tenantId: string)
  static async getTenantModules(tenantId: string)
}

// lib/api/tenant-api.ts
export const tenantApi = {
  getTenant: (identifier: string),
  getPages: (tenantId: string),
  getNavigation: (tenantId: string),
  getModules: (tenantId: string)
}
```

**Tâches:**
- [ ] Créer TenantResolver service
- [ ] Implémenter API client pour tenant
- [ ] Créer hooks React (useTenant, useModules)
- [ ] Tests de résolution tenant

### Jour 2 - Matin: Navigation Dynamique
```typescript
// components/sites/navigation/DynamicNav.tsx
export function DynamicNavigation() {
  const { tenant, modules } = useTenant();
  const navigation = useDynamicNavigation(tenant.id, modules);
  // Rendu adaptatif selon modules activés
}
```

**Tâches:**
- [ ] Composant navigation dynamique
- [ ] Intégration avec système de modules
- [ ] Menu mobile responsive
- [ ] Breadcrumbs dynamiques

### Jour 2 - Après-midi: Pages de Base
**Pages essentielles:**
- [ ] Homepage avec sections modulaires
- [ ] Page de contact
- [ ] Page de dons (widget Stripe)
- [ ] Page 404 personnalisée

---

## 📅 PHASE 2: Système de Pages Dynamiques (Jour 3-4)

### Jour 3 - Matin: Rendu de Pages CMS
```typescript
// components/sites/pages/PageRenderer.tsx
export function PageRenderer({ page }: { page: Page }) {
  switch(page.type) {
    case 'STATIC': return <StaticPage />
    case 'BLOG': return <BlogPage />
    case 'GALLERY': return <GalleryPage />
    case 'EVENTS': return <EventsPage />
    // ...
  }
}
```

**Tâches:**
- [ ] PageRenderer principal
- [ ] Templates par type de page
- [ ] Système de blocs réutilisables
- [ ] Intégration Markdown/Rich Text

### Jour 3 - Après-midi: Builder de Contenu
```typescript
// components/sites/builder/ContentBuilder.tsx
interface ContentBlock {
  type: 'hero' | 'text' | 'image' | 'video' | 'donation' | 'custom';
  props: Record<string, any>;
}
```

**Tâches:**
- [ ] Composants de blocs de contenu
- [ ] Système de drag-and-drop (optionnel)
- [ ] Preview en temps réel
- [ ] Sauvegarde auto-draft

### Jour 4: Interface Admin Pages
```typescript
// app/sites/[domain]/admin/pages
```

**Tâches:**
- [ ] Liste des pages avec filtres
- [ ] Éditeur de page (WYSIWYG)
- [ ] Gestion SEO et métadonnées
- [ ] Publication/Brouillon workflow

---

## 📅 PHASE 3: Modules Synagogue (Jour 5-7)

### Jour 5: Module Zmanim
```bash
npm install kosher-zmanim
```

```typescript
// lib/services/zmanim.service.ts
import { ComplexZmanimCalendar, GeoLocation } from 'kosher-zmanim';

// components/sites/jewish/ZmanimWidget.tsx
// components/sites/jewish/ZmanimSettings.tsx
```

**Tâches:**
- [ ] Service ZmanimService avec KosherZmanim
- [ ] Widget Zmanim configurable
- [ ] Interface de configuration admin
- [ ] Cache et optimisation performance

### Jour 6: Module Prières
```typescript
// components/sites/jewish/PrayerSchedule.tsx
// components/sites/jewish/PrayerManager.tsx
```

**Tâches:**
- [ ] Gestionnaire d'horaires de prières
- [ ] Support multi-salles
- [ ] Calculs basés sur zmanim
- [ ] Notifications (optionnel)

### Jour 7: Module Cours & Événements
```typescript
// components/sites/jewish/CourseCalendar.tsx
// components/sites/jewish/EventManager.tsx
```

**Tâches:**
- [ ] Planning des cours Torah
- [ ] Calendrier hébraïque intégré
- [ ] Gestion des événements communautaires
- [ ] Système de réservation

---

## 📅 PHASE 4: Thème et Personnalisation (Jour 8-9)

### Jour 8: Theme Engine
```typescript
// lib/theme/theme-engine.ts
interface ThemeConfig {
  colors: ColorPalette;
  typography: Typography;
  layout: LayoutConfig;
  components: ComponentStyles;
}

// CSS Variables dynamiques
:root {
  --primary: var(--tenant-primary);
  --secondary: var(--tenant-secondary);
  // ...
}
```

**Tâches:**
- [ ] Système de variables CSS
- [ ] Sélecteur de thème admin
- [ ] Templates de thèmes prédéfinis
- [ ] Mode sombre/clair

### Jour 9: Customisation Avancée
**Tâches:**
- [ ] Upload logo et bannières
- [ ] Fonts personnalisées
- [ ] Layouts alternatifs
- [ ] Widgets personnalisés

---

## 📅 PHASE 5: Intégrations (Jour 10-11)

### Jour 10: Services Externes
**Tâches:**
- [ ] Intégration Stripe étendue
- [ ] Système d'emails transactionnels
- [ ] Analytics (Google/Plausible)
- [ ] Newsletter (Mailchimp/Sendinblue)

### Jour 11: Optimisation & Tests
**Tâches:**
- [ ] Tests E2E multi-tenant
- [ ] Optimisation performance (Lighthouse)
- [ ] SEO et meta tags dynamiques
- [ ] Documentation utilisateur

---

## 🎯 Livrables par Phase

### Phase 1 ✅
- Infrastructure multi-tenant fonctionnelle
- Navigation dynamique
- Pages de base

### Phase 2 ✅
- Système CMS complet
- Builder de contenu
- Admin pages

### Phase 3 ✅
- Modules synagogue (Zmanim, Prières, Cours)
- Calendrier hébraïque
- Widgets judaïques

### Phase 4 ✅
- Thème personnalisable
- Customisation visuelle complète

### Phase 5 ✅
- Intégrations tierces
- Site production-ready

---

## 🛠️ Stack Technique Finale

```json
{
  "frontend": {
    "framework": "Next.js 14 (App Router)",
    "language": "TypeScript",
    "styling": "Tailwind CSS + CSS Variables",
    "state": "React Context + React Query",
    "forms": "React Hook Form + Zod",
    "jewish": "kosher-zmanim"
  },
  "backend": {
    "existing": "NestJS + Prisma",
    "nouveaux-endpoints": [
      "/api/sites/[domain]/config",
      "/api/sites/[domain]/pages",
      "/api/sites/[domain]/modules",
      "/api/sites/[domain]/navigation"
    ]
  }
}
```

---

## 📝 Commandes de Développement

```bash
# Installation des dépendances
cd frontend-hub
npm install kosher-zmanim @tiptap/react @tiptap/starter-kit

# Développement
npm run dev

# Build multi-tenant
npm run build

# Tests
npm run test
npm run test:e2e
```

---

## ⚡ Checklist de Démarrage

### Avant de commencer:
- [x] Document de plan approuvé
- [ ] Extension schema Prisma (migrations)
- [ ] Endpoints API backend créés
- [ ] Structure de dossiers frontend
- [ ] Dépendances installées

### Pour chaque module:
- [ ] Composant UI
- [ ] Service/Hook
- [ ] Page admin
- [ ] Tests
- [ ] Documentation

---

## 🚦 Critères de Succès

- ⏱️ Temps de génération site < 30 secondes
- 📊 Score Lighthouse > 95
- 📱 100% responsive mobile
- 🌍 Multi-langue (FR/HE/EN)
- 🔒 Isolation données parfaite
- ♿ Accessibilité WCAG 2.1 AA

---

**Prêt à démarrer!** 🚀

Commençons par la Phase 1: Infrastructure Multi-Tenant.