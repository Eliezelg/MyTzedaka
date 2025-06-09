# Phase 6 - Sites Personnalisés Multi-Tenant

## 🎯 Objectif
Créer un système de génération automatique de sites web personnalisés pour chaque association, avec branding sur-mesure et déploiement automatique.

---

## 🏗️ Architecture Sites Personnalisés

### Vue d'ensemble
```
Hub Central (hub.mytzedaka.com)
├── Association A → site-a.mytzedaka.com
├── Association B → site-b.mytzedaka.com  
├── Association C → custom-domain.org
└── Association D → mon-association.fr
```

### Stack Technique
- **Templates** : Next.js 14 + TailwindCSS dynamique
- **Déploiement** : AWS S3 + CloudFront + Route53
- **Builder** : Interface drag-and-drop dans le hub
- **Assets** : S3 bucket par tenant pour images/logos
- **DNS** : Gestion automatique domaines custom

---

## 📋 Fonctionnalités Clés

### 6.1 Template Engine Dynamique

#### Structure de Template
```typescript
interface SiteTemplate {
  id: string;
  name: string;
  category: 'classic' | 'modern' | 'minimal' | 'charity';
  layout: LayoutConfig;
  components: ComponentConfig[];
  customization: CustomizationOptions;
}

interface CustomizationOptions {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sizes: FontSizes;
  };
  branding: {
    logo: string;
    favicon: string;
    organizationName: string;
    tagline: string;
  };
  content: {
    hero: HeroSection;
    about: AboutSection;
    campaigns: CampaignSection;
    contact: ContactSection;
  };
}
```

#### Templates Prédéfinis
1. **Template Classique** : Layout traditionnel ONG
2. **Template Moderne** : Design épuré et contemporain  
3. **Template Minimal** : Focus sur l'essentiel
4. **Template Charity** : Spécialisé associations caritatives

### 6.2 Interface Builder Visual

#### Customisation en Temps Réel
- **Palette de couleurs** : Sélecteur avec preview
- **Typography** : Choix polices + tailles
- **Layout** : Disposition sections via drag-and-drop
- **Contenu** : Éditeur WYSIWYG pour textes
- **Images** : Upload et gestion assets

#### Preview et Validation
- **Preview live** : Voir les changements instantanément
- **Multi-device** : Test responsive mobile/tablet/desktop
- **Performance** : Score Lighthouse automatique
- **Validation** : Vérification contenu et conformité

### 6.3 Système de Déploiement

#### Pipeline Automatique
```yaml
Site Generation Pipeline:
1. Template Selection
2. Customization Application  
3. Build Next.js Static
4. Asset Optimization
5. S3 Upload
6. CloudFront Invalidation
7. DNS Configuration
8. SSL Certificate
9. Go Live Notification
```

#### Gestion des Domaines
- **Sous-domaines automatiques** : `{slug}.mytzedaka.com`
- **Domaines custom** : Configuration DNS complète
- **Certificats SSL** : Génération automatique Let's Encrypt
- **Redirections** : Gestion 301/302 pour SEO

---

## 🛠️ Implémentation Technique

### 6.1 Backend - Template Service

#### Prisma Schema Extension
```prisma
model SiteTemplate {
  id                String   @id @default(cuid())
  name              String
  category          String
  isActive          Boolean  @default(true)
  config            Json     // Template configuration
  preview           String?  // Preview image URL
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  tenantSites       TenantSite[]
  
  @@map("site_templates")
}

model TenantSite {
  id                String   @id @default(cuid())
  tenantId          String
  templateId        String
  customDomain      String?
  subdomain         String   @unique
  customization     Json     // Site customization
  isActive          Boolean  @default(true)
  deploymentStatus  String   @default("draft") // draft, building, live, error
  buildLogs         String?
  lastDeployAt      DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  tenant            Tenant       @relation(fields: [tenantId], references: [id])
  template          SiteTemplate @relation(fields: [templateId], references: [id])
  
  @@map("tenant_sites")
}

model SiteAsset {
  id                String   @id @default(cuid())
  tenantSiteId      String
  filename          String
  s3Key             String   @unique
  url               String
  mimeType          String
  size              Int
  createdAt         DateTime @default(now())
  
  // Relations
  tenantSite        TenantSite @relation(fields: [tenantSiteId], references: [id])
  
  @@map("site_assets")
}
```

#### Site Generation Service
```typescript
@Injectable()
export class SiteGenerationService {
  async generateSite(tenantId: string, customization: SiteCustomization): Promise<void> {
    // 1. Récupérer template et données tenant
    const template = await this.getTemplate(customization.templateId);
    const tenant = await this.getTenant(tenantId);
    
    // 2. Compiler le template avec customisation
    const siteConfig = this.compileSiteConfig(template, customization, tenant);
    
    // 3. Générer les fichiers Next.js
    const generatedFiles = await this.generateNextJSFiles(siteConfig);
    
    // 4. Build static site
    const buildResult = await this.buildStaticSite(generatedFiles);
    
    // 5. Déployer sur S3 + CloudFront
    await this.deployToAWS(buildResult, tenant.subdomain);
    
    // 6. Configurer DNS si domaine custom
    if (customization.customDomain) {
      await this.configureDNS(customization.customDomain, tenant.subdomain);
    }
    
    // 7. Mettre à jour status en base
    await this.updateDeploymentStatus(tenantId, 'live');
  }
  
  private async generateNextJSFiles(config: SiteConfig): Promise<GeneratedFiles> {
    // Logique génération template dynamique
  }
  
  private async deployToAWS(files: GeneratedFiles, subdomain: string): Promise<void> {
    // Upload S3 + invalidation CloudFront
  }
}
```

### 6.2 Frontend - Site Builder Interface

#### Page Builder Component
```typescript
'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface BuilderProps {
  tenantId: string;
  currentSite?: TenantSite;
}

export function SiteBuilder({ tenantId, currentSite }: BuilderProps) {
  const [customization, setCustomization] = useState<SiteCustomization>(
    currentSite?.customization || defaultCustomization
  );
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  return (
    <div className="flex h-screen">
      {/* Panel de personnalisation */}
      <div className="w-80 bg-gray-50 border-r overflow-y-auto">
        <CustomizationPanel
          customization={customization}
          onChange={setCustomization}
        />
      </div>
      
      {/* Zone de preview */}
      <div className="flex-1 bg-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <DeviceToggle mode={previewMode} onChange={setPreviewMode} />
          <div className="space-x-2">
            <Button variant="outline" onClick={() => handleSave(customization)}>
              Sauvegarder
            </Button>
            <Button onClick={() => handleDeploy(customization)}>
              Publier le Site
            </Button>
          </div>
        </div>
        
        <SitePreview
          customization={customization}
          mode={previewMode}
          tenantId={tenantId}
        />
      </div>
    </div>
  );
}
```

#### Customization Panel
```typescript
interface CustomizationPanelProps {
  customization: SiteCustomization;
  onChange: (customization: SiteCustomization) => void;
}

export function CustomizationPanel({ customization, onChange }: CustomizationPanelProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Identité Visuelle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Logo</Label>
            <LogoUpload
              currentLogo={customization.branding.logo}
              onUpload={(url) => updateBranding('logo', url)}
            />
          </div>
          
          <div>
            <Label>Nom de l'Organisation</Label>
            <Input
              value={customization.branding.organizationName}
              onChange={(e) => updateBranding('organizationName', e.target.value)}
            />
          </div>
          
          <div>
            <Label>Slogan</Label>
            <Input
              value={customization.branding.tagline}
              onChange={(e) => updateBranding('tagline', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Couleurs */}
      <Card>
        <CardHeader>
          <CardTitle>Palette de Couleurs</CardTitle>
        </CardHeader>
        <CardContent>
          <ColorPalette
            colors={customization.colors}
            onChange={(colors) => onChange({ ...customization, colors })}
          />
        </CardContent>
      </Card>
      
      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typographie</CardTitle>
        </CardHeader>
        <CardContent>
          <TypographySettings
            typography={customization.typography}
            onChange={(typography) => onChange({ ...customization, typography })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6.3 Template Generation Engine

#### Dynamic Template Compiler
```typescript
export class TemplateCompiler {
  async compileTemplate(
    template: SiteTemplate,
    customization: SiteCustomization,
    tenantData: TenantData
  ): Promise<CompiledSite> {
    
    // 1. Générer les styles CSS dynamiques
    const dynamicCSS = this.generateDynamicCSS(customization);
    
    // 2. Compiler les composants React avec données
    const components = await this.compileComponents(template.components, tenantData);
    
    // 3. Générer les pages Next.js
    const pages = this.generatePages(template.layout, components);
    
    // 4. Créer la configuration Next.js
    const nextConfig = this.generateNextConfig(customization);
    
    // 5. Assembler le site complet
    return {
      pages,
      components,
      styles: dynamicCSS,
      config: nextConfig,
      assets: this.processAssets(customization.assets),
    };
  }
  
  private generateDynamicCSS(customization: SiteCustomization): string {
    return `
      :root {
        --color-primary: ${customization.colors.primary};
        --color-secondary: ${customization.colors.secondary};
        --color-accent: ${customization.colors.accent};
        --font-heading: ${customization.typography.headingFont};
        --font-body: ${customization.typography.bodyFont};
      }
      
      .hero-section {
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      }
      
      .btn-primary {
        background-color: var(--color-primary);
        color: white;
      }
      
      h1, h2, h3 {
        font-family: var(--font-heading);
      }
      
      body {
        font-family: var(--font-body);
      }
    `;
  }
}
```

---

## 🚀 Plan d'Implémentation

### Sprint 1 : Infrastructure (Semaine 1-2)
- [ ] Extension schema Prisma pour sites
- [ ] Service de base template engine
- [ ] Infrastructure AWS (S3, CloudFront, Route53)
- [ ] Pipeline CI/CD pour génération sites

### Sprint 2 : Templates de Base (Semaine 3-4)
- [ ] 2 templates de base (Classique + Moderne)
- [ ] Système de customisation couleurs/fonts
- [ ] Preview en temps réel
- [ ] Upload et gestion assets

### Sprint 3 : Builder Interface (Semaine 5-6)
- [ ] Interface drag-and-drop builder
- [ ] Panel de customisation complet
- [ ] Preview multi-device
- [ ] Sauvegarde et versioning

### Sprint 4 : Déploiement & DNS (Semaine 7-8)
- [ ] Génération sites Next.js automatique
- [ ] Déploiement S3 + CloudFront
- [ ] Gestion domaines custom
- [ ] Certificats SSL automatiques

### Sprint 5 : Intégration & Tests (Semaine 9-10)
- [ ] Intégration avec hub central
- [ ] Tests end-to-end
- [ ] Performance optimization
- [ ] Documentation utilisateur

---

## 📊 Métriques de Succès

### Techniques
- [ ] **Génération site** : < 3 minutes
- [ ] **Lighthouse score** : > 90
- [ ] **Déploiement** : < 5 minutes
- [ ] **Uptime sites** : > 99.9%

### Business
- [ ] **Adoption** : 80% associations créent un site
- [ ] **Revenue** : +200% avec sites premium
- [ ] **Satisfaction** : Score NPS > 50
- [ ] **Support tickets** : < 5% des déploiements

---

## 💰 Modèle de Monétisation

### Plans Sites Personnalisés
- **Gratuit** : Sous-domaine mytzedaka.com + template de base
- **Standard (29€/mois)** : Domaine custom + templates premium
- **Premium (79€/mois)** : Builder avancé + analytics + support prioritaire
- **Enterprise (299€/mois)** : Multi-sites + branding removal + SLA

### Options Additionnelles
- **Design sur-mesure** : 500€ one-time
- **Migration données** : 200€ one-time
- **Formation équipe** : 150€/heure
- **Support dédié** : 99€/mois
