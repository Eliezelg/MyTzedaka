# 🔐 Phase 2.1 : Implémentation Authentification AWS Cognito

## 🎯 Objectifs
Mettre en place un système d'authentification complet avec AWS Cognito pour le frontend hub.

## 📋 Plan d'Implémentation

### JOUR 1-2 : Configuration Backend
- [ ] Configuration AWS Cognito User Pool
- [ ] JWT Strategy NestJS
- [ ] Guards d'authentification
- [ ] Types TypeScript auth

### JOUR 3-4 : Frontend Auth
- [ ] Context Provider Auth  
- [ ] Hooks useAuth
- [ ] Pages login/signup
- [ ] Formulaires de connexion

### JOUR 5-7 : Protection & Tests
- [ ] Middleware protection routes
- [ ] Tests d'intégration
- [ ] Documentation complète

## 🔧 Implémentation Technique

### 1. Backend - Configuration AWS Cognito

#### A. Installation des dépendances
```bash
npm install @aws-sdk/client-cognito-identity-provider
npm install @nestjs/passport passport-jwt
npm install @types/passport-jwt --save-dev
```

#### B. Module Auth NestJS
```typescript
// auth/auth.module.ts
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' }
    }),
    PassportModule
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
```

#### C. Service d'authentification
```typescript
// auth/auth.service.ts
@Injectable()
export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_COGNITO_REGION
    });
  }

  async signUp(email: string, password: string, userType: UserType) {
    // Implémentation inscription Cognito
  }

  async signIn(email: string, password: string) {
    // Implémentation connexion Cognito
  }

  async verifyToken(token: string) {
    // Vérification JWT token
  }
}
```

### 2. Frontend - Context et Hooks

#### A. Context d'authentification
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Implémentation du provider
}
```

#### B. Hook useAuth
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 3. Pages d'authentification

#### A. Page de connexion
```typescript
// app/login/page.tsx
export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  
  // Formulaire de connexion avec validation
}
```

#### B. Page d'inscription
```typescript
// app/signup/page.tsx
export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    userType: 'DONOR' as UserType
  });
  
  // Formulaire d'inscription multi-étapes
}
```

### 4. Protection des routes

#### A. Middleware protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  // Vérification et redirection si non authentifié
}
```

#### B. HOC ProtectedRoute
```typescript
// components/auth/ProtectedRoute.tsx
export function ProtectedRoute({ 
  children, 
  requiredRole 
}: {
  children: React.ReactNode;
  requiredRole?: UserType;
}) {
  // Vérification auth et rôle
}
```

## 📊 Types TypeScript Requis

```typescript
// types/auth.ts
export interface User {
  id: string;
  email: string;
  userType: UserType;
  profile?: UserProfile;
  tenantId?: string;
}

export type UserType = 'DONOR' | 'ASSOCIATION_ADMIN' | 'SUPER_ADMIN';

export interface SignupData {
  email: string;
  password: string;
  userType: UserType;
  firstName?: string;
  lastName?: string;
  associationName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
```

## 🗄️ Modèles Prisma Requis

```prisma
// Schema additions
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  cognitoId   String   @unique
  userType    UserType @default(DONOR)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  profile     UserProfile?
  donations   Donation[]
  favorites   UserFavorite[]
  
  @@map("users")
}

model UserProfile {
  id        String  @id @default(cuid())
  userId    String  @unique
  firstName String?
  lastName  String?
  phone     String?
  avatar    String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_profiles")
}

enum UserType {
  DONOR
  ASSOCIATION_ADMIN
  SUPER_ADMIN
}
```

## 🌍 Variables d'Environnement

```env
# AWS Cognito
AWS_COGNITO_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT
JWT_SECRET=your-super-secret-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## ✅ Critères de Validation

### Tests Backend
- [ ] Inscription utilisateur fonctionne
- [ ] Connexion utilisateur fonctionne  
- [ ] Validation JWT fonctionne
- [ ] Guards protègent les routes

### Tests Frontend
- [ ] Context Auth fonctionne
- [ ] Pages login/signup opérationnelles
- [ ] Redirection post-auth
- [ ] Gestion des erreurs

### Tests d'Intégration
- [ ] Flow complet inscription → connexion
- [ ] Protection routes sensibles
- [ ] Gestion des sessions
- [ ] Logout propre

## 🚀 Commande de Démarrage

```bash
# Backend
cd backend-hub
npm install @aws-sdk/client-cognito-identity-provider @nestjs/passport passport-jwt
npm install --save-dev @types/passport-jwt

# Frontend  
cd frontend-hub
npm install @aws-sdk/client-cognito-identity-provider
```

## 📈 Métriques de Succès

- ✅ Temps d'inscription < 30 secondes
- ✅ Temps de connexion < 5 secondes  
- ✅ 0 erreur TypeScript
- ✅ 100% des routes protégées
- ✅ Tests unitaires > 80% couverture
