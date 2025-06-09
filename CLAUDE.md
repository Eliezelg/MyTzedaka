# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (NestJS)
```bash
cd backend
npm run start:dev        # Start development server (port 3000)
npm run build           # Build production
npm run lint            # Lint TypeScript code
npm run test            # Run unit tests
npm run test:e2e        # Run end-to-end tests
npm run test:tenant-isolation  # Test tenant isolation
npm run test:auth       # Test authentication
npm run db:migrate      # Run Prisma migrations
npm run db:seed         # Seed database with test data
npm run db:reset        # Reset database and reseed
```

### Frontend Hub (Next.js)
```bash
cd frontend-hub
npm run dev             # Start development server (port 3001)
npm run build           # Build production
npm run lint            # Lint code
npm run type-check      # TypeScript type checking
npm run test            # Run Jest tests
npm run test:e2e        # Run Playwright tests
```

### Common Development Tasks
```bash
# Full stack development
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
cd frontend-hub && npm run dev

# Database operations
cd backend
npm run db:migrate      # Apply schema changes
npm run db:seed         # Add test data
npm run db:studio       # Open Prisma Studio
```

## Architecture Overview

### Multi-Tenant System
This is a **multi-tenant SaaS platform** for Jewish charitable associations where:
- Each association is a **tenant** with isolated data
- **Hub Central** aggregates public data across tenants for donor discovery
- **Row Level Security** ensures strict tenant isolation
- **Global users** (tenantId: null) can access the hub and donate across tenants

### Key Components
- **Backend**: NestJS + Prisma + PostgreSQL (port 3000)
- **Frontend Hub**: Next.js 14 + React Query + Tailwind (port 3001)
- **Database**: PostgreSQL with multi-tenant schema
- **Auth**: AWS Cognito with JWT tokens
- **Payments**: Stripe with multi-tenant support (PLATFORM/CUSTOM modes)

## Prisma Schema Structure

The database uses a multi-tenant architecture with these key models:

### Core Models
- **Tenant**: Main tenant entity (associations)
  - `slug`: Unique identifier for routing
  - `stripeMode`: PLATFORM (Stripe Connect) or CUSTOM (own account)
  - Relations: users, campaigns, donations, associationListing

- **User**: Multi-tenant users with global support
  - `tenantId`: NULL for global hub users, tenant ID for association users
  - Unique constraint: `[tenantId, email]` ensures unique emails per tenant
  - Global users have unique emails across platform

- **AssociationListing**: Public directory entry for each association
  - One-to-one with Tenant
  - Contains public information for hub display
  - Fields: name, description, logo, totalRaised, donationsCount

- **Campaign**: Fundraising campaigns
  - Belongs to a tenant and user
  - Links to AssociationListing for hub visibility
  - Tracks: goal, raised, donationsCount, donorsCount

- **Donation**: Payment records with source tracking
  - `source`: PLATFORM (hub) vs CUSTOM_SITE (association site)
  - `stripePaymentIntentId`: Stripe integration
  - Cross-tenant user tracking for donor profiles

### Multi-Tenant Patterns
- **Tenant Isolation**: Every entity has `tenantId` foreign key
- **Global Access**: Hub users (tenantId: null) can view/donate across tenants
- **Cross-Tenant Tracking**: DonorProfile + TenantDonorAccess for donation history
- **Stripe Integration**: StripeAccount model with encrypted keys

## Tenant Context System

### Middleware Flow
1. **Tenant Resolution** (tenant.middleware.ts):
   - Header: `X-Tenant-ID`
   - Subdomain: `community1.mytzedaka.com`
   - Path: `/api/tenant/community1/...`
   - Query: `?tenant=community1`

2. **Context Storage** (tenant.context.ts):
   - Uses AsyncLocalStorage for request-scoped tenant context
   - Accessible via `getTenantContext()` in services

3. **Route Exclusions**:
   ```typescript
   // Routes that bypass tenant middleware:
   '/api/hub/*'     // Cross-tenant hub routes
   '/api/auth/*'    // Global authentication  
   '/api/health'    // Health checks
   '/api/stripe/webhook'  // Stripe webhooks
   ```

### Database Access
- **PrismaService.forTenant(tenantId)**: Returns tenant-aware client
- **Automatic Filtering**: All queries automatically filter by tenantId
- **Hub Service**: Special service for cross-tenant queries

## Authentication System

### AWS Cognito Integration
- **Strategy**: JWT tokens with Cognito validation (cognito.strategy.ts)
- **Guards**: Routes protected with JwtAuthGuard + RolesGuard
- **Dual Mode**: 
  - Tenant users: Created per association
  - Global users: Hub access with tenantId: null

### Frontend Auth
- **Context**: React Context with useReducer pattern (AuthContext.tsx)
- **Middleware**: Next.js middleware for route protection
- **Token Storage**: Secure cookie storage

## Stripe Multi-Tenant Architecture

### Service Pattern
```typescript
// MultiTenantStripeService handles dynamic Stripe instances
const stripeInstance = await this.getStripeForTenant(tenantId);
const paymentIntent = await stripeInstance.paymentIntents.create({...});
```

### Two Modes
- **PLATFORM**: Uses Stripe Connect through MyTzedaka account
- **CUSTOM**: Association's own Stripe account with encrypted keys

### Key Services
- **MultiTenantStripeService**: Dynamic Stripe instance management
- **EncryptionService**: AES-256-GCM for API key encryption
- **DonationService**: Payment processing with tenant awareness

## Frontend Patterns

### API Layer
- **api-client.ts**: Centralized HTTP client with error handling
- **React Query**: Server state management with 5-minute cache
- **Type Safety**: Shared types between frontend/backend

### Component Architecture
```typescript
// Standard component structure
components/
├── ui/           # Reusable UI components (Button, Card, etc.)
├── hub/          # Hub-specific components
└── donation/     # Donation flow components
```

### State Management
- **Server State**: React Query for API data
- **Client State**: React hooks (useState, useReducer)
- **Auth State**: React Context pattern

## Testing Strategy

### Backend Tests
- **E2E Tests**: Full application testing with real database
- **Tenant Isolation**: Verify strict data separation between tenants
- **Auth Tests**: JWT token validation and role-based access

### Test Commands
```bash
npm run test:tenant-isolation  # Critical: ensures tenant data isolation
npm run test:auth             # Authentication and authorization
npm run test:hub              # Cross-tenant hub functionality
```

### Frontend Tests
- **Jest + RTL**: Component unit tests with coverage reports
- **Playwright**: E2E integration tests

## Project Status (June 10, 2025)

### Current State
**IMPORTANT**: The project is significantly more advanced than some documentation suggests.

#### Backend Status (95% Complete)
- ✅ **Multi-tenant architecture**: Production-ready with RLS
- ✅ **Authentication**: Complete AWS Cognito + JWT integration
- ✅ **Hub Central**: 10+ cross-tenant API endpoints operational
- ✅ **Stripe Integration**: Multi-tenant payment system working
- ✅ **Admin System**: Full CRUD operations for tenants
- ⚠️ **Remaining**: S3 service (placeholder), deployment logic, unit test config

#### Frontend Status (90% Complete)
- ✅ **Core Pages**: Homepage, associations, campaigns, auth flows
- ✅ **UI System**: 20+ components with Tailwind + Shadcn/UI
- ✅ **API Integration**: React Query with type-safe client
- ✅ **Donation System**: Stripe widget with 3-step flow
- ⚠️ **Remaining**: Final Stripe Elements integration, E2E tests

### What Actually Works Right Now
- Multi-tenant data isolation and security
- User authentication and role-based access
- Association directory with search/filters
- Campaign listings with progress tracking
- Admin dashboard for tenant management
- Stripe payment processing (backend complete)

## Development Conventions

### Code Organization
- **Feature Modules**: One feature = one NestJS module
- **DTO Pattern**: Input validation with class-validator decorators
- **Service Layer**: Business logic separated from controllers

### Error Handling
- **Backend**: Structured exceptions with proper HTTP status codes
- **Frontend**: React Query error boundaries with user-friendly messages

### Type Safety
- **Shared Types**: Backend DTOs exported for frontend use
- **Prisma Types**: Generated types for database models
- **API Contracts**: Consistent request/response interfaces

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
AWS_COGNITO_USER_POOL_ID="..."
AWS_COGNITO_CLIENT_ID="..."
STRIPE_SECRET_KEY="..."
ENCRYPTION_SECRET="..."  # For encrypting Stripe keys
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
```

---
trigger: always_on
---

## Development Workflow Rules

### Vérification après chaque phase
À la fin de chaque phase de développement, relis le fichier correspondant à cette phase et vérifie que tout a bien été créé et implémenté conformément à ce qui était prévu.

### Mise à jour du README
Une fois la vérification terminée, mets à jour le README.md avec un résumé clair de ce qui a été développé dans la phase.

### Commit et versioning
Après chaque phase complétée :
```powershell
git add .
git commit -m "Phase X complétée : [description]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Préparation de la phase suivante
Ensuite, crée un nouveau fichier dédié à la phase suivante, en définissant les objectifs et les tâches à réaliser.

### Documentation centralisée
Tous les documents sont et doivent être placés dans le dossier `documentation/`

### Aucune esquive de problème
Ne contourne jamais un problème. Résous-le. Chaque obstacle doit être traité et corrigé de manière propre et durable.

### Respect du schéma Prisma
Le développement doit toujours se conformer au schéma Prisma existant. Tu peux le modifier si nécessaire.
Avant toute création de fichier ou de fonctionnalité, assure-toi d'utiliser les termes et structures déjà définis dans ce schéma.

## Common Issues & Solutions

### Tenant Context Missing
If you see "Tenant context not found" errors:
1. Ensure the route is not excluded from tenant middleware
2. Check that tenant resolution is working (header/subdomain/path)
3. Verify AsyncLocalStorage is properly set up

### Stripe Multi-Tenant Issues
- Always use `MultiTenantStripeService.getStripeForTenant(tenantId)`
- Never use global Stripe instance for tenant-specific operations
- Ensure StripeAccount is configured for the tenant

### Database Query Issues
- Use `PrismaService.forTenant(tenantId)` for tenant-aware queries
- For cross-tenant queries, use HubService methods
- Remember that global users (tenantId: null) need special handling